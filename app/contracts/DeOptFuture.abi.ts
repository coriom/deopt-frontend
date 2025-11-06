import type { Abi } from 'viem';

export const DeOptFutureAbi = [
  /* ───────────── EIP-712 helpers ───────────── */
  { "type":"function","stateMutability":"view","name":"domainSeparator","inputs":[],"outputs":[{ "type":"bytes32" }]},
  { "type":"function","stateMutability":"view","name":"name","inputs":[],"outputs":[{ "type":"string" }]},
  { "type":"function","stateMutability":"view","name":"version","inputs":[],"outputs":[{ "type":"string" }]},
  {
    "type":"function","stateMutability":"view","name":"computeDigest","inputs":[
      { "type":"tuple","name":"t","components":[
        { "type":"address","name":"seller" },
        { "type":"address","name":"buyer" },
        { "type":"address","name":"underlyingToken" },
        { "type":"address","name":"paymentToken" },
        { "type":"uint256","name":"amount" },
        { "type":"uint256","name":"entryPrice" },
        { "type":"uint256","name":"expiration" },
        { "type":"uint256","name":"contractExpiration" },
        { "type":"uint256","name":"gracePeriod" },
        { "type":"uint256","name":"initialMarginBps" },
        { "type":"uint256","name":"maintenanceMarginBps" },
        { "type":"uint256","name":"nonceSeller" },
        { "type":"uint256","name":"nonceBuyer" },
        { "type":"string","name":"description" },
        { "type":"uint256","name":"validUntil" }
      ]}
    ],"outputs":[{ "type":"bytes32" }]
  },

  /* ───────────── Public getters (state) ───────────── */
  { "type":"function","stateMutability":"view","name":"seller","inputs":[],"outputs":[{ "type":"address" }]},
  { "type":"function","stateMutability":"view","name":"buyer","inputs":[],"outputs":[{ "type":"address" }]},
  { "type":"function","stateMutability":"view","name":"paymentToken","inputs":[],"outputs":[{ "type":"address" }]},
  { "type":"function","stateMutability":"view","name":"underlyingToken","inputs":[],"outputs":[{ "type":"address" }]},
  { "type":"function","stateMutability":"view","name":"isAllowedPaymentToken","inputs":[{ "type":"address","name":"token"}],"outputs":[{ "type":"bool"}]},
  { "type":"function","stateMutability":"view","name":"oracle","inputs":[],"outputs":[{ "type":"address" }]},
  { "type":"function","stateMutability":"view","name":"priceDecimals","inputs":[],"outputs":[{ "type":"uint8" }]},

  { "type":"function","stateMutability":"view","name":"aavePool","inputs":[],"outputs":[{ "type":"address" }]},
  { "type":"function","stateMutability":"view","name":"aToken","inputs":[],"outputs":[{ "type":"address" }]},
  { "type":"function","stateMutability":"view","name":"useAave","inputs":[],"outputs":[{ "type":"bool" }]},

  { "type":"function","stateMutability":"view","name":"amount","inputs":[],"outputs":[{ "type":"uint256" }]},
  { "type":"function","stateMutability":"view","name":"entryPrice","inputs":[],"outputs":[{ "type":"uint256" }]},
  { "type":"function","stateMutability":"view","name":"expiration","inputs":[],"outputs":[{ "type":"uint256" }]},
  { "type":"function","stateMutability":"view","name":"contractExpiration","inputs":[],"outputs":[{ "type":"uint256" }]},
  { "type":"function","stateMutability":"view","name":"gracePeriod","inputs":[],"outputs":[{ "type":"uint256" }]},

  { "type":"function","stateMutability":"view","name":"initialMarginBps","inputs":[],"outputs":[{ "type":"uint256" }]},
  { "type":"function","stateMutability":"view","name":"maintenanceMarginBps","inputs":[],"outputs":[{ "type":"uint256" }]},

  { "type":"function","stateMutability":"view","name":"buyerCollateral","inputs":[],"outputs":[{ "type":"uint256" }]},
  { "type":"function","stateMutability":"view","name":"sellerCollateral","inputs":[],"outputs":[{ "type":"uint256" }]},

  { "type":"function","stateMutability":"view","name":"isCreated","inputs":[],"outputs":[{ "type":"bool" }]},
  { "type":"function","stateMutability":"view","name":"isClosed","inputs":[],"outputs":[{ "type":"bool" }]},
  { "type":"function","stateMutability":"view","name":"paused","inputs":[],"outputs":[{ "type":"bool" }]},

  { "type":"function","stateMutability":"view","name":"identifier","inputs":[],"outputs":[{ "type":"bytes32" }]},
  { "type":"function","stateMutability":"view","name":"description","inputs":[],"outputs":[{ "type":"string" }]},
  { "type":"function","stateMutability":"view","name":"nonces","inputs":[{ "type":"address","name":"account"}],"outputs":[{ "type":"uint256"}]},

  { "type":"function","stateMutability":"view","name":"feeRecipient","inputs":[],"outputs":[{ "type":"address" }]},
  { "type":"function","stateMutability":"view","name":"feeBps","inputs":[],"outputs":[{ "type":"uint256" }]},
  { "type":"function","stateMutability":"view","name":"liquidationFeeBps","inputs":[],"outputs":[{ "type":"uint256" }]},

  /* ───────────── Views calculées ───────────── */
  { "type":"function","stateMutability":"view","name":"spotNow","inputs":[],"outputs":[{ "type":"uint256" }]},
  { "type":"function","stateMutability":"view","name":"pnlNow","inputs":[],"outputs":[
    { "type":"int256","name":"pnlBuyer" },
    { "type":"uint256","name":"spot" }
  ]},
  { "type":"function","stateMutability":"view","name":"equitiesNow","inputs":[],"outputs":[
    { "type":"int256","name":"buyerEq" },
    { "type":"int256","name":"sellerEq" },
    { "type":"uint256","name":"notionCur" },
    { "type":"uint256","name":"maintReq" }
  ]},
  { "type":"function","stateMutability":"view","name":"marginHealth","inputs":[],"outputs":[
    { "type":"uint256","name":"spot" },
    { "type":"int256","name":"buyerEq" },
    { "type":"int256","name":"sellerEq" },
    { "type":"uint256","name":"maintReq" },
    { "type":"bool","name":"unsafe" }
  ]},
  { "type":"function","stateMutability":"view","name":"previewLiquidation","inputs":[],"outputs":[
    { "type":"uint256","name":"spot" },
    { "type":"int256","name":"pnlBuyer" },
    { "type":"int256","name":"buyerEq" },
    { "type":"int256","name":"sellerEq" },
    { "type":"uint256","name":"maintReq" },
    { "type":"uint256","name":"liqFee" }
  ]},

  /* ───────────── Création (signatures) ───────────── */
  {
    "type":"function","stateMutability":"nonpayable","name":"createFutureBySignatures","inputs":[
      { "type":"tuple","name":"t","components":[
        { "type":"address","name":"seller" },
        { "type":"address","name":"buyer" },
        { "type":"address","name":"underlyingToken" },
        { "type":"address","name":"paymentToken" },
        { "type":"uint256","name":"amount" },
        { "type":"uint256","name":"entryPrice" },
        { "type":"uint256","name":"expiration" },
        { "type":"uint256","name":"contractExpiration" },
        { "type":"uint256","name":"gracePeriod" },
        { "type":"uint256","name":"initialMarginBps" },
        { "type":"uint256","name":"maintenanceMarginBps" },
        { "type":"uint256","name":"nonceSeller" },
        { "type":"uint256","name":"nonceBuyer" },
        { "type":"string","name":"description" },
        { "type":"uint256","name":"validUntil" }
      ]},
      { "type":"bytes","name":"sigSeller" },
      { "type":"bytes","name":"sigBuyer" }
    ],"outputs":[]
  },
  {
    "type":"function","stateMutability":"nonpayable","name":"createFutureBySignaturesWithPermits","inputs":[
      { "type":"tuple","name":"t","components":[
        { "type":"address","name":"seller" },
        { "type":"address","name":"buyer" },
        { "type":"address","name":"underlyingToken" },
        { "type":"address","name":"paymentToken" },
        { "type":"uint256","name":"amount" },
        { "type":"uint256","name":"entryPrice" },
        { "type":"uint256","name":"expiration" },
        { "type":"uint256","name":"contractExpiration" },
        { "type":"uint256","name":"gracePeriod" },
        { "type":"uint256","name":"initialMarginBps" },
        { "type":"uint256","name":"maintenanceMarginBps" },
        { "type":"uint256","name":"nonceSeller" },
        { "type":"uint256","name":"nonceBuyer" },
        { "type":"string","name":"description" },
        { "type":"uint256","name":"validUntil" }
      ]},
      { "type":"bytes","name":"sigSeller" },
      { "type":"bytes","name":"sigBuyer" },
      { "type":"tuple","name":"permitSeller","components":[
        { "type":"uint256","name":"value" },
        { "type":"uint256","name":"deadline" },
        { "type":"uint8","name":"v" },
        { "type":"bytes32","name":"r" },
        { "type":"bytes32","name":"s" }
      ]},
      { "type":"tuple","name":"permitBuyer","components":[
        { "type":"uint256","name":"value" },
        { "type":"uint256","name":"deadline" },
        { "type":"uint8","name":"v" },
        { "type":"bytes32","name":"r" },
        { "type":"bytes32","name":"s" }
      ]}
    ],"outputs":[]
  },
  { "type":"function","stateMutability":"nonpayable","name":"bumpNonce","inputs":[],"outputs":[]},

  /* ───────────── Admin / config ───────────── */
  { "type":"function","stateMutability":"nonpayable","name":"setLiquidationFeeBps","inputs":[{ "type":"uint256","name":"bps"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"allowPaymentToken","inputs":[{ "type":"address","name":"token"},{ "type":"bool","name":"allowed"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"setOracle","inputs":[{ "type":"address","name":"_oracle"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"setPriceDecimals","inputs":[{ "type":"uint8","name":"d"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"setAave","inputs":[
    { "type":"address","name":"_pool" },
    { "type":"address","name":"_aToken" },
    { "type":"bool","name":"_enabled" }
  ],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"setUseAave","inputs":[{ "type":"bool","name":"_enabled"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"setPaused","inputs":[{ "type":"bool","name":"p"}],"outputs":[]},

  /* ───────────── Aave ops ───────────── */
  { "type":"function","stateMutability":"nonpayable","name":"migrateCashToAave","inputs":[{ "type":"uint256","name":"amount_"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"pullFromAave","inputs":[{ "type":"uint256","name":"amount_"}],"outputs":[]},

  /* ───────────── Collateral ops ───────────── */
  { "type":"function","stateMutability":"nonpayable","name":"addBuyerCollateral","inputs":[{ "type":"uint256","name":"v"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"addSellerCollateral","inputs":[{ "type":"uint256","name":"v"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"withdrawBuyerCollateral","inputs":[{ "type":"uint256","name":"v"}],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"withdrawSellerCollateral","inputs":[{ "type":"uint256","name":"v"}],"outputs":[]},

  /* ───────────── Settlement / Liquidation ───────────── */
  { "type":"function","stateMutability":"nonpayable","name":"settleAtExpiry","inputs":[],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"liquidateIfUnsafe","inputs":[],"outputs":[]},
  { "type":"function","stateMutability":"nonpayable","name":"checkExpirationAndLiquidate","inputs":[],"outputs":[]}
] as const satisfies Abi;
