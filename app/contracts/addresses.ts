// frontend/app/contracts/addresses.ts
import type { Address } from 'viem';

const C137   = process.env.NEXT_PUBLIC_DEOPT_CONTRACT_137   as Address | undefined;
const C80002 = process.env.NEXT_PUBLIC_DEOPT_CONTRACT_80002 as Address | undefined;

export const CONTRACTS: Record<number, { OptionCallandPut?: Address }> = {
  137:   { OptionCallandPut: C137 },
  80002: { OptionCallandPut: C80002 },
};

export function requireContract(chainId: number): Address {
  const addr = CONTRACTS[chainId]?.OptionCallandPut;
  if (!addr) throw new Error(`DeOpt contract not configured for chain ${chainId}`);
  return addr;
}
