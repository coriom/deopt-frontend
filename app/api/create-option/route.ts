export const runtime = 'nodejs'; // nécessaire pour fs (pas d'edge runtime)

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createPublicClient, http, getContract, parseAbi } from "viem";

/* ───────────────────────── CONFIG ENV ───────────────────────── */

const ownerRepo = process.env.GITHUB_REPO || "";         // ex: "coriom/DeOpt-PublicData"
const branch    = process.env.GITHUB_BRANCH || "main";
const filePath  = process.env.GITHUB_FILE_OPTIONS || "DeOptV1-contractsOptions-public.tsv";
const ghToken   = process.env.GITHUB_TOKEN || "";        // token GitHub (fine-grained ou classic)

function canUseGitHub() {
  return !!(ownerRepo && ghToken);
}

/* ─────────────────────── FICHIERS LOCAUX ────────────────────── */

const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const TSV_LOCAL_PATH = path.join(DATA_DIR, "DeOptV1-contractsOptions-local.tsv");
const BACKLOG_JSONL  = path.join(DATA_DIR, "pending_options.jsonl");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TSV_LOCAL_PATH)) {
    const header = [
      "chainId","contractAddress","optionType","strikePrice","premium","underlyingAmount",
      "expirationDate","contractExpiration","minimumMarginPercent","collateralDeposited",
      "liquidationStatus","liquidationDate","liquidatorAddress","liquidationPayoutBuyer",
      "liquidationPayoutLiquidator","txHash"
    ].join("\t") + "\n";
    fs.writeFileSync(TSV_LOCAL_PATH, header, "utf8");
  }
}
function appendLocalTSV(line: string) {
  ensureDataDir();
  fs.appendFileSync(TSV_LOCAL_PATH, line.trimEnd() + "\n", "utf8");
}
function enqueueBacklog(entry: unknown) {
  ensureDataDir();
  fs.appendFileSync(BACKLOG_JSONL, JSON.stringify(entry) + "\n", "utf8");
}

/* ─────────────────────── GITHUB HELPERS ─────────────────────── */

async function getGitHubFile() {
  const res = await fetch(
    `https://api.github.com/repos/${ownerRepo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`,
    {
      headers: { Authorization: `Bearer ${ghToken}`, "Accept": "application/vnd.github+json" },
      cache: "no-store",
    }
  );
  if (res.status === 404) return { sha: null as string | null, text: "" };
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const content = Buffer.from(json.content || "", "base64").toString("utf8");
  return { sha: json.sha as string, text: content };
}

async function putGitHubFile(contentUtf8: string, sha: string | null, message: string) {
  const body = {
    message,
    content: Buffer.from(contentUtf8, "utf8").toString("base64"),
    branch,
    ...(sha ? { sha } : {})
  };
  const res = await fetch(
    `https://api.github.com/repos/${ownerRepo}/contents/${encodeURIComponent(filePath)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${ghToken}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status} ${await res.text()}`);
  return await res.json();
}

/* ─────────────── ON-CHAIN (lecture facultative) ─────────────── */

const OPTION_ABI = parseAbi([
  "function marginInfo() view returns (uint collateralDeposited,uint minimumMarginPercent,uint minimumMarginAbsolute,bool marginInPercent,uint proposedMargin,bool marginProposalInProgress)",
  "function stateInfo() view returns (bool isCreated,bool premiumPaid,bool isExercised,bool isCancelled,bool isLiquidated)"
]);

function rpcFor(chainId: number) {
  const key = `RPC_${chainId}` as const; // ex: RPC_80002
  const url = process.env[key];
  if (!url) throw new Error(`Missing ${key} in env.local`);
  return url;
}

/* ───────────────────────── TYPES INPUT ───────────────────────── */

type PayloadIn = {
  contractAddress: `0x${string}`,
  meta: {
    txHash: `0x${string}`,
    chainId: number,
    seller: `0x${string}`,
    buyer: `0x${string}`,
    underlyingToken: `0x${string}`,
    paymentToken: `0x${string}`,
    underlyingAmount: string,
    strikePrice: string,
    premium: string,
    expiration: number,
    contractExpiration: number,
    gracePeriod: number,
    isCall: boolean,
    isAmerican: boolean,
    europeanExerciseWindow: number,
    minimumMarginPercent: number,
    description: string,
    validUntil: number
  }
};

/* ─────────────────────────── HANDLER ─────────────────────────── */

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();
    if (action !== "record") return NextResponse.json({ ok: true, skipped: true });

    // validation minimale
    const p = payload as PayloadIn;
    if (!p?.contractAddress || !p?.meta?.txHash) {
      return NextResponse.json({ ok: false, error: "missing contractAddress or txHash" }, { status: 400 });
    }
    const chainId = Number(p.meta.chainId || 0);
    if (!chainId) {
      return NextResponse.json({ ok: false, error: "missing chainId" }, { status: 400 });
    }

    // 1) Lecture on-chain minimale (best-effort)
    let collateralDeposited = "0";
    let isLiquidated = false;
    try {
      const publicClient = createPublicClient({ transport: http(rpcFor(chainId)) });
      const c = getContract({ address: p.contractAddress, abi: OPTION_ABI, client: { public: publicClient } });
      const [m, s] = await Promise.all([c.read.marginInfo(), c.read.stateInfo()]);
      collateralDeposited = (m as any)[0]?.toString?.() ?? "0";
      isLiquidated = Boolean((s as any)[4]);
    } catch {
      // si le RPC est HS ou la lecture échoue, on continue (fallback prévu)
    }

    // 2) Construire la ligne TSV
    const header = [
      "chainId","contractAddress","optionType","strikePrice","premium","underlyingAmount",
      "expirationDate","contractExpiration","minimumMarginPercent","collateralDeposited",
      "liquidationStatus","liquidationDate","liquidatorAddress","liquidationPayoutBuyer",
      "liquidationPayoutLiquidator","txHash"
    ].join("\t");

    const optionType = p.meta.isCall ? "CALL" : "PUT";
    const liqStatus  = isLiquidated ? "liquidated" : "active";

    const line = [
      String(chainId),
      p.contractAddress,
      optionType,
      p.meta.strikePrice,
      p.meta.premium,
      p.meta.underlyingAmount,
      String(p.meta.expiration),
      String(p.meta.contractExpiration),
      String(p.meta.minimumMarginPercent),
      collateralDeposited,
      liqStatus,
      "", "", "", "",                 // colonnes liquidation (remplies plus tard)
      p.meta.txHash
    ].join("\t").trim();

    // 3) Tentative GitHub (si dispo), sinon fallback local
    if (canUseGitHub()) {
      try {
        const { sha, text } = await getGitHubFile();
        const txt = text || "";
        const hasHeader = txt.trim().startsWith("chainId\t");
        const rows = txt.trim().length ? txt.trim().split(/\r?\n/) : [];
        const exists = rows.some(r => r.endsWith(p.meta.txHash));

        let out: string;
        if (!txt || !hasHeader) out = [header, line].join("\n") + "\n";
        else if (!exists)       out = txt.trimEnd() + "\n" + line + "\n";
        else                    out = txt; // déjà présent

        if (out !== txt) {
          await putGitHubFile(out, sha, `add option ${p.meta.txHash.slice(0, 10)} (${chainId})`);
        }
        return NextResponse.json({ ok: true, sink: "github" });
      } catch (ghErr: any) {
        // échec GitHub → on bascule en local
        appendLocalTSV(line);
        enqueueBacklog({
          when: Date.now(),
          reason: ghErr?.message ?? "github-error",
          payload: p,
          line
        });
        return NextResponse.json({ ok: true, sink: "local", note: "GitHub down; saved locally." });
      }
    } else {
      // GitHub non configuré → local par défaut
      appendLocalTSV(line);
      enqueueBacklog({
        when: Date.now(),
        reason: "github-not-configured",
        payload: p,
        line
      });
      return NextResponse.json({ ok: true, sink: "local", note: "GitHub not configured; saved locally." });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "failed" }, { status: 500 });
  }
}
