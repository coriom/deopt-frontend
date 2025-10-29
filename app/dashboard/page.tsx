'use client';

import { useAccount } from 'wagmi';
import BackgroundImages from "../components/BackgroundImages";
import { useEffect, useMemo, useState } from 'react';

type Row = {
  type: 'future' | 'option';
  chainId: number;
  contractAddress: `0x${string}`;
  underlyingToken?: `0x${string}`;
  paymentToken?: `0x${string}`;
  optionType?: 'CALL' | 'PUT';
  positionSize: string;
  entryPrice: string;
  currentPrice: string | null;
  pnl: string | null;
  expiration: number | null;
  status: string;
};

function short(a?: string, n = 6) {
  if (!a) return '—';
  return a.length <= 2*n ? a : `${a.slice(0, n)}…${a.slice(-n)}`;
}

function fmtNum(x: string | null, d = 4) {
  if (x === null || x === undefined) return '—';
  try {
    const bn = BigInt(x);
    return bn.toString();
  } catch {
    const f = Number(x);
    if (!Number.isFinite(f)) return x ?? '—';
    return f.toFixed(d);
  }
}

function tsToDate(ts: number | null) {
  if (!ts) return '—';
  try {
    const d = new Date(ts * 1000);
    return d.toISOString().slice(0, 16).replace('T', ' ');
  } catch { return '—'; }
}

export default function TradeDashboard() {
  const { isConnected, address } = useAccount();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const addrParam = useMemo(() => address ? `?address=${address}` : '', [address]);

  async function load() {
    if (!address) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/my-contracts${addrParam}`, { cache: 'no-store' });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'failed');

      const fut: Row[] = (j.futures || []).map((r: any) => ({
        type: 'future',
        chainId: r.chainId,
        contractAddress: r.contractAddress,
        underlyingToken: r.underlyingToken,
        paymentToken: r.paymentToken,
        positionSize: String(r.positionSize ?? ''),
        entryPrice: String(r.entryPrice ?? ''),
        currentPrice: r.currentPrice ?? null,
        pnl: r.pnl ?? null,
        expiration: r.expiration ?? null,
        status: r.status ?? 'active',
      }));

      const opt: Row[] = (j.options || []).map((r: any) => ({
        type: 'option',
        chainId: r.chainId,
        contractAddress: r.contractAddress,
        underlyingToken: r.underlyingToken,
        paymentToken: r.paymentToken,
        optionType: r.optionType,
        positionSize: String(r.positionSize ?? ''),
        entryPrice: String(r.entryPrice ?? ''),
        currentPrice: r.currentPrice ?? null,
        pnl: r.pnl ?? null,
        expiration: r.expiration ?? null,
        status: r.status ?? 'active',
      }));

      setRows([...fut, ...opt].sort((a, b) => (b.expiration ?? 0) - (a.expiration ?? 0)));
    } catch (e: any) {
      setErr(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isConnected || !address) return;
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <BackgroundImages />

      <main className="flex-grow px-4 py-10 z-10 relative w-full">
        <div className="max-w-6xl mx-auto bg-neutral-900 rounded-xl shadow-xl p-6 md:p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Trading Dashboard</h1>

          {!isConnected ? (
            <p className="text-center text-neutral-400">
              Please connect your wallet to view your dashboard.
            </p>
          ) : (
            <>
              <div className="text-xs text-center opacity-70">
                Address: {address} {loading ? '• refreshing…' : ''} {err ? '• ' + err : ''}
              </div>

              <div className="overflow-x-auto rounded-xl border border-neutral-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-800/60">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Contract</th>
                      <th className="px-4 py-3 font-semibold">Underlying</th>
                      <th className="px-4 py-3 font-semibold">Size</th>
                      <th className="px-4 py-3 font-semibold">Entry</th>
                      <th className="px-4 py-3 font-semibold">Current</th>
                      <th className="px-4 py-3 font-semibold">P&amp;L</th>
                      <th className="px-4 py-3 font-semibold">Expiration</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr className="border-t border-neutral-800">
                        <td colSpan={9} className="px-4 py-6 text-center text-neutral-400">
                          No contracts found for this wallet (yet).
                        </td>
                      </tr>
                    )}
                    {rows.map((r, i) => (
                      <tr key={r.contractAddress + i} className="border-t border-neutral-800 hover:bg-neutral-800/30 transition">
                        <td className="px-4 py-3">
                          {r.type === 'future' ? 'Future' : `Option ${r.optionType ?? ''}`}
                        </td>
                        <td className="px-4 py-3 font-mono">{short(r.contractAddress)}</td>
                        <td className="px-4 py-3 font-mono">{short(r.underlyingToken)}</td>
                        <td className="px-4 py-3">{fmtNum(r.positionSize)}</td>
                        <td className="px-4 py-3">{fmtNum(r.entryPrice)}</td>
                        <td className="px-4 py-3">{fmtNum(r.currentPrice)}</td>
                        <td className={`px-4 py-3 ${r.pnl && r.pnl.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                          {r.pnl === null ? '—' : fmtNum(r.pnl)}
                        </td>
                        <td className="px-4 py-3">{tsToDate(r.expiration)}</td>
                        <td className="px-4 py-3 capitalize">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-neutral-900 shadow-inner z-10 relative">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-emerald-400">
          © 2025 DeOpt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
