// Utilise une variable par réseau pour éviter les erreurs entre testnet/mainnet
const C137 = process.env.NEXT_PUBLIC_DEOPT_CONTRACT_137 as `0x${string}` | undefined;
const C80002 = process.env.NEXT_PUBLIC_DEOPT_CONTRACT_80002 as `0x${string}` | undefined;

export const CONTRACTS: Record<number, { OptionCallandPut?: `0x${string}` }> = {
  137:   { OptionCallandPut: C137 },
  80002: { OptionCallandPut: C80002 },
};
