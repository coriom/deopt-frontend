// frontend/app/contracts/OptionCallandPut.abi.ts
import type { Abi } from 'viem';

export const OptionCallandPutAbi = [
  /* -------- EIP-712 helpers -------- */
  { "type":"function","stateMutability":"view","name":"domainSeparator","inputs":[],"outputs":[{"type":"bytes32"}]},
  { "type":"function","stateMutability":"view","name":"termsTypehash","inputs":[],"outputs":[{"type":"bytes32"}]},
  { "type":"function","stateMutability":"view","name":"pauseTypehash","inputs":[],"outputs":[{"type":"bytes32"}]},

  /* -------- Infos / views -------- */
  { "type":"function","stateMutability":"view","name":"actorInfo","inputs":[],"outputs":[
    {"type":"address","name":"_seller"},
    {"type":"address","name":"_buyer"},
    {"type":"address","name":"_underlyingToken"},
    {"type":"address","name":"_paymentToken"}
  ]},

  { "type":"function","stateMutability":"view","name":"optionParametersInfo","inputs":[],"outputs":[
    {"type":"uint256"},{"type":"uint256"},{"type":"uint256"},
    {"type":"uint256"},{"type":"uint256"},{"type":"bool"}
  ]},

  { "type":"function","stateMutability":"view","name":"marginInfo","inputs":[],"outputs":[
    {"type":"uint256"},{"type":"uint256"},{"type":"uint256"},
    {"type":"bool"},{"type":"uint256"},{"type":"bool"}
  ]},

  { "type":"function","stateMutability":"view","name":"stateInfo","inputs":[],"outputs":[
    {"type":"bool"},{"type":"bool"},{"type":"bool"},{"type":"bool"},{"type":"bool"}
  ]},

  { "type":"function","stateMutability":"view","name":"calculateMinimumMargin","inputs":[],"outputs":[{"type":"uint256"}]},

  { "type":"function","stateMutability":"view","name":"balancesInfo","inputs":[],"outputs":[
    {"type":"uint256","name":"cash"},{"type":"uint256","name":"aave"},{"type":"uint256","name":"total"}
  ]},

  /* -------- Additions nécessaires au front -------- */
  { "type":"function","stateMutability":"view","name":"feeRecipient","inputs":[],"outputs":[{"type":"address"}]},
  { "type":"function","stateMutability":"view","name":"oracle","inputs":[],"outputs":[{"type":"address"}]},
  { "type":"function","stateMutability":"view","name":"nonces","inputs":[{"type":"address","name":"account"}],"outputs":[{"type":"uint256"}]},
  { "type":"function","stateMutability":"view","name":"isAllowedPaymentToken","inputs":[{"type":"address","name":"token"}],"outputs":[{"type":"bool"}]},

  /* ---------- Helpers de création ---------- */
  { "type":"function","stateMutability":"view","name":"creationFees","inputs":[
    { "type":"tuple","name":"t","components":[
      {"type":"address","name":"seller"},{"type":"address","name":"buyer"},
      {"type":"address","name":"underlyingToken"},{"type":"address","name":"paymentToken"},
      {"type":"uint256","name":"underlyingAmount"},{"type":"uint256","name":"strikePrice"},
      {"type":"uint256","name":"premium"},{"type":"uint256","name":"expiration"},
      {"type":"uint256","name":"contractExpiration"},{"type":"uint256","name":"gracePeriod"},
      {"type":"bool","name":"isCall"},{"type":"bool","name":"isAmerican"},
      {"type":"uint256","name":"europeanExerciseWindow"},{"type":"uint256","name":"minimumMarginPercent"},
      {"type":"uint256","name":"nonceSeller"},{"type":"uint256","name":"nonceBuyer"},
      {"type":"string","name":"description"},{"type":"uint256","name":"validUntil"},
      {"type":"address","name":"cosigner"}
    ]}
  ],"outputs":[
    {"type":"uint256","name":"feeEachSide"},
    {"type":"uint256","name":"notional_"}
  ]},

  { "type":"function","stateMutability":"view","name":"computeCreationNeeds","inputs":[
    { "type":"tuple","name":"t","components":[
      {"type":"address","name":"seller"},{"type":"address","name":"buyer"},
      {"type":"address","name":"underlyingToken"},{"type":"address","name":"paymentToken"},
      {"type":"uint256","name":"underlyingAmount"},{"type":"uint256","name":"strikePrice"},
      {"type":"uint256","name":"premium"},{"type":"uint256","name":"expiration"},
      {"type":"uint256","name":"contractExpiration"},{"type":"uint256","name":"gracePeriod"},
      {"type":"bool","name":"isCall"},{"type":"bool","name":"isAmerican"},
      {"type":"uint256","name":"europeanExerciseWindow"},{"type":"uint256","name":"minimumMarginPercent"},
      {"type":"uint256","name":"nonceSeller"},{"type":"uint256","name":"nonceBuyer"},
      {"type":"string","name":"description"},{"type":"uint256","name":"validUntil"},
      {"type":"address","name":"cosigner"}
    ]}
  ],"outputs":[
    {"type":"uint256","name":"needSeller"},
    {"type":"uint256","name":"needBuyer"},
    {"type":"uint256","name":"feeEachSide"},
    {"type":"uint256","name":"minimumMargin"}
  ]},

  /* ---------- Vérifications côté front ---------- */
  { "type":"function","stateMutability":"view","name":"canSettleCreation","inputs":[
    { "type":"tuple","name":"t","components":[
      {"type":"address","name":"seller"},{"type":"address","name":"buyer"},
      {"type":"address","name":"underlyingToken"},{"type":"address","name":"paymentToken"},
      {"type":"uint256","name":"underlyingAmount"},{"type":"uint256","name":"strikePrice"},
      {"type":"uint256","name":"premium"},{"type":"uint256","name":"expiration"},
      {"type":"uint256","name":"contractExpiration"},{"type":"uint256","name":"gracePeriod"},
      {"type":"bool","name":"isCall"},{"type":"bool","name":"isAmerican"},
      {"type":"uint256","name":"europeanExerciseWindow"},{"type":"uint256","name":"minimumMarginPercent"},
      {"type":"uint256","name":"nonceSeller"},{"type":"uint256","name":"nonceBuyer"},
      {"type":"string","name":"description"},{"type":"uint256","name":"validUntil"},
      {"type":"address","name":"cosigner"}
    ]},
    {"type":"uint256","name":"sellerBalance"},
    {"type":"uint256","name":"buyerBalance"},
    {"type":"uint256","name":"sellerAllowance"},
    {"type":"uint256","name":"buyerAllowance"}
  ],"outputs":[
    {"type":"bool","name":"okSeller"},
    {"type":"bool","name":"okBuyer"},
    {"type":"uint256","name":"needSeller"},
    {"type":"uint256","name":"needBuyer"}
  ]},

  /* ---------- Création ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"createOptionBySignatures","inputs":[
    { "type":"tuple","name":"t","components":[
      {"type":"address","name":"seller"},{"type":"address","name":"buyer"},
      {"type":"address","name":"underlyingToken"},{"type":"address","name":"paymentToken"},
      {"type":"uint256","name":"underlyingAmount"},{"type":"uint256","name":"strikePrice"},
      {"type":"uint256","name":"premium"},{"type":"uint256","name":"expiration"},
      {"type":"uint256","name":"contractExpiration"},{"type":"uint256","name":"gracePeriod"},
      {"type":"bool","name":"isCall"},{"type":"bool","name":"isAmerican"},
      {"type":"uint256","name":"europeanExerciseWindow"},{"type":"uint256","name":"minimumMarginPercent"},
      {"type":"uint256","name":"nonceSeller"},{"type":"uint256","name":"nonceBuyer"},
      {"type":"string","name":"description"},{"type":"uint256","name":"validUntil"},
      {"type":"address","name":"cosigner"}
    ]},
    {"type":"bytes","name":"sigSeller"},
    {"type":"bytes","name":"sigBuyer"},
    {"type":"bytes","name":"sigCosigner"}
  ],"outputs":[]},

  { "type":"function","stateMutability":"nonpayable","name":"createOptionBySignaturesWithPermits","inputs":[
    { "type":"tuple","name":"t","components":[
      {"type":"address","name":"seller"},{"type":"address","name":"buyer"},
      {"type":"address","name":"underlyingToken"},{"type":"address","name":"paymentToken"},
      {"type":"uint256","name":"underlyingAmount"},{"type":"uint256","name":"strikePrice"},
      {"type":"uint256","name":"premium"},{"type":"uint256","name":"expiration"},
      {"type":"uint256","name":"contractExpiration"},{"type":"uint256","name":"gracePeriod"},
      {"type":"bool","name":"isCall"},{"type":"bool","name":"isAmerican"},
      {"type":"uint256","name":"europeanExerciseWindow"},{"type":"uint256","name":"minimumMarginPercent"},
      {"type":"uint256","name":"nonceSeller"},{"type":"uint256","name":"nonceBuyer"},
      {"type":"string","name":"description"},{"type":"uint256","name":"validUntil"},
      {"type":"address","name":"cosigner"}
    ]},
    {"type":"bytes","name":"sigSeller"},
    {"type":"bytes","name":"sigBuyer"},
    {"type":"bytes","name":"sigCosigner"},
    { "type":"tuple","name":"sellerPermit","components":[
      {"type":"uint256","name":"value"},{"type":"uint256","name":"deadline"},
      {"type":"uint8","name":"v"},{"type":"bytes32","name":"r"},{"type":"bytes32","name":"s"}
    ]},
    { "type":"tuple","name":"buyerPermit","components":[
      {"type":"uint256","name":"value"},{"type":"uint256","name":"deadline"},
      {"type":"uint8","name":"v"},{"type":"bytes32","name":"r"},{"type":"bytes32","name":"s"}
    ]}
  ],"outputs":[]},

  /* ---------- Admin utiles au front ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"allowPaymentToken","inputs":[
    {"type":"address","name":"token"},{"type":"bool","name":"allowed"}
  ],"outputs":[]},

  { "type":"function","stateMutability":"nonpayable","name":"setFeeRecipientOnce","inputs":[
    {"type":"address","name":"_recipient"}
  ],"outputs":[]}
] as const satisfies Abi;
