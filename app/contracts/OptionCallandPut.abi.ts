import type { Abi } from 'viem';

export const OptionCallandPutAbi = [
  /* -------- EIP-712 helpers -------- */
  { "type":"function","stateMutability":"view","name":"domainSeparator","inputs":[],"outputs":[{"type":"bytes32"}]},
  { "type":"function","stateMutability":"view","name":"termsTypehash","inputs":[],"outputs":[{"type":"bytes32"}]},
  { "type":"function","stateMutability":"view","name":"pauseTypehash","inputs":[],"outputs":[{"type":"bytes32"}]},
  { "type":"function","stateMutability":"view","name":"name","inputs":[],"outputs":[{"type":"string"}]},
  { "type":"function","stateMutability":"view","name":"version","inputs":[],"outputs":[{"type":"string"}]},
  {
    "type":"function","stateMutability":"view","name":"computeDigest","inputs":[
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
    ],"outputs":[{"type":"bytes32"}]
  },
  {
    "type":"function","stateMutability":"view","name":"computePauseDigest","inputs":[
      { "type":"tuple","name":"p","components":[
        {"type":"bool","name":"pause"},
        {"type":"uint256","name":"validUntil"},
        {"type":"uint256","name":"nonceSeller"},
        {"type":"uint256","name":"nonceBuyer"}
      ]}
    ],"outputs":[{"type":"bytes32"}]
  },

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

  { "type":"function","stateMutability":"view","name":"delayInfo","inputs":[],"outputs":[
    {"type":"uint256","name":"_gracePeriod"},
    {"type":"uint256","name":"_proposedDelay"},
    {"type":"bool","name":"_delayProposalInProgress"}
  ]},

  { "type":"function","stateMutability":"view","name":"stateInfo","inputs":[],"outputs":[
    {"type":"bool"},{"type":"bool"},{"type":"bool"},{"type":"bool"},{"type":"bool"}
  ]},

  { "type":"function","stateMutability":"view","name":"buybackInfo","inputs":[],"outputs":[
    {"type":"uint256","name":"_proposedBuybackPrice"},
    {"type":"bool","name":"_buybackProposed"}
  ]},

  { "type":"function","stateMutability":"view","name":"expirationInfo","inputs":[],"outputs":[
    {"type":"uint256","name":"_proposedNewExpiration"},
    {"type":"bool","name":"_newExpirationProposed"}
  ]},

  { "type":"function","stateMutability":"view","name":"miscellaneousInfo","inputs":[],"outputs":[
    {"type":"bytes32","name":"_identifier"},
    {"type":"string","name":"_description"}
  ]},

  { "type":"function","stateMutability":"view","name":"calculateMinimumMargin","inputs":[],"outputs":[{"type":"uint256"}]},

  { "type":"function","stateMutability":"view","name":"balancesInfo","inputs":[],"outputs":[
    {"type":"uint256","name":"cash"},{"type":"uint256","name":"aave"},{"type":"uint256","name":"total"}
  ]},

  { "type":"function","stateMutability":"view","name":"marginHealth","inputs":[],"outputs":[
    {"type":"uint256","name":"minMargin"},
    {"type":"uint256","name":"collateral"},
    {"type":"uint256","name":"percentBps"},
    {"type":"int256","name":"excessOrDeficit"},
    {"type":"bool","name":"healthy"}
  ]},

  { "type":"function","stateMutability":"view","name":"marginHealthBps","inputs":[],"outputs":[{"type":"uint256"}]},

  /* -------- Additions nécessaires au front -------- */
  { "type":"function","stateMutability":"view","name":"feeRecipient","inputs":[],"outputs":[{"type":"address"}]},
  { "type":"function","stateMutability":"view","name":"oracle","inputs":[],"outputs":[{"type":"address"}]},
  { "type":"function","stateMutability":"view","name":"nonces","inputs":[{"type":"address","name":"account"}],"outputs":[{"type":"uint256"}]},
  { "type":"function","stateMutability":"view","name":"pauseNonces","inputs":[{"type":"address","name":"account"}],"outputs":[{"type":"uint256"}]},
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

  { "type":"function","stateMutability":"view","name":"requiredSellerAmount","inputs":[
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
  ],"outputs":[{"type":"uint256"}]},

  { "type":"function","stateMutability":"view","name":"requiredBuyerAmount","inputs":[
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
  ],"outputs":[{"type":"uint256"}]},

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

  /* ---------- Pause bi-signée ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"setPausedBySignatures","inputs":[
    { "type":"tuple","name":"p","components":[
      {"type":"bool","name":"pause"},
      {"type":"uint256","name":"validUntil"},
      {"type":"uint256","name":"nonceSeller"},
      {"type":"uint256","name":"nonceBuyer"}
    ]},
    {"type":"bytes","name":"sigSeller"},
    {"type":"bytes","name":"sigBuyer"}
  ],"outputs":[]},

  /* ---------- Admin utiles au front ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"allowPaymentToken","inputs":[
    {"type":"address","name":"token"},{"type":"bool","name":"allowed"}
  ],"outputs":[]},

  { "type":"function","stateMutability":"nonpayable","name":"setFeeRecipientOnce","inputs":[
    {"type":"address","name":"_recipient"}
  ],"outputs":[]},

  { "type":"function","stateMutability":"nonpayable","name":"setOracle","inputs":[
    {"type":"address","name":"_oracle"}
  ],"outputs":[]},

  /* ---------- Aave management ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"setAave","inputs":[
    {"type":"address","name":"_pool"},{"type":"address","name":"_aToken"},{"type":"bool","name":"_enabled"}
  ],"outputs":[]},

  { "type":"function","stateMutability":"nonpayable","name":"setUseAave","inputs":[
    {"type":"bool","name":"_enabled"}
  ],"outputs":[]},

  { "type":"function","stateMutability":"nonpayable","name":"migrateCashToAave","inputs":[
    {"type":"uint256","name":"amount"}
  ],"outputs":[]},

  { "type":"function","stateMutability":"nonpayable","name":"pullFromAave","inputs":[
    {"type":"uint256","name":"amount"}
  ],"outputs":[]},

  { "type":"function","stateMutability":"view","name":"aaveInfo","inputs":[],"outputs":[
    {"type":"bool","name":"_useAave"},
    {"type":"address","name":"_pool"},
    {"type":"address","name":"_aToken"},
    {"type":"uint256","name":"aBal"},
    {"type":"uint256","name":"cash"},
    {"type":"uint256","name":"total"}
  ]},

  /* ---------- Proposals / admin runtime ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"proposeNewDelay","inputs":[{"type":"uint256","name":"_newDelay"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"approveNewDelay","inputs":[],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"proposeNewMargin","inputs":[{"type":"bool","name":"inPercent"},{"type":"uint256","name":"value"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"approveNewMargin","inputs":[],"outputs":[]},

  /* ---------- Buyback / Expiry ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"proposeBuyback","inputs":[{"type":"uint256","name":"price"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"acceptBuyback","inputs":[],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"proposeNewExpiration","inputs":[{"type":"uint256","name":"_newExpiration"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"acceptNewExpiration","inputs":[],"outputs":[]},

  /* ---------- Collateral (seller) ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"withdrawExcessMargin","inputs":[{"type":"uint256","name":"amount"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"addCollateral","inputs":[{"type":"uint256","name":"amount"}],"outputs":[]},

  /* ---------- Exercise & settlements ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"exerciseOption","inputs":[],"outputs":[]},

  /* ---------- Expiry flows ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"recoverDeposit","inputs":[],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"checkExpirationAndReturnCollateral","inputs":[],"outputs":[]},

  /* ---------- Liquidations ---------- */
  { "type":"function","stateMutability":"view","name":"previewLiquidation","inputs":[],"outputs":[
    {"type":"uint256","name":"toBuyer"},
    {"type":"uint256","name":"toLiquidator"},
    {"type":"uint256","name":"available"},
    {"type":"uint256","name":"buyerTarget"},
    {"type":"uint256","name":"liquidatorMax"}
  ]},
  { "type":"function","stateMutability":"nonpayable","name":"liquidateUndercollateralized","inputs":[],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"checkExpirationAndLiquidate","inputs":[],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"forceLiquidation","inputs":[],"outputs":[]},

  /* ---------- Harvest Aave interests ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"harvestSurplus","inputs":[{"type":"uint256","name":"amount"},{"type":"address","name":"to"}],"outputs":[]},

  /* ---------- Misc / UX ---------- */
  { "type":"function","stateMutability":"view","name":"isInTheMoney","inputs":[{"type":"uint256","name":"spotPrice"}],"outputs":[{"type":"bool"}]},
  { "type":"function","stateMutability":"view","name":"isInTheMoneyNow","inputs":[],"outputs":[{"type":"bool"}]},
  { "type":"function","stateMutability":"view","name":"calculatePayoff","inputs":[{"type":"uint256","name":"spotPrice"}],"outputs":[{"type":"int256","name":"buyerPayoff"},{"type":"int256","name":"sellerPayoff"}]},
  { "type":"function","stateMutability":"view","name":"calculatePayoffNow","inputs":[],"outputs":[{"type":"int256","name":"buyerPayoff"},{"type":"int256","name":"sellerPayoff"}]},
  { "type":"function","stateMutability":"nonpayable","name":"setDescription","inputs":[{"type":"string","name":"_desc"}],"outputs":[]},

  /* ---------- Nonces bump ---------- */
  { "type":"function","stateMutability":"nonpayable","name":"bumpNonce","inputs":[],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"bumpPauseNonce","inputs":[],"outputs":[]}
] as const satisfies Abi;
