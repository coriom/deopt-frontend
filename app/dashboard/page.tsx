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
  optionType?: 'CALL' | 'PUT';   // pour options
  positionSize: string;          // amount / size
  entryPrice: string;            // entry/strike
  currentPrice: string | null;   // spot
  pnl: string | null;
  expiration: number | null;
  status: string;
};

function isHexAddr(x?: string | null) {
  return !!x && x.startsWith('0x') && x.length >= 42;
}
function short(a?: string, n = 6) {
  if (!a) return '—';
  return a.length <= 2*n ? a : `${a.slice(0, n)}…${a.slice(-n)}`;
}
function fmtNum(x: string | null, d = 4) {
  if (x === null || x === undefined) return '—';
  try { return BigInt(x as any).toString(); } catch {}
  const f = Number(x);
  return Number.isFinite(f) ? f.toFixed(d) : (x ?? '—');
}
function tsToDate(ts: number | null) {
  if (!ts) return '—';
  try { return new Date(ts * 1000).toISOString().slice(0,16).replace('T',' ');} catch { return '—'; }
}

export default function DashboardOnePage() {
  const { isConnected, address } = useAccount();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ----- Manager state (tout-en-un) -----
  const [selectedAddr, setSelectedAddr] = useState<string>(''); // adresse à gérer
  const [selectedType, setSelectedType] = useState<'option'|'future'>('option');

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
        positionSize: String(r.positionSize ?? ''), // amount
        entryPrice: String(r.entryPrice ?? ''),     // entry
        currentPrice: r.currentPrice ?? null,       // spot
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
        optionType: r.optionType,                   // CALL / PUT
        positionSize: String(r.positionSize ?? ''), // underlyingAmount
        entryPrice: String(r.entryPrice ?? ''),     // strike
        currentPrice: r.currentPrice ?? null,       // spot
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

  // Quand on clique "Manage" sur une ligne du tableau
  function pick(row: Row) {
    setSelectedAddr(row.contractAddress);
    setSelectedType(row.type);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <BackgroundImages />

      <main className="flex-grow px-4 py-10 z-10 relative w-full">
        <div className="max-w-6xl mx-auto bg-neutral-900 rounded-xl shadow-xl p-6 md:p-8 space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Trading Dashboard</h1>

          {!isConnected ? (
            <p className="text-center text-neutral-400">Please connect your wallet to view your dashboard.</p>
          ) : (
            <>
              <div className="text-xs text-center opacity-70">
                Address: {address} {loading ? '• refreshing…' : ''} {err ? '• ' + err : ''}
              </div>

              {/* ---- Panneau Manager (Options + Futures) ---- */}
              <div className="bg-neutral-800/40 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-end gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-neutral-300 mb-1">Contract address to manage</div>
                    <input
                      value={selectedAddr}
                      onChange={(e) => setSelectedAddr(e.target.value.trim())}
                      placeholder="0x…"
                      className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-neutral-300 mb-1">Type</div>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as 'option' | 'future')}
                      className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="option">Option</option>
                      <option value="future">Future</option>
                    </select>
                  </div>
                </div>

                {/* Actions & panneaux visibles quand l’adresse est valide */}
                {isHexAddr(selectedAddr) ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Overview */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                      <div className="text-lg font-semibold">Overview</div>
                      <div className="text-sm text-neutral-300">
                        <div><span className="opacity-60">Type:</span> {selectedType}</div>
                        <div><span className="opacity-60">Contract:</span> <span className="font-mono">{selectedAddr}</span></div>
                      </div>
                      <div className="text-xs text-neutral-400">
                        On-chain data (params, margin/health, state) will display here once we wire reads.
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                      <div className="text-lg font-semibold">Quick actions</div>

                      {selectedType === 'option' ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button className="rounded-lg px-3 py-2 bg-emerald-500 text-black font-semibold">
                            Exercise
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Propose buyback
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Add collateral
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Withdraw excess
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Recover deposit
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Liquidate
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Set oracle
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Aave config
                          </button>
                        </div>
                      ) : (
                        // FUTURES actions
                        <div className="grid grid-cols-2 gap-2">
                          <button className="rounded-lg px-3 py-2 bg-emerald-500 text-black font-semibold">
                            Settle at expiry
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Liquidate if unsafe
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Force liq after grace
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Add buyer collateral
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Add seller collateral
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Withdraw buyer collateral
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Withdraw seller collateral
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Set oracle / price decimals
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Aave: enable / config
                          </button>
                          <button className="rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700">
                            Aave: migrate / pull
                          </button>
                        </div>
                      )}

                      <div className="text-xs text-neutral-400">
                        À brancher via `writeContract` (wagmi) avec l’ABI correspondante.
                      </div>
                    </div>

                    {/* Panels data */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                      <div className="text-lg font-semibold">Parameters</div>
                      {selectedType === 'option' ? (
                        <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
                          <li>Strike, amount (underlying), premium</li>
                          <li>Exercise style (American / European window)</li>
                          <li>Expiration &amp; contract expiration</li>
                          <li>Payment token / Oracle</li>
                        </ul>
                      ) : (
                        <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
                          <li>Amount (position size) &amp; entry price</li>
                          <li>Expiration, contract expiration &amp; grace period</li>
                          <li>Initial / maintenance margin (bps)</li>
                          <li>Payment token / Oracle (priceDecimals)</li>
                        </ul>
                      )}
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                      <div className="text-lg font-semibold">Margin & Health</div>
                      {selectedType === 'option' ? (
                        <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
                          <li>Collateral deposited vs. minimum margin</li>
                          <li>Health % (bps), excess/deficit</li>
                          <li>Aave balances (cash / aToken)</li>
                        </ul>
                      ) : (
                        <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1">
                          <li>Buyer &amp; Seller collateral</li>
                          <li>Spot &amp; PnL, equities (buyer/seller)</li>
                          <li>Maintenance requirement &amp; unsafe flag</li>
                          <li>Aave balances (cash / aToken)</li>
                        </ul>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-400 pt-1">
                    Saisis/colle une adresse de contrat valide (0x…) ou sélectionne “Manage” depuis le tableau.
                  </div>
                )}
              </div>

              {/* ---- Tableau des contrats (Options + Futures) ---- */}
              <div className="overflow-x-auto rounded-xl border border-neutral-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-800/60">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Contract</th>
                      <th className="px-4 py-3 font-semibold">Underlying</th>
                      <th className="px-4 py-3 font-semibold">Size</th>
                      <th className="px-4 py-3 font-semibold">Entry/Strike</th>
                      <th className="px-4 py-3 font-semibold">Spot</th>
                      <th className="px-4 py-3 font-semibold">P&amp;L</th>
                      <th className="px-4 py-3 font-semibold">Expiration</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr className="border-t border-neutral-800">
                        <td colSpan={10} className="px-4 py-6 text-center text-neutral-400">
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
                        <td className="px-4 py-3">
                          <button
                            onClick={() => pick(r)}
                            className="text-emerald-400 hover:underline"
                          >
                            Manage
                          </button>
                        </td>
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
