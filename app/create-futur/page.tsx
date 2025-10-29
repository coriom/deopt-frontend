'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import BackgroundImages from "../components/BackgroundImages";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAccount, usePublicClient, useWalletClient, useWriteContract } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { DeOptFutureAbi } from '../contracts/DeOptFuture.abi';
import type { Address, Hex } from 'viem';

/* ---------- Minimal ABIs ---------- */
const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'o', type: 'address' }, { name: 's', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 's', type: 'address' }, { name: 'v', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const;

/* ---------- EIP-712 types (Terms) ---------- */
const TermsTypes = {
  Terms: [
    { name: 'seller', type: 'address' },
    { name: 'buyer', type: 'address' },
    { name: 'underlyingToken', type: 'address' },
    { name: 'paymentToken', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'entryPrice', type: 'uint256' },
    { name: 'expiration', type: 'uint256' },
    { name: 'contractExpiration', type: 'uint256' },
    { name: 'gracePeriod', type: 'uint256' },
    { name: 'initialMarginBps', type: 'uint256' },
    { name: 'maintenanceMarginBps', type: 'uint256' },
    { name: 'nonceSeller', type: 'uint256' },
    { name: 'nonceBuyer', type: 'uint256' },
    { name: 'description', type: 'string' },
    { name: 'validUntil', type: 'uint256' },
  ],
} as const;

type Terms = {
  seller: Address; buyer: Address;
  underlyingToken: Address; paymentToken: Address;
  amount: bigint; entryPrice: bigint;
  expiration: bigint; contractExpiration: bigint; gracePeriod: bigint;
  initialMarginBps: bigint; maintenanceMarginBps: bigint;
  nonceSeller: bigint; nonceBuyer: bigint;
  description: string; validUntil: bigint;
};

function makeDomain(chainId: number, verifyingContract: Address) {
  return { name: 'DeOptFuture', version: '1', chainId, verifyingContract } as const;
}

const timezones = ['UTC','Europe/Paris','America/New_York','Asia/Tokyo','Europe/London','America/Los_Angeles'];

export default function CreateFuture() {
  /* ------- UI state ------- */
  const [entryPrice, setEntryPrice] = useState('');
  const [expiration, setExpiration] = useState<Date | null>(new Date());
  const [contractExpiration, setContractExpiration] = useState<Date | null>(new Date());
  const [amount, setAmount] = useState('');
  const [initialMarginBps, setInitialMarginBps] = useState('1000');   // 10% par défaut
  const [maintenanceMarginBps, setMaintenanceMarginBps] = useState('500'); // 5% par défaut
  const [gracePeriod, setGracePeriod] = useState(0);
  const [timezone, setTimezone] = useState('UTC');
  const [buyer, setBuyer] = useState<`0x${string}` | ''>('');
  const [underlyingToken, setUnderlyingToken] = useState<`0x${string}` | ''>('');
  const [paymentToken, setPaymentToken] = useState<`0x${string}` | ''>('');
  const [description, setDescription] = useState('DeOpt future');
  const [validUntil, setValidUntil] = useState<Date | null>(new Date(Date.now() + 60 * 60 * 1000));
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  /* ------- Web3 ------- */
  const { address: connected, chain, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync, isPending } = useWriteContract();

  const contract = useMemo(
    () => (chain ? CONTRACTS[chain.id]?.DeOptFuture : undefined),
    [chain]
  );

  /* ------- On-chain state ------- */
  const [nonceSeller, setNonceSeller] = useState<bigint>(BigInt(0));
  const [nonceBuyer, setNonceBuyer] = useState<bigint>(BigInt(0));
  const [paymentAllowed, setPaymentAllowed] = useState<boolean | null>(null);

  /* ------- Previews & precheck ------- */
  const [tokenDecimals, setTokenDecimals] = useState<{ underlying?: number; payment?: number }>({});
  const [precheck, setPrecheck] = useState<null | {
    okSeller: boolean; okBuyer: boolean;
    needSeller: bigint; needBuyer: bigint;
    sellerBalance: bigint; buyerBalance: bigint;
    sellerAllowance: bigint; buyerAllowance: bigint;
  }>(null);

  /* ------- Signatures ------- */
  const sigSellerRef = useRef<Hex | null>(null);
  const sigBuyerRef = useRef<Hex | null>(null);

  const now = new Date();
  const toUnix = (d: Date | null) => BigInt(Math.floor(((d ?? now).getTime()) / 1000));
  const minutesToSeconds = (m: number) => BigInt(Math.max(0, Math.floor(m * 60)));

  async function signTermsFor(account: Address, t: Terms, domain: any) {
    if (!walletClient) throw new Error('Wallet non disponible');
    const typed = { domain, primaryType: 'Terms' as const, types: TermsTypes, message: t };
    return walletClient.signTypedData({ account, ...typed });
  }

  /* ---------- helpers ---------- */
  const readView = async <T,>(fn: string, args?: any[]): Promise<T | null> => {
    if (!publicClient || !contract) return null;
    try {
      const base = { address: contract as Address, abi: DeOptFutureAbi, functionName: fn as any } as const;
      const params = (args && args.length > 0) ? { ...base, args: args as any } : base;
      const res = await publicClient.readContract(params as any);
      return res as T;
    } catch { return null; }
  };

  const refreshState = async () => {
    if (!publicClient || !contract) return;

    // nonces
    if (connected) {
      try {
        const nS = await publicClient.readContract({
          address: contract as Address, abi: DeOptFutureAbi, functionName: 'nonces', args: [connected as Address],
        }) as bigint;
        setNonceSeller(nS ?? BigInt(0));
      } catch { setNonceSeller(BigInt(0)); }
    }
    if (buyer) {
      try {
        const nB = await publicClient.readContract({
          address: contract as Address, abi: DeOptFutureAbi, functionName: 'nonces', args: [buyer as Address],
        }) as bigint;
        setNonceBuyer(nB ?? BigInt(0));
      } catch { setNonceBuyer(BigInt(0)); }
    } else setNonceBuyer(BigInt(0));

    // allowlist
    if (paymentToken) {
      try {
        const allowed = await publicClient.readContract({
          address: contract as Address, abi: DeOptFutureAbi, functionName: 'isAllowedPaymentToken', args: [paymentToken as Address],
        }) as boolean;
        setPaymentAllowed(allowed);
      } catch { setPaymentAllowed(null); }
    } else setPaymentAllowed(null);

    // decimals
    const decs: any = {};
    try {
      if (underlyingToken) {
        decs.underlying = await publicClient.readContract({
          address: underlyingToken as Address, abi: ERC20_ABI, functionName: 'decimals',
        }) as number;
      }
    } catch {}
    try {
      if (paymentToken) {
        decs.payment = await publicClient.readContract({
          address: paymentToken as Address, abi: ERC20_ABI, functionName: 'decimals',
        }) as number;
      }
    } catch {}
    setTokenDecimals(decs);
  };

  useEffect(() => {
    setErrorMessage(''); setInfoMessage('');
  }, [chain, connected]);

  useEffect(() => {
    refreshState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, connected, buyer, paymentToken, underlyingToken]);

  /* ---------- maths précheck ---------- */
  function notional(entry: bigint, amt: bigint, underlyingDec = 18) {
    if (!underlyingDec || underlyingDec <= 0) return entry * amt;
    const scale = BigInt(10) ** BigInt(underlyingDec);
    return (entry * amt) / scale;
  }
  const FEE_BPS = 2n; // 0.02% par côté

  async function runPrecheck(t: Terms) {
    if (!publicClient || !contract || !paymentToken || !underlyingToken) { setPrecheck(null); return; }

    // balances / allowances
    const [sellerBal, buyerBal, sellerAllw, buyerAllw] = await Promise.all([
      publicClient.readContract({ address: paymentToken as Address, abi: ERC20_ABI, functionName: 'balanceOf', args: [t.seller] }) as Promise<bigint>,
      publicClient.readContract({ address: paymentToken as Address, abi: ERC20_ABI, functionName: 'balanceOf', args: [t.buyer]  }) as Promise<bigint>,
      publicClient.readContract({ address: paymentToken as Address, abi: ERC20_ABI, functionName: 'allowance', args: [t.seller, contract as Address] }) as Promise<bigint>,
      publicClient.readContract({ address: paymentToken as Address, abi: ERC20_ABI, functionName: 'allowance', args: [t.buyer,  contract as Address] }) as Promise<bigint>,
    ]);

    // besoin par côté = initialMargin(notional@entry) + feeEach
    const uDec = tokenDecimals.underlying ?? 18;
    const notion = notional(t.entryPrice, t.amount, uDec);                   // en "payment decimals" neutre (ratio)
    const feeEach = (notion * FEE_BPS) / 10000n;
    const requiredPerSide = (notion * t.initialMarginBps) / 10000n;
    const needPer = requiredPerSide + feeEach;

    const okS = (sellerBal >= needPer) && (sellerAllw >= needPer);
    const okB = (buyerBal  >= needPer) && (buyerAllw  >= needPer);

    setPrecheck({
      okSeller: okS, okBuyer: okB,
      needSeller: needPer, needBuyer: needPer,
      sellerBalance: sellerBal, buyerBalance: buyerBal,
      sellerAllowance: sellerAllw, buyerAllowance: buyerAllw,
    });
  }

  /* ---------- actions ---------- */
  const allowPayment = async () => {
    if (!contract || !paymentToken) return;
    try {
      await writeContractAsync({
        address: contract as Address,
        abi: DeOptFutureAbi,
        functionName: 'allowPaymentToken',
        args: [paymentToken as Address, true],
      });
      setInfoMessage('Payment token allowed.');
      await refreshState();
    } catch (e: any) {
      setErrorMessage(e?.shortMessage || e?.message || 'allowPaymentToken failed.');
    }
  };

  const approveToken = async (who: 'seller' | 'buyer', amount: bigint) => {
    if (!paymentToken || !contract) return;
    const from = who === 'seller' ? (connected as Address) : (buyer as Address);
    if (!from) { setErrorMessage(`Connect as ${who} to approve.`); return; }
    try {
      await writeContractAsync({
        address: paymentToken as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contract as Address, amount],
      });
      setInfoMessage(`Approve ${who} OK.`);
      await refreshState();
    } catch (e: any) {
      setErrorMessage(e?.shortMessage || e?.message || 'Approve failed.');
    }
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); setInfoMessage('');

    const now = new Date();

    if (!isConnected) return setErrorMessage('Please connect your wallet before submitting.');
    if (!contract) return setErrorMessage('No contract address configured for this network.');

    if (!entryPrice || !expiration || !contractExpiration || !amount ||
        !buyer || !underlyingToken || !paymentToken || !initialMarginBps || !maintenanceMarginBps) {
      return setErrorMessage('Please fill in all required fields.');
    }
    if (Number(initialMarginBps) <= 0 || Number(maintenanceMarginBps) <= 0) {
      return setErrorMessage('Margins (bps) must be > 0.');
    }
    if (Number(initialMarginBps) < Number(maintenanceMarginBps)) {
      return setErrorMessage('Initial margin must be ≥ maintenance margin.');
    }
    if (expiration < now || contractExpiration < now) {
      return setErrorMessage('Expiration dates must be in the future.');
    }
    if (!connected) return setErrorMessage('No connected account.');

    // Build Terms
    const t: Terms = {
      seller: connected as Address,
      buyer: buyer as Address,
      underlyingToken: underlyingToken as Address,
      paymentToken: paymentToken as Address,
      amount: BigInt(amount),
      entryPrice: BigInt(entryPrice),
      expiration: toUnix(expiration),
      contractExpiration: toUnix(contractExpiration),
      gracePeriod: minutesToSeconds(gracePeriod),
      initialMarginBps: BigInt(initialMarginBps),
      maintenanceMarginBps: BigInt(maintenanceMarginBps),
      nonceSeller: nonceSeller ?? BigInt(0),
      nonceBuyer: nonceBuyer ?? BigInt(0),
      description,
      validUntil: toUnix(validUntil),
    };

    const domain = makeDomain(chain!.id, contract!);

    // Precheck (balances/allowances, needs)
    await runPrecheck(t);

    // Extra guard: allowlist
    if (paymentAllowed === false) {
      return setErrorMessage('Payment token not in allowlist. Seller must allow it first.');
    }

    try {
      // 1) Signature SELLER
      if (!sigSellerRef.current) {
        const sigS = await signTermsFor(t.seller, t, domain);
        sigSellerRef.current = sigS as Hex;
      }
      // 2) Signature BUYER
      if (!sigBuyerRef.current) {
        if (t.buyer.toLowerCase() !== t.seller.toLowerCase()) {
          try {
            const sigB = await signTermsFor(t.buyer, t, domain);
            sigBuyerRef.current = sigB as Hex;
          } catch {
            setErrorMessage(
              'Seller signature done. Please connect as BUYER (' + t.buyer +
              ') and click Confirm again to add the buyer signature.'
            );
            return;
          }
        } else {
          const sigB = await signTermsFor(t.buyer, t, domain);
          sigBuyerRef.current = sigB as Hex;
        }
      }

      const sigSeller = sigSellerRef.current!;
      const sigBuyer  = sigBuyerRef.current!;

      // 3) Appel on-chain
      const txHash = await writeContractAsync({
        address: contract!,
        abi: DeOptFutureAbi,
        functionName: 'createFutureBySignatures',
        args: [t, sigSeller, sigBuyer],
      });

      // 4) Enregistrement (GitHub + fallback local)
      try {
        await fetch('/api/create-future', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'record',
            payload: {
              contractAddress: contract!,
              meta: {
                txHash,
                chainId: chain!.id,
                seller: t.seller,
                buyer: t.buyer,
                underlyingToken: t.underlyingToken,
                paymentToken: t.paymentToken,
                amount: t.amount.toString(),
                entryPrice: t.entryPrice.toString(),
                expiration: Number(t.expiration),
                contractExpiration: Number(t.contractExpiration),
                gracePeriod: Number(t.gracePeriod),
                initialMarginBps: Number(t.initialMarginBps),
                maintenanceMarginBps: Number(t.maintenanceMarginBps),
                description: t.description,
                validUntil: Number(t.validUntil),
              },
            },
          }),
        });
      } catch {}

      // reset
      sigSellerRef.current = null;
      sigBuyerRef.current = null;
      setInfoMessage('Future created! Tx: ' + txHash);
      await refreshState();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.shortMessage || err?.message || 'Transaction failed.');
    }
  };

  const marginInvalid =
    !initialMarginBps || !maintenanceMarginBps ||
    isNaN(Number(initialMarginBps)) || isNaN(Number(maintenanceMarginBps)) ||
    Number(initialMarginBps) <= 0 || Number(maintenanceMarginBps) <= 0 ||
    Number(initialMarginBps) < Number(maintenanceMarginBps);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <BackgroundImages />

      <main className="flex-grow flex items-center justify-center px-4 py-10 z-10 relative">
        <form onSubmit={handleSubmit} className="bg-neutral-900 p-8 rounded-xl shadow-xl w-full max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">Create New Future</h2>

          <div className="text-xs opacity-70">
            Network: {chain?.name ?? '—'} • Contract: {contract ?? 'not configured'}
          </div>

          {(errorMessage || infoMessage) && (
            <div className={errorMessage ? "text-red-500 text-center font-semibold" : "text-emerald-400 text-center font-semibold"}>
              {errorMessage || infoMessage}
            </div>
          )}

          {/* Parties & tokens */}
          <div className="grid grid-cols-1 gap-2">
            <div className="text-sm opacity-80">Seller (connected): {connected ?? '—'}</div>

            <input
              type="text" placeholder="Buyer address (0x...)"
              value={buyer} onChange={e => setBuyer(e.target.value as any)}
              className="bg-neutral-800 p-2 rounded w-full"
            />

            <input
              type="text" placeholder="Underlying token (ERC20 address)"
              value={underlyingToken} onChange={e => setUnderlyingToken(e.target.value as any)}
              className="bg-neutral-800 p-2 rounded w-full"
            />

            <div className="flex gap-2">
              <input
                type="text" placeholder="Payment token (ERC20 address)"
                value={paymentToken} onChange={e => setPaymentToken(e.target.value as any)}
                className="bg-neutral-800 p-2 rounded w-full"
              />
              {paymentAllowed === false && (
                <button
                  type="button" onClick={allowPayment}
                  className="bg-amber-400 text-black px-3 rounded"
                  title="Seller must allow this payment token"
                >
                  Allow
                </button>
              )}
            </div>
          </div>

          <input
            type="number"
            placeholder="Entry / Futures Price"
            value={entryPrice}
            onChange={e => setEntryPrice(e.target.value)}
            className="bg-neutral-800 p-2 rounded w-full"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block mb-1">Expiration ({timezone})</span>
              <DatePicker
                selected={expiration ?? undefined}
                onChange={(date) => setExpiration(date ?? null)}
                showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="Pp"
                className="bg-neutral-800 p-2 rounded w-full"
              />
            </label>

            <label className="block">
              <span className="block mb-1">Contract Expiration ({timezone})</span>
              <DatePicker
                selected={contractExpiration ?? undefined}
                onChange={(date) => setContractExpiration(date ?? null)}
                showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="Pp"
                className="bg-neutral-800 p-2 rounded w-full"
              />
            </label>
          </div>

          <div>
            <label className="block mb-1">Timezone</label>
            <select
              value={timezone} onChange={(e) => setTimezone(e.target.value)}
              className="bg-neutral-800 p-2 rounded w-full"
            >
              {timezones.map(tz => (<option key={tz} value={tz}>{tz}</option>))}
            </select>
          </div>

          <input
            type="number"
            placeholder="Underlying Amount (units)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bg-neutral-800 p-2 rounded w-full"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Initial Margin (bps, e.g. 1000 = 10%)"
              value={initialMarginBps}
              onChange={e => setInitialMarginBps(e.target.value)}
              className={`bg-neutral-800 p-2 rounded w-full ${marginInvalid ? 'ring-1 ring-red-500' : ''}`}
            />
            <input
              type="number"
              placeholder="Maintenance Margin (bps, e.g. 500 = 5%)"
              value={maintenanceMarginBps}
              onChange={e => setMaintenanceMarginBps(e.target.value)}
              className={`bg-neutral-800 p-2 rounded w-full ${marginInvalid ? 'ring-1 ring-red-500' : ''}`}
            />
          </div>
          {marginInvalid && (
            <p className="text-red-500 text-sm">Initial ≥ Maintenance, and both &gt; 0.</p>
          )}

          <div>
            <label>Grace Period (minutes)</label>
            <input
              type="number"
              placeholder="Grace Period"
              value={gracePeriod}
              onChange={e => setGracePeriod(Number(e.target.value))}
              className="bg-neutral-800 p-2 rounded w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-neutral-800 p-2 rounded w-full"
            />
            <label className="block">
              <span className="block mb-1">Valid Until (signatures)</span>
              <DatePicker
                selected={validUntil ?? undefined}
                onChange={(date) => setValidUntil(date ?? null)}
                showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="Pp"
                className="bg-neutral-800 p-2 rounded w-full"
              />
            </label>
          </div>

          {/* Nonces auto */}
          <div className="text-xs bg-neutral-800 rounded p-3 border border-neutral-700">
            <div><b>Nonce Seller (auto):</b> {nonceSeller?.toString?.() ?? '—'}</div>
            <div><b>Nonce Buyer (auto):</b> {nonceBuyer?.toString?.() ?? '—'}</div>
            <div className="opacity-70">Les nonces sont lus on-chain (pas de saisie manuelle).</div>
          </div>

          {/* Precheck + Approves */}
          {precheck && (
            <div className="text-xs bg-neutral-800 rounded p-3 border border-neutral-700 space-y-2">
              <div><b>Seller</b> • balance={precheck.sellerBalance.toString()} • allowance={precheck.sellerAllowance.toString()} • need={precheck.needSeller.toString()} • {precheck.okSeller ? 'OK' : 'MISSING'}</div>
              {!precheck.okSeller && (
                <button
                  type="button"
                  className="bg-emerald-500 text-black py-1 px-3 rounded hover:bg-emerald-600"
                  onClick={() => approveToken('seller', precheck.needSeller)}
                >
                  Approve Seller
                </button>
              )}
              <div><b>Buyer</b> • balance={precheck.buyerBalance.toString()} • allowance={precheck.buyerAllowance.toString()} • need={precheck.needBuyer.toString()} • {precheck.okBuyer ? 'OK' : 'MISSING'}</div>
              {!precheck.okBuyer && (
                <button
                  type="button"
                  className="bg-emerald-500 text-black py-1 px-3 rounded hover:bg-emerald-600"
                  onClick={() => approveToken('buyer', precheck.needBuyer)}
                >
                  Approve Buyer
                </button>
              )}
              <div className="opacity-70">Conseil : faites les approves avant de soumettre la création.</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || marginInvalid}
            className={`py-2 px-4 rounded transition w-full ${
              (isPending || marginInvalid)
                ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                : 'bg-emerald-500 text-black hover:bg-emerald-600'
            }`}
            title={marginInvalid ? 'Initial ≥ Maintenance, et > 0' : 'Confirm'}
            onClick={() => {
              // déclenche une pré-lecture avant la soumission
              if (isConnected && contract && buyer && paymentToken && underlyingToken && entryPrice && amount) {
                const t: Terms = {
                  seller: connected as Address,
                  buyer: buyer as Address,
                  underlyingToken: underlyingToken as Address,
                  paymentToken: paymentToken as Address,
                  amount: BigInt(amount || '0'),
                  entryPrice: BigInt(entryPrice || '0'),
                  expiration: toUnix(expiration),
                  contractExpiration: toUnix(contractExpiration),
                  gracePeriod: minutesToSeconds(gracePeriod),
                  initialMarginBps: BigInt(initialMarginBps || '0'),
                  maintenanceMarginBps: BigInt(maintenanceMarginBps || '0'),
                  nonceSeller: nonceSeller ?? BigInt(0),
                  nonceBuyer: nonceBuyer ?? BigInt(0),
                  description,
                  validUntil: toUnix(validUntil),
                };
                runPrecheck(t);
              }
            }}
          >
            {isPending ? 'Creating…' : 'Confirm'}
          </button>

          <p className="text-xs opacity-70 text-center">
            Tip: if Buyer is a different wallet, sign once as Seller, then switch to Buyer ({buyer || '0x…'}) and click again.
          </p>
        </form>
      </main>

      <footer className="bg-neutral-900 shadow-inner z-10 relative">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-emerald-400">
          © 2025 DeOpt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
