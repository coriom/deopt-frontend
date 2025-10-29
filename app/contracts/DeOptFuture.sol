// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*──────────────────────────────────────────────────────────────────────
   Interfaces & Utils
──────────────────────────────────────────────────────────────────────*/

interface IPriceOracle {
    /// @dev Must return a spot price scaled to `targetDecimals` agreed off-chain.
    function latestPrice() external view returns (uint256);
}

// Minimal IERC20
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address a) external view returns (uint256);
    function allowance(address o, address s) external view returns (uint256);
    function transfer(address to, uint256 v) external returns (bool);
    function transferFrom(address f, address t, uint256 v) external returns (bool);
    function approve(address s, uint256 v) external returns (bool);
}

interface IERC20Permit {
    function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s) external;
}

interface IERC20Metadata is IERC20 {
    function decimals() external view returns (uint8);
}

/*──────────────────────────────────────────────────────────────────────
   Aave v3
──────────────────────────────────────────────────────────────────────*/
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}
interface IAaveAToken {
    function balanceOf(address) external view returns (uint256);
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);
}

/*──────────────────────────────────────────────────────────────────────
   Errors
──────────────────────────────────────────────────────────────────────*/
error ZeroAddress();
error NotSeller();
error NotBuyer();
error BadState();
error NotCreated();
error Initialized();
error SignaturesExpired();
error NonceMismatch();
error InvalidParam();
error ContractExpired();
error NotExpired();
error AmountZero();
error AaveNotConfigured();
error AaveDisabled();
error AaveWithdrawZero();
error NetShort();
error PaymentTokenNotAllowed(address token);
error Paused();

// SafeERC20
error SafeTransferFailed();
error SafeTransferFromFailed();
error SafeApproveZeroFailed();
error SafeApproveFailed();

// Reentrancy
error Reentrancy();

/*──────────────────────────────────────────────────────────────────────
   SafeERC20 (errors)
──────────────────────────────────────────────────────────────────────*/
library SafeERC20 {
    function safeTransfer(IERC20 t, address to, uint256 v) internal {
        (bool ok, bytes memory d) = address(t).call(abi.encodeWithSelector(t.transfer.selector, to, v));
        if (!(ok && (d.length == 0 || abi.decode(d, (bool))))) revert SafeTransferFailed();
    }
    function safeTransferFrom(IERC20 t, address from, address to, uint256 v) internal {
        (bool ok, bytes memory d) = address(t).call(abi.encodeWithSelector(t.transferFrom.selector, from, to, v));
        if (!(ok && (d.length == 0 || abi.decode(d, (bool))))) revert SafeTransferFromFailed();
    }
    function safeApprove(IERC20 t, address spender, uint256 v) internal {
        (bool ok1, bytes memory d1) = address(t).call(abi.encodeWithSelector(t.approve.selector, spender, 0));
        if (!(ok1 && (d1.length == 0 || abi.decode(d1, (bool))))) revert SafeApproveZeroFailed();
        (bool ok2, bytes memory d2) = address(t).call(abi.encodeWithSelector(t.approve.selector, spender, v));
        if (!(ok2 && (d2.length == 0 || abi.decode(d2, (bool))))) revert SafeApproveFailed();
    }
}
using SafeERC20 for IERC20;

/*──────────────────────────────────────────────────────────────────────
   ReentrancyGuard
──────────────────────────────────────────────────────────────────────*/
abstract contract ReentrancyGuard {
    uint private constant _NOT_ENTERED = 1;
    uint private constant _ENTERED = 2;
    uint private _status;
    constructor() { _status = _NOT_ENTERED; }
    modifier nonReentrant() {
        if (_status == _ENTERED) revert Reentrancy();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/*──────────────────────────────────────────────────────────────────────
   ECDSA (errors)
──────────────────────────────────────────────────────────────────────*/
library ECDSA {
    error InvalidSigLength();
    error InvalidS();
    error InvalidV();
    error BadSig();

    // secp256k1n/2 (low-s requirement)
    uint256 constant _HALF_ORDER = 0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;

    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) revert InvalidSigLength();
        bytes32 r; bytes32 s; uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        return recover(hash, v, r, s);
    }

    function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address) {
        if (uint256(s) > _HALF_ORDER) revert InvalidS();
        if (v != 27 && v != 28) revert InvalidV();
        address signer = ecrecover(hash, v, r, s);
        if (signer == address(0)) revert BadSig();
        return signer;
    }
}
using ECDSA for bytes32;

/*──────────────────────────────────────────────────────────────────────
   Futur linéaire (cash-settled)
──────────────────────────────────────────────────────────────────────*/
contract DeOptFuture is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /* ───── Access / pause ───── */
    modifier onlySeller() { if (msg.sender != seller) revert NotSeller(); _; }
    modifier onlyBuyer()  { if (msg.sender != buyer)  revert NotBuyer();  _; }
    modifier whenNotPaused() { if (paused) revert Paused(); _; }

    /* ───── Parties & Tokens ───── */
    address public seller;
    address public buyer;

    IERC20 public paymentToken;     // token de règlement/marge (ex: USDC)
    IERC20 public underlyingToken;  // sous-jacent (ex: WBTC) — informatif pour amount/decimals
    mapping(address => bool) public isAllowedPaymentToken;

    /* ───── Oracle & pricing ───── */
    IPriceOracle public oracle;     // retourne un spot avec des décimales convenues (priceDecimals)
    uint8 public priceDecimals;     // décimales du prix de l’oracle
    event OracleUpdated(address indexed newOracle);
    event PriceDecimalsSet(uint8 d);

    /* ───── Aave ───── */
    IAavePool   public aavePool;
    IAaveAToken public aToken;
    bool        public useAave;
    event AaveConfigured(address pool, address aToken, bool enabled);
    event AaveSupplied(uint256 amount);
    event AaveWithdrawn(uint256 amount, address to);

    /* ───── Params du futur ───── */
    uint256 public amount;          // quantité d'underlying
    uint256 public entryPrice;      // prix d'entrée (strike-like)
    uint256 public expiration;      // timestamp d'expiration
    uint256 public contractExpiration; // date de fin du contrat (peut >= expiration)
    uint256 public gracePeriod;     // période de grâce post contractExpiration

    // Marges
    uint256 public initialMarginBps;     // marge initiale requise par côté (ex: 1000 = 10%)
    uint256 public maintenanceMarginBps; // marge de maintenance (ex: 500 = 5%)

    // Collatéral par côté
    uint256 public buyerCollateral;  // collatéral net du buyer (long)
    uint256 public sellerCollateral; // collatéral net du seller (short)

    // Etat
    bool public isCreated;
    bool public isClosed; // settled ou liquidated
    bool public paused;

    // Divers
    bytes32 public identifier;
    string  public description;
    mapping(address => uint256) public nonces;

    // Frais création (2 bps de notionnel, prélevés sur chaque côté)
    address public feeRecipient;              // fixé au déploiement (même logique que l’option)
    uint256 public constant feeBps = 2;       // 0.02% par côté
    event FeeRecipientSet(address indexed who);
    event FeePaid(address indexed from, uint256 amount);

    // Liquidation fee (reward au liquidateur) — en bps du notionnel courant
    uint256 public liquidationFeeBps = 100;   // 1% par défaut
    event LiquidationFeeBpsSet(uint256 bps);

    // Payment token allowlist
    event PaymentTokenAllowed(address token, bool allowed);

    /* ───── Events ───── */
    event FutureCreated(
        address indexed seller,
        address indexed buyer,
        address paymentToken,
        address underlyingToken,
        uint256 amount,
        uint256 entryPrice,
        uint256 expiration,
        uint256 contractExpiration,
        uint256 initialMarginBps,
        uint256 maintenanceMarginBps
    );
    event CollateralAdded(address indexed who, uint256 amount);
    event CollateralWithdrawn(address indexed who, uint256 amount);
    event FutureSettled(
        uint256 spot,
        int256  pnlBuyer,
        uint256 paidToBuyer,
        uint256 paidToSeller,
        uint256 buyerRefund,
        uint256 sellerRefund
    );
    event FutureLiquidated(
        address indexed liquidator,
        uint256 spot,
        int256  pnlBuyer,
        uint256 paidToBuyer,
        uint256 paidToSeller,
        uint256 liquidatorFee
    );
    event PausedSet(bool paused);

    /* ───── EIP-712 ───── */
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant NAME_HASH    = keccak256("DeOptFuture");
    bytes32 private constant VERSION_HASH = keccak256("1");

    bytes32 private constant TERMS_TYPEHASH = keccak256(
        "Terms(address seller,address buyer,address underlyingToken,address paymentToken,uint256 amount,uint256 entryPrice,uint256 expiration,uint256 contractExpiration,uint256 gracePeriod,uint256 initialMarginBps,uint256 maintenanceMarginBps,uint256 nonceSeller,uint256 nonceBuyer,string description,uint256 validUntil)"
    );

    bytes32 private immutable _DOMAIN_SEPARATOR;

    /* ───── Ctor ───── */
    constructor(address _underlyingToken, address _paymentToken) {
        if (_underlyingToken == address(0) || _paymentToken == address(0)) revert ZeroAddress();
        seller = msg.sender;
        underlyingToken = IERC20(_underlyingToken);
        paymentToken    = IERC20(_paymentToken);
        identifier = keccak256(abi.encodePacked(block.timestamp, seller, address(this)));

        _DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                NAME_HASH,
                VERSION_HASH,
                block.chainid,
                address(this)
            )
        );

        // feeRecipient fixé au déploiement
        feeRecipient = 0x8B87aECC9413C2c5b853e81AA94b60990e7aBdbE;
        emit FeeRecipientSet(feeRecipient);
    }

    function domainSeparator() external view returns (bytes32) { return _DOMAIN_SEPARATOR; }
    function name() external pure returns (string memory) { return "DeOptFuture"; }
    function version() external pure returns (string memory) { return "1"; }

    /* ───── Admin léger ───── */

    // NOTE: feeRecipient est figé au déploiement dans cette version (évite la fonction once).

    function setLiquidationFeeBps(uint256 bps) external onlySeller whenNotPaused {
        if (bps > 200) revert InvalidParam(); // cap 2%
        liquidationFeeBps = bps;
        emit LiquidationFeeBpsSet(bps);
    }

    function allowPaymentToken(address token, bool allowed) external onlySeller whenNotPaused {
        if (token == address(0)) revert ZeroAddress();
        isAllowedPaymentToken[token] = allowed;
        emit PaymentTokenAllowed(token, allowed);
    }

    function setOracle(address _oracle) external onlySeller whenNotPaused {
        if (_oracle == address(0)) revert ZeroAddress();
        oracle = IPriceOracle(_oracle);
        emit OracleUpdated(_oracle);
    }

    function setPriceDecimals(uint8 d) external onlySeller whenNotPaused {
        if (d == 0 || d > 36) revert InvalidParam();
        priceDecimals = d;
        emit PriceDecimalsSet(d);
    }

    function setAave(address _pool, address _aToken, bool _enabled) external onlySeller whenNotPaused {
        if (_pool == address(0) || _aToken == address(0)) revert ZeroAddress();
        IAaveAToken at = IAaveAToken(_aToken);
        try at.UNDERLYING_ASSET_ADDRESS() returns (address u) {
            if (u != address(paymentToken)) revert InvalidParam();
        } catch { revert InvalidParam(); }
        aavePool = IAavePool(_pool);
        aToken   = at;
        useAave  = _enabled;
        emit AaveConfigured(_pool, _aToken, _enabled);
    }

    function setUseAave(bool _enabled) external onlySeller whenNotPaused {
        if (_enabled && (address(aavePool) == address(0) || address(aToken) == address(0))) revert AaveNotConfigured();
        useAave = _enabled;
        emit AaveConfigured(address(aavePool), address(aToken), _enabled);
    }

    // ✅ Corrigé: peut dépauser même si déjà en pause
    function setPaused(bool p) external {
        if (msg.sender != seller) revert NotSeller();
        paused = p;
        emit PausedSet(p);
    }

    /* ───── Terms / signatures ───── */

    struct Terms {
        address seller;
        address buyer;
        address underlyingToken;
        address paymentToken;
        uint256 amount;
        uint256 entryPrice;
        uint256 expiration;
        uint256 contractExpiration;
        uint256 gracePeriod;
        uint256 initialMarginBps;
        uint256 maintenanceMarginBps;
        uint256 nonceSeller;
        uint256 nonceBuyer;
        string  description;
        uint256 validUntil;
    }

    struct PermitData {
        uint256 value;
        uint256 deadline;
        uint8 v; bytes32 r; bytes32 s;
    }

    function bumpNonce() external { nonces[msg.sender] += 1; }

    function _hashTypedData(bytes32 structHash) internal view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", _DOMAIN_SEPARATOR, structHash));
    }

    function _hashTerms(Terms calldata t) internal pure returns (bytes32) {
        bytes32 descHash = keccak256(bytes(t.description));
        bytes memory a = abi.encode(
            TERMS_TYPEHASH,
            t.seller, t.buyer, t.underlyingToken, t.paymentToken,
            t.amount, t.entryPrice, t.expiration, t.contractExpiration, t.gracePeriod
        );
        bytes memory b = abi.encode(
            t.initialMarginBps, t.maintenanceMarginBps,
            t.nonceSeller, t.nonceBuyer, descHash, t.validUntil
        );
        return keccak256(bytes.concat(a, b));
    }

    function computeDigest(Terms calldata t) external view returns (bytes32) {
        return _hashTypedData(_hashTerms(t));
    }

    /* ───── Création (signatures) ───── */

    function _decimals(address token) internal view returns (uint8) {
        try IERC20Metadata(token).decimals() returns (uint8 d) { return d; } catch { return 18; }
    }

    // NOTE: notional = price * amount / 10^priceDecimals
    function _notional(uint256 px, uint256 amt) internal view returns (uint256) {
        if (priceDecimals == 0) revert InvalidParam();
        return (px * amt) / (10 ** priceDecimals);
    }

    function _feeEachSide(uint256 px, uint256 amt) internal view returns (uint256) {
        if (feeRecipient == address(0)) return 0;
        uint256 notion = _notional(px, amt);
        return (notion * feeBps) / 10000; // 2 bps
    }

    function _pullAndMaybeAave(uint256 fromBuyer, uint256 fromSeller) internal {
        if (fromBuyer > 0) paymentToken.safeTransferFrom(buyer, address(this), fromBuyer);
        if (fromSeller > 0) paymentToken.safeTransferFrom(seller, address(this), fromSeller);
        uint256 total = fromBuyer + fromSeller;
        if (useAave && total > 0) {
            uint256 bal = paymentToken.balanceOf(address(this));
            if (bal > 0) {
                paymentToken.safeApprove(address(aavePool), bal);
                aavePool.supply(address(paymentToken), bal, address(this), 0);
                emit AaveSupplied(bal);
            }
        }
    }

    function createFutureBySignatures(
        Terms calldata t,
        bytes calldata sigSeller,
        bytes calldata sigBuyer
    ) external nonReentrant whenNotPaused {
        if (isCreated) revert Initialized();
        if (priceDecimals == 0) revert InvalidParam(); // ✅ exigence explicite
        if (block.timestamp > t.validUntil) revert SignaturesExpired();
        if (t.seller == address(0) || t.buyer == address(0)) revert ZeroAddress();
        if (t.paymentToken == address(0) || t.underlyingToken == address(0)) revert ZeroAddress();
        if (!isAllowedPaymentToken[t.paymentToken]) revert PaymentTokenNotAllowed(t.paymentToken);
        if (t.expiration <= block.timestamp) revert InvalidParam();
        if (t.contractExpiration < t.expiration) revert InvalidParam();
        if (t.initialMarginBps == 0 || t.maintenanceMarginBps == 0) revert InvalidParam();
        if (t.initialMarginBps < t.maintenanceMarginBps) revert InvalidParam();

        bytes32 digest = _hashTypedData(_hashTerms(t));
        if (digest.recover(sigSeller) != t.seller) revert ECDSA.BadSig();
        if (digest.recover(sigBuyer)  != t.buyer ) revert ECDSA.BadSig();
        if (t.nonceSeller != nonces[t.seller]) revert NonceMismatch();
        if (t.nonceBuyer  != nonces[t.buyer])  revert NonceMismatch();
        nonces[t.seller] += 1; nonces[t.buyer] += 1;

        // set state
        seller = t.seller;
        buyer  = t.buyer;
        paymentToken    = IERC20(t.paymentToken);
        underlyingToken = IERC20(t.underlyingToken);
        amount = t.amount;
        entryPrice = t.entryPrice;
        expiration = t.expiration;
        contractExpiration = t.contractExpiration;
        gracePeriod = t.gracePeriod;
        initialMarginBps = t.initialMarginBps;
        maintenanceMarginBps = t.maintenanceMarginBps;
        description = t.description;

        // marges requises (par côté) calculées sur la notionnelle d'entrée
        uint256 notionalEntry = _notional(entryPrice, amount);
        uint256 requiredPerSide = (notionalEntry * initialMarginBps) / 10000;
        uint256 feeEach = _feeEachSide(entryPrice, amount);

        // collecte: buyer & seller déposent chacun required + fee
        _pullAndMaybeAave(requiredPerSide + feeEach, requiredPerSide + feeEach);

        // paye frais (depuis le contrat vers feeRecipient)
        if (feeEach > 0) {
            uint256 need = feeEach * 2;
            if (useAave) {
                uint256 cash = paymentToken.balanceOf(address(this));
                if (cash < need) {
                    uint256 missing = need - cash;
                    uint256 out = aavePool.withdraw(address(paymentToken), missing, address(this));
                    if (out == 0) revert AaveWithdrawZero();
                    emit AaveWithdrawn(out, address(this));
                }
            }
            paymentToken.safeTransfer(feeRecipient, feeEach);
            paymentToken.safeTransfer(feeRecipient, feeEach);
            emit FeePaid(buyer, feeEach);
            emit FeePaid(seller, feeEach);
        }

        buyerCollateral  = requiredPerSide;
        sellerCollateral = requiredPerSide;

        isCreated = true;

        emit FutureCreated(
            seller, buyer, address(paymentToken), address(underlyingToken),
            amount, entryPrice, expiration, contractExpiration,
            initialMarginBps, maintenanceMarginBps
        );
    }

    function createFutureBySignaturesWithPermits(
        Terms calldata t,
        bytes calldata sigSeller,
        bytes calldata sigBuyer,
        PermitData calldata permitSeller,
        PermitData calldata permitBuyer
    ) external nonReentrant whenNotPaused {
        if (isCreated) revert Initialized();
        if (priceDecimals == 0) revert InvalidParam(); // ✅ exigence explicite
        if (block.timestamp > t.validUntil) revert SignaturesExpired();
        if (t.seller == address(0) || t.buyer == address(0)) revert ZeroAddress();
        if (t.paymentToken == address(0) || t.underlyingToken == address(0)) revert ZeroAddress();
        if (!isAllowedPaymentToken[t.paymentToken]) revert PaymentTokenNotAllowed(t.paymentToken);
        if (t.expiration <= block.timestamp) revert InvalidParam();
        if (t.contractExpiration < t.expiration) revert InvalidParam();
        if (t.initialMarginBps == 0 || t.maintenanceMarginBps == 0) revert InvalidParam();
        if (t.initialMarginBps < t.maintenanceMarginBps) revert InvalidParam();

        bytes32 digest = _hashTypedData(_hashTerms(t));
        if (digest.recover(sigSeller) != t.seller) revert ECDSA.BadSig();
        if (digest.recover(sigBuyer)  != t.buyer ) revert ECDSA.BadSig();
        if (t.nonceSeller != nonces[t.seller]) revert NonceMismatch();
        if (t.nonceBuyer  != nonces[t.buyer])  revert NonceMismatch();
        nonces[t.seller] += 1; nonces[t.buyer] += 1;

        // set state
        seller = t.seller;
        buyer  = t.buyer;
        paymentToken    = IERC20(t.paymentToken);
        underlyingToken = IERC20(t.underlyingToken);
        amount = t.amount;
        entryPrice = t.entryPrice;
        expiration = t.expiration;
        contractExpiration = t.contractExpiration;
        gracePeriod = t.gracePeriod;
        initialMarginBps = t.initialMarginBps;
        maintenanceMarginBps = t.maintenanceMarginBps;
        description = t.description;

        // ✅ permits respectent la value signée
        IERC20Permit(address(paymentToken)).permit(
            seller, address(this), permitSeller.value, permitSeller.deadline, permitSeller.v, permitSeller.r, permitSeller.s
        );
        IERC20Permit(address(paymentToken)).permit(
            buyer,  address(this), permitBuyer.value,  permitBuyer.deadline,  permitBuyer.v,  permitBuyer.r,  permitBuyer.s
        );

        // collect
        uint256 notionalEntry = _notional(entryPrice, amount);
        uint256 requiredPerSide = (notionalEntry * initialMarginBps) / 10000;
        uint256 feeEach = _feeEachSide(entryPrice, amount);

        _pullAndMaybeAave(requiredPerSide + feeEach, requiredPerSide + feeEach);

        if (feeEach > 0) {
            uint256 need = feeEach * 2;
            if (useAave) {
                uint256 cash = paymentToken.balanceOf(address(this));
                if (cash < need) {
                    uint256 missing = need - cash;
                    uint256 out = aavePool.withdraw(address(paymentToken), missing, address(this));
                    if (out == 0) revert AaveWithdrawZero();
                    emit AaveWithdrawn(out, address(this));
                }
            }
            paymentToken.safeTransfer(feeRecipient, feeEach);
            paymentToken.safeTransfer(feeRecipient, feeEach);
            emit FeePaid(buyer, feeEach);
            emit FeePaid(seller, feeEach);
        }

        buyerCollateral  = requiredPerSide;
        sellerCollateral = requiredPerSide;
        isCreated = true;

        emit FutureCreated(
            seller, buyer, address(paymentToken), address(underlyingToken),
            amount, entryPrice, expiration, contractExpiration,
            initialMarginBps, maintenanceMarginBps
        );
    }

    /* ───── Aave helpers ───── */

    function _cashBalance() internal view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }
    function _aaveBalance() internal view returns (uint256) {
        if (!useAave) return 0;
        return aToken.balanceOf(address(this));
    }
    function _totalHeld() internal view returns (uint256) {
        return _cashBalance() + _aaveBalance();
    }

    function migrateCashToAave(uint256 amount_) external onlySeller whenNotPaused {
        if (!useAave) revert AaveDisabled();
        uint256 cash = _cashBalance();
        if (amount_ == 0 || amount_ > cash) amount_ = cash;
        if (amount_ == 0) return;
        paymentToken.safeApprove(address(aavePool), amount_);
        aavePool.supply(address(paymentToken), amount_, address(this), 0);
        emit AaveSupplied(amount_);
    }

    function pullFromAave(uint256 amount_) external onlySeller whenNotPaused {
        if (!useAave) revert AaveDisabled();
        if (amount_ == 0) revert AmountZero();
        uint256 out = aavePool.withdraw(address(paymentToken), amount_, address(this));
        if (out == 0) revert AaveWithdrawZero();
        emit AaveWithdrawn(out, address(this));
    }

    /* ───── Collateral management ───── */

    function addBuyerCollateral(uint256 v) external nonReentrant onlyBuyer whenNotPaused {
        if (!isCreated || isClosed) revert BadState();
        if (v == 0) revert AmountZero();
        paymentToken.safeTransferFrom(msg.sender, address(this), v);
        buyerCollateral += v;
        if (useAave) {
            uint256 bal = _cashBalance();
            if (bal > 0) { paymentToken.safeApprove(address(aavePool), bal); aavePool.supply(address(paymentToken), bal, address(this), 0); emit AaveSupplied(bal); }
        }
        emit CollateralAdded(msg.sender, v);
    }

    function addSellerCollateral(uint256 v) external nonReentrant onlySeller whenNotPaused {
        if (!isCreated || isClosed) revert BadState();
        if (v == 0) revert AmountZero();
        paymentToken.safeTransferFrom(msg.sender, address(this), v);
        sellerCollateral += v;
        if (useAave) {
            uint256 bal = _cashBalance();
            if (bal > 0) { paymentToken.safeApprove(address(aavePool), bal); aavePool.supply(address(paymentToken), bal, address(this), 0); emit AaveSupplied(bal); }
        }
        emit CollateralAdded(msg.sender, v);
    }

    function _currentNotional(uint256 spot) internal view returns (uint256) {
        return _notional(spot, amount);
    }

    function _pnlBuyer(uint256 spot) internal view returns (int256) {
        if (priceDecimals == 0) revert InvalidParam();
        int256 s = int256(spot);
        int256 e = int256(entryPrice);
        int256 a = int256(amount);
        return ((s - e) * a) / int256(10 ** priceDecimals);
    }

    function _equities(uint256 spot) internal view returns (int256 buyerEq, int256 sellerEq, uint256 notionCur) {
        int256 pnl = _pnlBuyer(spot);
        notionCur = _currentNotional(spot);
        buyerEq = int256(buyerCollateral) + pnl;
        sellerEq = int256(sellerCollateral) - pnl;
    }

    function _requireHealthyAfterWithdraw(uint256 afterWithdraw) internal view {
        // equity post-withdraw >= initial margin requirement @ entry notional
        uint256 req = (_notional(entryPrice, amount) * initialMarginBps) / 10000;
        if (afterWithdraw < req) revert NetShort();
    }

    function withdrawBuyerCollateral(uint256 v) external nonReentrant onlyBuyer whenNotPaused {
        if (!isCreated || isClosed) revert BadState();
        if (v == 0) revert AmountZero();
        if (v > buyerCollateral) revert InvalidParam();
        _requireHealthyAfterWithdraw(buyerCollateral - v);
        buyerCollateral -= v;

        uint256 cash = _cashBalance();
        if (useAave && cash < v) {
            uint256 out = aavePool.withdraw(address(paymentToken), v - cash, address(this));
            if (out == 0) revert AaveWithdrawZero();
            emit AaveWithdrawn(out, address(this));
        }
        paymentToken.safeTransfer(buyer, v);
        emit CollateralWithdrawn(buyer, v);
    }

    function withdrawSellerCollateral(uint256 v) external nonReentrant onlySeller whenNotPaused {
        if (!isCreated || isClosed) revert BadState();
        if (v == 0) revert AmountZero();
        if (v > sellerCollateral) revert InvalidParam();
        _requireHealthyAfterWithdraw(sellerCollateral - v);
        sellerCollateral -= v;

        uint256 cash = _cashBalance();
        if (useAave && cash < v) {
            uint256 out = aavePool.withdraw(address(paymentToken), v - cash, address(this));
            if (out == 0) revert AaveWithdrawZero();
            emit AaveWithdrawn(out, address(this));
        }
        paymentToken.safeTransfer(seller, v);
        emit CollateralWithdrawn(seller, v);
    }

    /* ───── Views ───── */

    function spotNow() public view returns (uint256) {
        return oracle.latestPrice();
    }

    function pnlNow() external view returns (int256 pnlBuyer, uint256 spot) {
        spot = spotNow();
        pnlBuyer = _pnlBuyer(spot);
    }

    function equitiesNow() external view returns (int256 buyerEq, int256 sellerEq, uint256 notionCur, uint256 maintReq) {
        uint256 spot = spotNow();
        (buyerEq, sellerEq, notionCur) = _equities(spot);
        maintReq = (notionCur * maintenanceMarginBps) / 10000;
    }

    function marginHealth() external view returns (uint256 spot, int256 buyerEq, int256 sellerEq, uint256 maintReq, bool unsafe) {
        spot = spotNow();
        (buyerEq, sellerEq, ) = _equities(spot);
        uint256 notionCur = _currentNotional(spot);
        maintReq = (notionCur * maintenanceMarginBps) / 10000;
        unsafe = (buyerEq < int256(maintReq)) || (sellerEq < int256(maintReq));
    }

    function previewLiquidation()
        external
        view
        returns (uint256 spot, int256 pnlBuyer, int256 buyerEq, int256 sellerEq, uint256 maintReq, uint256 liqFee)
    {
        spot = spotNow();
        pnlBuyer = _pnlBuyer(spot);
        (buyerEq, sellerEq, ) = _equities(spot);
        uint256 notionCur = _currentNotional(spot);
        maintReq = (notionCur * maintenanceMarginBps) / 10000;
        liqFee = (notionCur * liquidationFeeBps) / 10000;
    }

    /* ───── Settlement / Liquidation ───── */

    function _ensureCash(uint256 need) internal {
        uint256 cash = _cashBalance();
        if (need <= cash) return;
        if (!useAave) revert NetShort();
        uint256 miss = need - cash;
        uint256 out = aavePool.withdraw(address(paymentToken), miss, address(this));
        if (out == 0) revert AaveWithdrawZero();
        emit AaveWithdrawn(out, address(this));
    }

    function _settleAtPrice(uint256 spot, address liquidator) internal {
        int256 pnlB = _pnlBuyer(spot);

        uint256 payToBuyer = 0;
        uint256 payToSeller = 0;
        uint256 liqFee = 0;

        if (pnlB > 0) {
            uint256 pnl = uint256(pnlB);
            payToBuyer = pnl > sellerCollateral ? sellerCollateral : pnl;
            sellerCollateral -= payToBuyer;
        } else if (pnlB < 0) {
            uint256 pnl = uint256(-pnlB);
            payToSeller = pnl > buyerCollateral ? buyerCollateral : pnl;
            buyerCollateral -= payToSeller;
        }

        if (liquidator != address(0)) {
            uint256 notionCur = _currentNotional(spot);
            uint256 fee = (notionCur * liquidationFeeBps) / 10000;

            uint256 loserRem = 0;
            if (pnlB > 0) {
                loserRem = sellerCollateral;
            } else if (pnlB < 0) {
                loserRem = buyerCollateral;
            } else {
                loserRem = 0;
            }
            liqFee = fee > loserRem ? loserRem : fee;
            if (liqFee > 0) {
                _ensureCash(liqFee + payToBuyer + payToSeller);
                paymentToken.safeTransfer(liquidator, liqFee);
                if (pnlB > 0) { sellerCollateral -= liqFee; } else if (pnlB < 0) { buyerCollateral -= liqFee; }
            }
        }

        if (payToBuyer > 0) {
            _ensureCash(payToBuyer);
            paymentToken.safeTransfer(buyer, payToBuyer);
        }
        if (payToSeller > 0) {
            _ensureCash(payToSeller);
            paymentToken.safeTransfer(seller, payToSeller);
        }

        uint256 refundBuyer  = buyerCollateral;
        uint256 refundSeller = sellerCollateral;
        if (refundBuyer > 0)  { _ensureCash(refundBuyer);  paymentToken.safeTransfer(buyer,  refundBuyer);  }
        if (refundSeller > 0) { _ensureCash(refundSeller); paymentToken.safeTransfer(seller, refundSeller); }

        buyerCollateral  = 0;
        sellerCollateral = 0;
        isClosed = true;

        if (liquidator == address(0)) {
            emit FutureSettled(spot, pnlB, payToBuyer, payToSeller, refundBuyer, refundSeller);
        } else {
            emit FutureLiquidated(liquidator, spot, pnlB, payToBuyer, payToSeller, liqFee);
        }
    }

    function settleAtExpiry() external nonReentrant whenNotPaused {
        if (!isCreated || isClosed) revert BadState();
        if (block.timestamp < expiration) revert NotExpired();
        uint256 spot = spotNow();
        _settleAtPrice(spot, address(0));
    }

    function liquidateIfUnsafe() external nonReentrant whenNotPaused {
        if (!isCreated || isClosed) revert BadState();
        uint256 spot = spotNow();
        (int256 buyerEq, int256 sellerEq, ) = _equities(spot);
        uint256 notionCur = _currentNotional(spot);
        uint256 maintReq = (notionCur * maintenanceMarginBps) / 10000;

        if (buyerEq >= int256(maintReq) && sellerEq >= int256(maintReq)) revert BadState();
        _settleAtPrice(spot, msg.sender);
    }

    function checkExpirationAndLiquidate() external nonReentrant whenNotPaused {
        if (!isCreated || isClosed) revert BadState();
        if (block.timestamp <= contractExpiration) revert NotExpired();
        if (block.timestamp <= contractExpiration + gracePeriod) revert BadState();
        uint256 spot = spotNow();
        _settleAtPrice(spot, msg.sender);
    }
}
