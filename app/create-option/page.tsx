'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import BackgroundImages from "../components/BackgroundImages";
import DatePicker from 'react-datepicker';
import { useAccount, usePublicClient, useWalletClient, useWriteContract } from 'wagmi';
import { CONTRACTS } from '../contracts/addresses';
import { OptionCallandPutAbi } from '../contracts/OptionCallandPut.abi';
import type { Address, Hex } from 'viem';

/* ---------- Minimal ABIs ---------- */
const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'o', type: 'address' }, { name: 's', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 's', type: 'address' }, { name: 'v', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const;

const ORACLE_ABI = [
  { type: 'function', name: 'latestPrice', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const;

/* ---------- EIP-712 types (Terms) ---------- */
const TermsTypes = {
  Terms: [
    { name: 'seller', type: 'address' },
    { name: 'buyer', type: 'address' },
    { name: 'underlyingToken', type: 'address' },
    { name: 'paymentToken', type: 'address' },
    { name: 'underlyingAmount', type: 'uint256' },
    { name: 'strikePrice', type: 'uint256' },
    { name: 'premium', type: 'uint256' },
    { name: 'expiration', type: 'uint256' },
    { name: 'contractExpiration', type: 'uint256' },
    { name: 'gracePeriod', type: 'uint256' },
    { name: 'isCall', type: 'bool' },
    { name: 'isAmerican', type: 'bool' },
    { name: 'europeanExerciseWindow', type: 'uint256' },
    { name: 'minimumMarginPercent', type: 'uint256' },
    { name: 'nonceSeller', type: 'uint256' },
    { name: 'nonceBuyer', type: 'uint256' },
    { name: 'description', type: 'string' },
    { name: 'validUntil', type: 'uint256' },
    { name: 'cosigner', type: 'address' },
  ],
} as const;

type Terms = {
  seller: Address; buyer: Address;
  underlyingToken: Address; paymentToken: Address;
  underlyingAmount: bigint; strikePrice: bigint; premium: bigint;
  expiration: bigint; contractExpiration: bigint; gracePeriod: bigint;
  isCall: boolean; isAmerican: boolean; europeanExerciseWindow: bigint;
  minimumMarginPercent: bigint; nonceSeller: bigint; nonceBuyer: bigint;
  description: string; validUntil: bigint; cosigner: Address;
};

function makeDomain(chainId: number, verifyingContract: Address) {
  return { name: 'DeOpt', version: '1', chainId, verifyingContract } as const;
}

export default function CreateOption() {
  /* ------- UI state ------- */
  const [strikePrice, setStrikePrice] = useState('');
  const [expiration, setExpiration] = useState<Date | null>(new Date());
  const [contractExpiration, setContractExpiration] = useState<Date | null>(new Date());
  const [premium, setPremium] = useState('');
  const [underlyingAmount, setUnderlyingAmount] = useState('');
  const [marginValue, setMarginValue] = useState('101'); // >=101
  const [gracePeriod, setGracePeriod] = useState(0);
  const [isCall, setIsCall] = useState(true);
  const [isAmerican, setIsAmerican] = useState(true);
  const [europeanExerciseWindow, setEuropeanExerciseWindow] = useState(0);
  const [buyer, setBuyer] = useState<`0x${string}` | ''>('');
  const [underlyingToken, setUnderlyingToken] = useState<`0x${string}` | ''>('');
  const [paymentToken, setPaymentToken] = useState<`0x${string}` | ''>('');
  const [description, setDescription] = useState('DeOpt option');
  const [validUntil, setValidUntil] = useState<Date | null>(new Date(Date.now() + 60 * 60 * 1000));
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  /* ------- Derived / Web3 ------- */
  const { address: connected, chain, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync, isPending } = useWriteContract();

  const contract = useMemo(
    () => (chain ? CONTRACTS[chain.id]?.OptionCallandPut : undefined),
    [chain]
  );

  /* ------- On-chain state ------- */
  const [nonceSeller, setNonceSeller] = useState<bigint>(BigInt(0));
  const [nonceBuyer, setNonceBuyer] = useState<bigint>(BigInt(0));
  const [isCreated, setIsCreated] = useState<boolean | null>(null);
  const [feeRecipient, setFeeRecipient] = useState<Address | null>(null);
  const [oracleAddr, setOracleAddr] = useState<Address | null>(null);
  const [spot, setSpot] = useState<bigint | null>(null);
  const [paymentAllowed, setPaymentAllowed] = useState<boolean | null>(null);

  /* ------- computeCreationNeeds preview ------- */
  const [needs, setNeeds] = useState<null | {
    needSeller: bigint; needBuyer: bigint; feeEachSide: bigint; minimumMargin: bigint;
  }>(null);

  /* ------- canSettleCreation precheck ------- */
  const [precheck, setPrecheck] = useState<null | {
    okSeller: boolean; okBuyer: boolean; needSeller: bigint; needBuyer: bigint;
    sellerBalance: bigint; buyerBalance: bigint; sellerAllowance: bigint; buyerAllowance: bigint;
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

  /* ---------- Helpers: reads (corrigé: args optionnel) ---------- */
  const readContractView = async <T,>(fn: string, args?: any[]): Promise<T | null> => {
    if (!publicClient || !contract) return null;
    try {
      const base = {
        address: contract as Address,
        abi: OptionCallandPutAbi,
        functionName: fn as any,
      } as const;

      const params = (args && args.length > 0)
        ? { ...base, args: args as any }
        : base;

      const res = await publicClient.readContract(params as any);
      return res as T;
    } catch {
      return null;
    }
  };

  const refreshState = async () => {
    if (!publicClient || !contract) return;

    // stateInfo()
    const st = await readContractView<[boolean, boolean, boolean, boolean, boolean]>('stateInfo');
    if (st) setIsCreated(st[0]);

    // feeRecipient
    try {
      const fr = await publicClient.readContract({
        address: contract as Address,
        abi: OptionCallandPutAbi,
        functionName: 'feeRecipient',
        args: [],
      }) as Address;
      setFeeRecipient(fr && fr !== '0x0000000000000000000000000000000000000000' ? fr : null);
    } catch {}

    // oracle & spot
    try {
      const or = await publicClient.readContract({
        address: contract as Address,
        abi: OptionCallandPutAbi,
        functionName: 'oracle',
        args: [],
      }) as Address;
      if (or && or !== '0x0000000000000000000000000000000000000000') {
        setOracleAddr(or);
        try {
          const s = await publicClient.readContract({
            address: or,
            abi: ORACLE_ABI,
            functionName: 'latestPrice',
            args: [],
          }) as bigint;
          setSpot(s);
        } catch {}
      } else {
        setOracleAddr(null);
        setSpot(null);
      }
    } catch {}

    // nonces
    if (connected) {
      try {
        const nS = await publicClient.readContract({
          address: contract as Address,
          abi: OptionCallandPutAbi,
          functionName: 'nonces',
          args: [connected as Address],
        }) as bigint;
        setNonceSeller(nS ?? BigInt(0));
      } catch { setNonceSeller(BigInt(0)); }
    }
    if (buyer) {
      try {
        const nB = await publicClient.readContract({
          address: contract as Address,
          abi: OptionCallandPutAbi,
          functionName: 'nonces',
          args: [buyer as Address],
        }) as bigint;
        setNonceBuyer(nB ?? BigInt(0));
      } catch { setNonceBuyer(BigInt(0)); }
    } else {
      setNonceBuyer(BigInt(0));
    }

    // allowlist
    if (paymentToken) {
      try {
        const allowed = await publicClient.readContract({
          address: contract as Address,
          abi: OptionCallandPutAbi,
          functionName: 'isAllowedPaymentToken',
          args: [paymentToken as Address],
        }) as boolean;
        setPaymentAllowed(allowed);
      } catch { setPaymentAllowed(null); }
    } else setPaymentAllowed(null);
  };

  /* ---------- compute needs + precheck ---------- */
  const previewNeeds = async (t: Terms) => {
    if (!publicClient || !contract) return;
    try {
      const res = await publicClient.readContract({
        address: contract as Address,
        abi: OptionCallandPutAbi,
        functionName: 'computeCreationNeeds',
        args: [t],
      }) as [bigint, bigint, bigint, bigint];
      const [needSeller, needBuyer, feeEachSide, minimumMargin] = res;
      setNeeds({ needSeller, needBuyer, feeEachSide, minimumMargin });
    } catch {
      setNeeds(null);
    }
  };

  const runPrecheck = async (t: Terms) => {
    if (!publicClient || !contract || !paymentToken) { setPrecheck(null); return; }
    try {
      const [sellerBal, buyerBal, sellerAllw, buyerAllw] = await Promise.all([
        publicClient.readContract({ address: paymentToken as Address, abi: ERC20_ABI, functionName: 'balanceOf', args: [t.seller] }) as Promise<bigint>,
        publicClient.readContract({ address: paymentToken as Address, abi: ERC20_ABI, functionName: 'balanceOf', args: [t.buyer]  }) as Promise<bigint>,
        publicClient.readContract({ address: paymentToken as Address, abi: ERC20_ABI, functionName: 'allowance', args: [t.seller, contract as Address] }) as Promise<bigint>,
        publicClient.readContract({ address: paymentToken as Address, abi: ERC20_ABI, functionName: 'allowance', args: [t.buyer,  contract as Address] }) as Promise<bigint>,
      ]);

      const res = await publicClient.readContract({
        address: contract as Address,
        abi: OptionCallandPutAbi,
        functionName: 'canSettleCreation',
        args: [t, sellerBal, buyerBal, sellerAllw, buyerAllw],
      }) as [boolean, boolean, bigint, bigint];

      const [okSeller, okBuyer, needSeller, needBuyer] = res;
      setPrecheck({ okSeller, okBuyer, needSeller, needBuyer, sellerBalance: sellerBal, buyerBalance: buyerBal, sellerAllowance: sellerAllw, buyerAllowance: buyerAllw });
    } catch {
      setPrecheck(null);
    }
  };

  /* ---------- Approve helpers ---------- */
  const approveToken = async (who: 'seller' | 'buyer', amount: bigint) => {
    if (!paymentToken || !contract) return;
    const spender = contract as Address;
    const from = who === 'seller' ? (connected as Address) : (buyer as Address);
    if (!from) { setErrorMessage(`Connect as ${who} to approve.`); return; }
    try {
      await writeContractAsync({
        address: paymentToken as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount],
      });
      setInfoMessage(`Approve ${who} OK.`);
      await refreshState();
    } catch (e: any) {
      setErrorMessage(e?.shortMessage || e?.message || 'Approve failed.');
    }
  };

  /* ---------- Allowlist helper ---------- */
  const allowPayment = async () => {
    if (!contract || !paymentToken) return;
    try {
      await writeContractAsync({
        address: contract as Address,
        abi: OptionCallandPutAbi,
        functionName: 'allowPaymentToken',
        args: [paymentToken as Address, true],
      });
      setInfoMessage('Payment token allowed.');
      await refreshState();
    } catch (e: any) {
      setErrorMessage(e?.shortMessage || e?.message || 'allowPaymentToken failed.');
    }
  };

  /* ---------- Fee recipient helper (optionnel) ---------- */
  const setFeeRecipientOnce = async (recipient: Address) => {
    if (!contract) return;
    try {
      await writeContractAsync({
        address: contract as Address,
        abi: OptionCallandPutAbi,
        functionName: 'setFeeRecipientOnce',
        args: [recipient],
      });
      setInfoMessage('Fee recipient set.');
      await refreshState();
    } catch (e: any) {
      setErrorMessage(e?.shortMessage || e?.message || 'setFeeRecipientOnce failed.');
    }
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    setErrorMessage('');
    setInfoMessage('');
  }, [chain, connected]);

  useEffect(() => {
    refreshState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, connected, buyer, paymentToken]);

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!isConnected) return setErrorMessage('Please connect your wallet before submitting.');
    if (!contract) return setErrorMessage('No contract address configured for this network.');
    if (isCreated) return setErrorMessage('This contract instance has already created an option. Deploy a fresh instance.');

    if (!strikePrice || !expiration || !contractExpiration || !premium ||
        !underlyingAmount || !marginValue || !buyer || !underlyingToken || !paymentToken) {
      return setErrorMessage('Please fill in all required fields.');
    }
    if (Number(marginValue) < 101) return setErrorMessage('Margin must be at least 101%.');
    if (expiration < new Date() || contractExpiration < new Date()) return setErrorMessage('Expiration dates must be in the future.');
    if (!connected) return setErrorMessage('No connected account.');

    // Sanity strike vs oracle
    if (oracleAddr && spot !== null && spot > BigInt(0)) {
      const sp = BigInt(strikePrice);
      const low = spot / BigInt(100);
      const high = spot * BigInt(200);
      if (!(sp >= low && sp <= high)) {
        return setErrorMessage(`Strike out of oracle range. Must be in [${low.toString()}, ${high.toString()}].`);
      }
    }

    // Build Terms
    const t: Terms = {
      seller: connected as Address,
      buyer: buyer as Address,
      underlyingToken: underlyingToken as Address,
      paymentToken: paymentToken as Address,
      underlyingAmount: BigInt(underlyingAmount),
      strikePrice: BigInt(strikePrice),
      premium: BigInt(premium),
      expiration: toUnix(expiration),
      contractExpiration: toUnix(contractExpiration),
      gracePeriod: minutesToSeconds(gracePeriod),
      isCall,
      isAmerican,
      europeanExerciseWindow: minutesToSeconds(isAmerican ? 0 : europeanExerciseWindow),
      minimumMarginPercent: BigInt(marginValue),
      nonceSeller: nonceSeller ?? BigInt(0),
      nonceBuyer: nonceBuyer ?? BigInt(0),
      description,
      validUntil: toUnix(validUntil),
      cosigner: '0x0000000000000000000000000000000000000000',
    };

    const domain = makeDomain(chain!.id, contract!);

    // Preview + precheck
    await previewNeeds(t);
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
      const sigCosigner = '0x';

      // 3) Appel on-chain
      const txHash = await writeContractAsync({
        address: contract!,
        abi: OptionCallandPutAbi,
        functionName: 'createOptionBySignatures',
        args: [t, sigSeller, sigBuyer, sigCosigner],
      });

      // 4) Enregistrement GitHub via backend (non bloquant)
      try {
        await fetch('/api/create-option', {
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
                underlyingAmount: t.underlyingAmount.toString(),
                strikePrice: t.strikePrice.toString(),
                premium: t.premium.toString(),
                expiration: Number(t.expiration),
                contractExpiration: Number(t.contractExpiration),
                gracePeriod: Number(t.gracePeriod),
                isCall: t.isCall,
                isAmerican: t.isAmerican,
                europeanExerciseWindow: Number(t.europeanExerciseWindow),
                minimumMarginPercent: Number(t.minimumMarginPercent),
                description: t.description,
                validUntil: Number(t.validUntil),
                nonces: { seller: Number(t.nonceSeller), buyer: Number(t.nonceBuyer) },
                needs: needs ? {
                  needSeller: needs.needSeller.toString(),
                  needBuyer: needs.needBuyer.toString(),
                  feeEachSide: needs.feeEachSide.toString(),
                  minimumMargin: needs.minimumMargin.toString(),
                } : null,
                precheck,
                feeRecipient: feeRecipient ?? null,
                oracle: oracleAddr ?? null,
                spot: spot ? spot.toString() : null,
                paymentAllowed,
              },
            },
          }),
        });
      } catch {}

      // 5) Reset
      sigSellerRef.current = null;
      sigBuyerRef.current = null;
      setInfoMessage('Option created! Tx: ' + txHash);
      await refreshState();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.shortMessage || err?.message || 'Transaction failed.');
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <BackgroundImages />

      <main className="flex-grow flex items-center justify-center px-4 py-10 z-10 relative">
        <form onSubmit={handleSubmit} className="bg-neutral-900 p-8 rounded-xl shadow-xl w-full max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">Create New Option</h2>

          <div className="text-xs opacity-70">
            Network: {chain?.name ?? '—'} • Contract: {contract ?? 'not configured'}
          </div>

          {isCreated && (
            <div className="text-amber-400 text-center font-semibold">
              This contract instance already created an option (isCreated=true).  
              Deploy a fresh instance before creating another option.
            </div>
          )}

          {feeRecipient ? (
            <div className="text-xs text-emerald-400">Fees enabled • feeRecipient: {feeRecipient}</div>
          ) : (
            <div className="text-xs opacity-60">No fees (feeRecipient not set)</div>
          )}

          {oracleAddr ? (
            <div className="text-xs">
              Oracle: {oracleAddr} {spot ? `• spot=${spot.toString()}` : '• spot: —'}
            </div>
          ) : (
            <div className="text-xs opacity-60">No oracle configured</div>
          )}

          {(errorMessage || infoMessage) && (
            <div className={errorMessage ? "text-red-500 text-center font-semibold" : "text-emerald-400 text-center font-semibold"}>
              {errorMessage || infoMessage}
            </div>
          )}

          {/* Parties & tokens */}
          <div className="grid grid-cols-1 gap-2">
            <div className="text-sm opacity-80">Seller (connected): {connected ?? '—'}</div>

            <input
              type="text"
              placeholder="Buyer address (0x...)"
              value={buyer}
              onChange={e => setBuyer(e.target.value as any)}
              className="bg-neutral-800 p-2 rounded w-full"
            />

            <input
              type="text"
              placeholder="Underlying token (ERC20 address)"
              value={underlyingToken}
              onChange={e => setUnderlyingToken(e.target.value as any)}
              className="bg-neutral-800 p-2 rounded w-full"
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Payment token (ERC20 address)"
                value={paymentToken}
                onChange={e => setPaymentToken(e.target.value as any)}
                className="bg-neutral-800 p-2 rounded w-full"
              />
              {paymentAllowed === false && (
                <button
                  type="button"
                  onClick={allowPayment}
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
            placeholder="Strike Price"
            value={strikePrice}
            onChange={e => setStrikePrice(e.target.value)}
            className="bg-neutral-800 p-2 rounded w-full"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block mb-1">Expiration (UTC)</span>
              <DatePicker
                selected={expiration ?? undefined}
                onChange={(date) => setExpiration(date ?? null)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="Pp"
                className="bg-neutral-800 p-2 rounded w-full"
              />
            </label>

            <label className="block">
              <span className="block mb-1">Contract Expiration (UTC)</span>
              <DatePicker
                selected={contractExpiration ?? undefined}
                onChange={(date) => setContractExpiration(date ?? null)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="Pp"
                className="bg-neutral-800 p-2 rounded w-full"
              />
            </label>
          </div>

          <input
            type="number"
            placeholder="Premium"
            value={premium}
            onChange={e => setPremium(e.target.value)}
            className="bg-neutral-800 p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Underlying Amount"
            value={underlyingAmount}
            onChange={e => setUnderlyingAmount(e.target.value)}
            className="bg-neutral-800 p-2 rounded w-full"
          />

          <input
            type="number"
            placeholder="Margin Percentage (%) — min 101%"
            value={marginValue}
            onChange={e => setMarginValue(e.target.value)}
            className="bg-neutral-800 p-2 rounded w-full"
          />

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

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span>Option Type</span>
              <select
                value={isCall ? 'call' : 'put'}
                onChange={(e) => setIsCall(e.target.value === 'call')}
                className="bg-neutral-800 p-2 rounded"
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span>Exercise Style</span>
              <select
                value={isAmerican ? 'american' : 'european'}
                onChange={(e) => setIsAmerican(e.target.value === 'american')}
                className="bg-neutral-800 p-2 rounded"
              >
                <option value="american">American</option>
                <option value="european">European</option>
              </select>
            </label>
          </div>

          {!isAmerican && (
            <div>
              <label>European Exercise Window (minutes)</label>
              <input
                type="number"
                placeholder="Exercise Window"
                value={europeanExerciseWindow}
                onChange={e => setEuropeanExerciseWindow(Number(e.target.value))}
                className="bg-neutral-800 p-2 rounded w-full"
              />
            </div>
          )}

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
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="Pp"
                className="bg-neutral-800 p-2 rounded w-full"
              />
            </label>
          </div>

          {/* Nonces auto (lecture on-chain) */}
          <div className="text-xs bg-neutral-800 rounded p-3 border border-neutral-700">
            <div><b>Nonce Seller (auto):</b> {nonceSeller?.toString?.() ?? '—'}</div>
            <div><b>Nonce Buyer (auto):</b> {nonceBuyer?.toString?.() ?? '—'}</div>
            <div className="opacity-70">Les nonces sont lus on-chain (pas de saisie manuelle).</div>
          </div>

          {/* Aperçu besoins */}
          {needs && (
            <div className="text-xs bg-neutral-800 rounded p-3 border border-neutral-700">
              <div><b>Need Seller:</b> {needs.needSeller.toString()}</div>
              <div><b>Need Buyer:</b> {needs.needBuyer.toString()}</div>
              <div><b>Fee Each Side:</b> {needs.feeEachSide.toString()}</div>
              <div><b>Minimum Margin:</b> {needs.minimumMargin.toString()}</div>
            </div>
          )}

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
            disabled={isPending}
            className="bg-emerald-500 text-black py-2 px-4 rounded hover:bg-emerald-600 transition w-full"
          >
            {isPending ? 'Creating…' : 'Confirm'}
          </button>

          <p className="text-xs opacity-70 text-center">
            Tip: if Buyer is a different wallet, sign once as Seller, then switch to Buyer ({buyer || '0x…'}) and click again.
          </p>

          {/* (Optionnel) Set Fee Recipient rapide */}
          <details className="text-xs opacity-80">
            <summary className="cursor-pointer">Set fee recipient (seller only)</summary>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="fee recipient (0x...)"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value as any as Address;
                    if (val) await setFeeRecipientOnce(val);
                  }
                }}
                className="bg-neutral-800 p-2 rounded w-full"
              />
              <span className="opacity-60 self-center">Press Enter</span>
            </div>
          </details>
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
