import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const underlying = process.env.UNDERLYING_TOKEN!;
  const payment    = process.env.PAYMENT_TOKEN!;
  if (!underlying || !payment) throw new Error("UNDERLYING_TOKEN & PAYMENT_TOKEN requis");

  const F = await hre.ethers.getContractFactory("OptionCallandPut");
  const c = await F.deploy(underlying, payment);
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log("OptionCallandPut:", addr);

  const art = await hre.artifacts.readArtifact("OptionCallandPut");

  // écrire ABI + addresses dans le dossier parent (utilisés par ton front)
  const FRONT = path.join(__dirname, "..", "..");
  fs.writeFileSync(
    path.join(FRONT, "OptionCallandPut.abi.ts"),
    `import type { Abi } from 'viem';\nexport const OptionCallandPutAbi = ${JSON.stringify(art.abi)} as unknown as Abi;\n`
  );

  const net = await hre.ethers.provider.getNetwork();
  const chainId = Number(net.chainId);
  const addrFile = path.join(FRONT, "addresses.ts");

  let map: Record<number, { OptionCallandPut: `0x${string}` }> = {};
  if (fs.existsSync(addrFile)) {
    const raw = fs.readFileSync(addrFile, "utf8").trim();
    try { map = JSON.parse(raw); }
    catch { const m = raw.match(/\{[\s\S]*\}/); if (m) map = JSON.parse(m[0]); }
  }
  map[chainId] = { OptionCallandPut: addr as `0x${string}` };

  fs.writeFileSync(
    addrFile,
    `export const CONTRACTS: Record<number, { OptionCallandPut: \`0x\${string}\` }> = ${JSON.stringify(map, null, 2)} as any;`
  );
  console.log("addresses.ts mis à jour (chainId", chainId, ")");
}

main().catch((e) => { console.error(e); process.exit(1); });
