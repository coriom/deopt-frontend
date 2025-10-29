// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*──────────────────────────────
    Interfaces / Utilities
──────────────────────────────*/

// ---- IPriceOracle (local)
interface IPriceOracle {
    function latestPrice() external view returns (uint256);
}

// --------------------------- IERC20 ---------------------------
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

// ERC-2612
interface IERC20Permit {
    function permit(
        address owner, address spender, uint256 value, uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external;
}

// --------------------- IERC20Metadata -------------------------
interface IERC20Metadata is IERC20 {
    function decimals() external view returns (uint8);
}

// --------------------- EIP-1271 -------------------------------
interface IERC1271 {
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue);
}

/*──────────────────────────────
        Custom Errors
──────────────────────────────*/
error ZeroAddress();
error NotSeller();
error NotBuyer();
error BadState();
error Initialized();
error NotCreated();
error AlreadyPaid();
error AlreadyExercised();
error AlreadyLiquidated();
error SignaturesExpired();
error NonceMismatch();
error InvalidParam();
error StrikeOutOfRange();
error ContractExpired();
error TooEarly();
error WindowOver();
error NotExpired();
error GracePeriodInProgress();
error NotAllowed();
error NoExcess();
error WouldBreach();
error AmountZero();
error AaveNotConfigured();
error AaveDisabled();
error AaveWithdrawZero();
error NetMarginShort();
error Healthy();
error NoSurplus();
error PaymentTokenNotAllowed(address token);
error Paused();

// SafeERC20
error SafeTransferFailed();
error SafeTransferFromFailed();
error SafeApproveZeroFailed();
error SafeApproveFailed();

// Reentrancy
error Reentrancy();

// ECDSA
error ECDSA_InvalidSigLength();
error ECDSA_InvalidS();
error ECDSA_InvalidV();
error ECDSA_BadSig();

// Chainlink Oracle
error StalePrice();
error BadAnswer();
error BadRound();

/*──────────────────────────────
         SafeERC20 (errors)
──────────────────────────────*/
library SafeERC20 {
    function safeTransfer(IERC20 t, address to, uint256 v) internal {
        (bool ok, bytes memory d) = address(t).call(abi.encodeWithSelector(t.transfer.selector, to, v));
        if (!(ok && (d.length == 0 || abi.decode(d, (bool))))) revert SafeTransferFailed();
    }
    function safeTransferFrom(IERC20 t, address from, address to, uint256 v) internal {
        (bool ok, bytes memory d) = address(t).call(abi.encodeWithSelector(t.transferFrom.selector, from, to, v));
        if (!(ok && (d.length == 0 || abi.decode(d, (bool))))) revert SafeTransferFromFailed();
    }
    // FIX: variables d1/d2 (plus d’Undeclared identifier)
    function safeApprove(IERC20 t, address spender, uint256 v) internal {
        (bool ok1, bytes memory d1) = address(t).call(abi.encodeWithSelector(t.approve.selector, spender, 0));
        if (!(ok1 && (d1.length == 0 || abi.decode(d1, (bool))))) revert SafeApproveZeroFailed();
        (bool ok2, bytes memory d2) = address(t).call(abi.encodeWithSelector(t.approve.selector, spender, v));
        if (!(ok2 && (d2.length == 0 || abi.decode(d2, (bool))))) revert SafeApproveFailed();
    }
}
using SafeERC20 for IERC20;

/*──────────────────────────────
      ReentrancyGuard (error)
──────────────────────────────*/
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

/*──────────────────────────────
            ECDSA (errors)
──────────────────────────────*/
library ECDSA {
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) revert ECDSA_InvalidSigLength();
        bytes32 r; bytes32 s; uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        return recover(hash, v, r, s);
    }
    function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address) {
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) revert ECDSA_InvalidS();
        if (v != 27 && v != 28) revert ECDSA_InvalidV();
        address signer = ecrecover(hash, v, r, s);
        if (signer == address(0)) revert ECDSA_BadSig();
        return signer;
    }
}
using ECDSA for bytes32;

/*──────────────────────────────
      Chainlink AggregatorV3
──────────────────────────────*/
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

/// Oracle BASE/QUOTE = (BASE/USD) / (QUOTE/USD)
contract ChainlinkOracleRatio is IPriceOracle {
    AggregatorV3Interface public immutable baseUsd;
    AggregatorV3Interface public immutable quoteUsd;
    uint8  public immutable targetDecimals;
    uint256 public immutable maxDelay;

    constructor(address _baseUsd, address _quoteUsd, uint8 _targetDecimals, uint256 _maxDelaySeconds) {
        if (_baseUsd == address(0) || _quoteUsd == address(0)) revert ZeroAddress();
        baseUsd = AggregatorV3Interface(_baseUsd);
        quoteUsd = AggregatorV3Interface(_quoteUsd);
        targetDecimals = _targetDecimals;
        maxDelay = _maxDelaySeconds;
    }

    function latestPrice() external view override returns (uint256) {
        (uint80 r1, int256 a1, , uint256 t1, uint80 ar1) = baseUsd.latestRoundData();
        if (a1 <= 0) revert BadAnswer();
        if (ar1 < r1) revert BadRound();
        if (block.timestamp - t1 > maxDelay) revert StalePrice();

        (uint80 r2, int256 a2, , uint256 t2, uint80 ar2) = quoteUsd.latestRoundData();
        if (a2 <= 0) revert BadAnswer();
        if (ar2 < r2) revert BadRound();
        if (block.timestamp - t2 > maxDelay) revert StalePrice();

        uint8 d1 = baseUsd.decimals();
        uint8 d2 = quoteUsd.decimals();

        uint256 num = uint256(a1) * (10 ** (targetDecimals + d2));
        uint256 scaled = num / (10 ** d1);
        uint256 price = scaled / uint256(a2);
        return price; // targetDecimals
    }
}

/*──────────────────────────────
            Aave v3
──────────────────────────────*/
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}
interface IAaveAToken {
    function balanceOf(address account) external view returns (uint256);
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);
    function allowance(address owner, address spender) external view returns (uint256);
}

/*──────────────────────────────
       DeOpt Option Contract
──────────────────────────────*/
contract OptionCallandPut is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ---- Parties / guards
    modifier onlySeller() { if (msg.sender != seller) revert NotSeller(); _; }
    modifier onlyBuyer()  { if (msg.sender != buyer)  revert NotBuyer();  _; }
    modifier optionActive() {
        if (!isCreated) revert NotCreated();
        if (!premiumPaid) revert BadState();
        if (isExercised) revert AlreadyExercised();
        if (block.timestamp > expiration) revert ContractExpired();
        _;
    }
    modifier contractActive() {
        if (block.timestamp > contractExpiration) revert ContractExpired();
        _;
    }
    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    // --- Actors
    address public seller;
    address public buyer;

    // --- Pause (bi-signé)
    bool    public paused;
    mapping(address => uint256) public pauseNonces;
    event PausedSet(bool paused);

    // --- Oracle
    IPriceOracle public oracle;
    event OracleUpdated(address indexed newOracle);

    // --- Tokens
    IERC20 public underlyingToken;
    IERC20 public paymentToken;

    // Allowlist (Option 2)
    mapping(address => bool) public isAllowedPaymentToken;
    event PaymentTokenAllowed(address token, bool allowed);

    // --- Params
    uint public underlyingAmount;
    uint public strikePrice;
    uint public premium;
    uint public expiration;
    uint public contractExpiration;
    uint public europeanExerciseWindow;

    // --- Margin (percent ONLY)
    uint public collateralDeposited;
    uint public minimumMarginPercent; // >= 101
    uint public minimumMarginAbsolute; // unused
    bool public marginInPercent = true;
    uint public gracePeriod;

    // --- Flags
    bool public isCall;
    bool public isAmerican;
    bool public isCreated;
    bool public premiumPaid;
    bool public isExercised;
    bool public isCancelled;
    bool public isLiquidated;

    // --- Misc
    bytes32 public identifier;

    // --- Negotiation / proposals
    uint public proposedBuybackPrice;
    bool public buybackProposed;

    uint public proposedNewExpiration;
    bool public newExpirationProposed;

    string public description;
    mapping(address => uint256) public nonces; // nonces EIP-712 "Terms"

    uint public proposedMargin;
    bool public marginProposalInProgress;

    uint public proposedDelay;
    bool public delayProposalInProgress;

    // --- Aave
    IAavePool   public aavePool;
    IAaveAToken public aToken;
    bool public useAave;

    // --- Fees
    address public feeRecipient;                 // fixé au déploiement ci-dessous
    uint256 public constant feeBps = 2;          // 0.02%

    // --- Events
    event OptionCreated(
        address indexed seller,
        uint strikePrice,
        uint amount,
        uint premium,
        uint expiration,
        uint contractExpiration,
        uint collateralDeposited,
        bool marginInPercent,
        uint marginValue,
        uint gracePeriod,
        bool isCall
    );
    event OptionCreatedBySignatures(address indexed seller, address indexed buyer, address indexed cosigner);
    event PremiumPaid(address indexed buyer, uint amount);
    event OptionExercised(address indexed buyer, uint underlyingAmount);
    event DepositRecovered(address indexed seller);
    event OptionCancelled(address indexed seller);
    event OptionLiquidated(address indexed liquidator);
    event MarginWithdrawn(address indexed seller, uint amount);
    event MarginAdded(address indexed seller, uint amount);
    event MinimumMarginAdjusted(uint oldMargin, uint newMargin);
    event BuybackProposed(uint price);
    event BuybackAccepted(uint price);
    event NewExpirationProposed(uint newExpiration);
    event NewExpirationAccepted(uint newExpiration);
    event UserLog(address indexed user, string action, uint timestamp);
    event MinimumMarginProposed(bool inPercent, uint value);
    event MinimumMarginApproved(bool inPercent, uint value);
    event NewDelayProposed(uint value);
    event NewDelayApproved(uint value);

    // Aave & Fees & Invariants
    event AaveConfigured(address pool, address aToken, bool enabled);
    event AaveSupplied(uint256 amount);
    event AaveWithdrawn(uint256 amount, address to);
    event SurplusHarvested(uint256 amount, address to);
    event FeePaid(address indexed payer, uint256 amount);
    event FeeRecipientSet(address indexed recipient);
    event LiquidationPayout(address indexed liquidator, uint256 toBuyer, uint256 toLiquidator);

    // ----------------------- EIP-712 ---------------------------
    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 private constant NAME_HASH    = keccak256("DeOpt");
    bytes32 private constant VERSION_HASH = keccak256("1");

    // Terms (création)
    bytes32 private constant TERMS_TYPEHASH = keccak256(
        "Terms(address seller,address buyer,address underlyingToken,address paymentToken,uint256 underlyingAmount,uint256 strikePrice,uint256 premium,uint256 expiration,uint256 contractExpiration,uint256 gracePeriod,bool isCall,bool isAmerican,uint256 europeanExerciseWindow,uint256 minimumMarginPercent,uint256 nonceSeller,uint256 nonceBuyer,string description,uint256 validUntil,address cosigner)"
    );

    // Pause (bi-signée)
    bytes32 private constant PAUSE_TYPEHASH = keccak256(
        "PauseTerms(bool pause,uint256 validUntil,uint256 nonceSeller,uint256 nonceBuyer)"
    );

    bytes32 private immutable _DOMAIN_SEPARATOR;

    function domainSeparator() external view returns (bytes32) { return _DOMAIN_SEPARATOR; }
    function termsTypehash() external pure returns (bytes32) { return TERMS_TYPEHASH; }
    function pauseTypehash() external pure returns (bytes32) { return PAUSE_TYPEHASH; }
    function name() external pure returns (string memory) { return "DeOpt"; }
    function version() external pure returns (string memory) { return "1"; }

    // ----------------------- Constructor -----------------------
    constructor(address _underlyingToken, address _paymentToken) {
        seller = msg.sender;
        if (_paymentToken == address(0) || _underlyingToken == address(0)) revert ZeroAddress();
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

        feeRecipient = 0x8B87aECC9413C2c5b853e81AA94b60990e7aBdbE;
        emit FeeRecipientSet(feeRecipient);
    }

    // ---------------- Bilateral Terms (EIP-712) ----------------
    struct Terms {
        address seller;
        address buyer;
        address underlyingToken;
        address paymentToken;
        uint256 underlyingAmount;
        uint256 strikePrice;
        uint256 premium;
        uint256 expiration;
        uint256 contractExpiration;
        uint256 gracePeriod;
        bool    isCall;
        bool    isAmerican;
        uint256 europeanExerciseWindow;
        uint256 minimumMarginPercent;
        uint256 nonceSeller;
        uint256 nonceBuyer;
        string  description;
        uint256 validUntil;
        address cosigner;
    }

    struct PermitData {
        uint256 value;
        uint256 deadline;
        uint8 v; bytes32 r; bytes32 s;
    }

    struct PauseTerms {
        bool    pause;
        uint256 validUntil;
        uint256 nonceSeller;
        uint256 nonceBuyer;
    }

    function bumpNonce() external { nonces[msg.sender] += 1; }
    function bumpPauseNonce() external { pauseNonces[msg.sender] += 1; }

    function _hashTypedData(bytes32 structHash) internal view returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x01", _DOMAIN_SEPARATOR, structHash));
    }
    function _hashTerms(Terms calldata t) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                TERMS_TYPEHASH,
                t.seller, t.buyer, t.underlyingToken, t.paymentToken,
                t.underlyingAmount, t.strikePrice, t.premium,
                t.expiration, t.contractExpiration, t.gracePeriod,
                t.isCall, t.isAmerican, t.europeanExerciseWindow,
                t.minimumMarginPercent, t.nonceSeller, t.nonceBuyer,
                keccak256(bytes(t.description)), t.validUntil, t.cosigner
            )
        );
    }
    function _hashPause(PauseTerms calldata p) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                PAUSE_TYPEHASH,
                p.pause,
                p.validUntil,
                p.nonceSeller,
                p.nonceBuyer
            )
        );
    }
    function computeDigest(Terms calldata t) external view returns (bytes32) { return _hashTypedData(_hashTerms(t)); }
    function computePauseDigest(PauseTerms calldata p) external view returns (bytes32) { return _hashTypedData(_hashPause(p)); }

    // -------------------- EIP-1271 helper ----------------------
    bytes4 private constant _MAGICVALUE = 0x1626ba7e;
    function _isValidSignature(address signer, bytes32 digest, bytes calldata sig) internal view returns (bool) {
        if (signer.code.length == 0) {
            address rec = ECDSA.recover(digest, sig);
            return rec == signer;
        } else {
            try IERC1271(signer).isValidSignature(digest, sig) returns (bytes4 magic) {
                return magic == _MAGICVALUE;
            } catch { return false; }
        }
    }

    // ------------------------- Fees ----------------------------
    // La fonction est conservée pour compat, mais revertera si déjà configuré (c’est le cas via le constructeur).
    function setFeeRecipientOnce(address _recipient) external onlySeller whenNotPaused {
        if (feeRecipient != address(0)) revert BadState();
        if (_recipient == address(0)) revert ZeroAddress();
        feeRecipient = _recipient;
        emit FeeRecipientSet(_recipient);
    }

    // --------------------- Allowlist (Option 2) ----------------
    function allowPaymentToken(address token, bool allowed) external onlySeller whenNotPaused {
        isAllowedPaymentToken[token] = allowed;
        emit PaymentTokenAllowed(token, allowed);
    }
    function _assertPaymentTokenAllowed(address token) internal view {
        if (!isAllowedPaymentToken[token]) revert PaymentTokenNotAllowed(token);
    }

    // --------------------- Decimals helpers --------------------
    function _underlyingDecimals(address token) internal view returns (uint8) {
        try IERC20Metadata(token).decimals() returns (uint8 d) { return d; } catch { return 18; }
    }

    /// strike ∈ [spot/100, spot*200] si oracle configuré
    function _sanityCheckStrike(uint strike) internal view {
        if (address(oracle) == address(0)) return;
        uint s = oracle.latestPrice();
        if (!(strike > 0 && s > 0)) revert InvalidParam();
        if (!(strike >= s / 100 && strike <= s * 200)) revert StrikeOutOfRange();
    }

    /// notionnel = strike * amount / 10^underlyingDecimals
    function _notional(uint strike, uint amount, address underlying, address /*payment*/) internal view returns (uint) {
        uint8 uDec = _underlyingDecimals(underlying);
        if (uDec == 0) return strike * amount;
        return (strike * amount) / (10 ** uDec);
    }

    function _feePerSide(uint strike, uint amount, address underlying, address payment) internal view returns (uint) {
        if (feeRecipient == address(0)) return 0;
        uint notion = _notional(strike, amount, underlying, payment);
        return (notion * feeBps) / 10000; // 2 bps = 0.02%
    }

    // Helpers front (création)
    function creationFees(Terms calldata t) external view returns (uint feeEachSide, uint notional_) {
        notional_ = _notional(t.strikePrice, t.underlyingAmount, t.underlyingToken, t.paymentToken);
        feeEachSide = (feeRecipient == address(0)) ? 0 : (notional_ * feeBps) / 10000;
    }
    function computeCreationNeeds(Terms calldata t)
        external
        view
        returns (uint needSeller, uint needBuyer, uint feeEachSide, uint minimumMargin)
    {
        minimumMargin = (t.strikePrice * t.minimumMarginPercent) / 100;
        feeEachSide = (feeRecipient == address(0)) ? 0 : _feePerSide(t.strikePrice, t.underlyingAmount, t.underlyingToken, t.paymentToken);
        needSeller = minimumMargin + feeEachSide;
        needBuyer  = t.premium + feeEachSide;
    }

    // -------------------- Create (signatures) ------------------
    function createOptionBySignatures(
        Terms calldata t,
        bytes calldata sigSeller,
        bytes calldata sigBuyer,
        bytes calldata sigCosigner
    ) external nonReentrant whenNotPaused {
        if (isCreated || premiumPaid) revert Initialized();
        if (t.minimumMarginPercent < 101) revert InvalidParam();
        if (t.expiration <= block.timestamp) revert InvalidParam();
        if (t.contractExpiration <= t.expiration) revert InvalidParam();
        if (block.timestamp > t.validUntil) revert SignaturesExpired();

        _assertPaymentTokenAllowed(t.paymentToken);
        _sanityCheckStrike(t.strikePrice);

        bytes32 digest = _hashTypedData(_hashTerms(t));
        if (!_isValidSignature(t.seller, digest, sigSeller)) revert ECDSA_BadSig();
        if (!_isValidSignature(t.buyer,  digest, sigBuyer )) revert ECDSA_BadSig();
        if (t.cosigner != address(0) && !_isValidSignature(t.cosigner, digest, sigCosigner)) revert ECDSA_BadSig();

        if (t.nonceSeller != nonces[t.seller]) revert NonceMismatch();
        if (t.nonceBuyer  != nonces[t.buyer])  revert NonceMismatch();

        nonces[t.seller] += 1;
        nonces[t.buyer]  += 1;

        seller = t.seller; buyer = t.buyer;
        underlyingToken = IERC20(t.underlyingToken);
        paymentToken    = IERC20(t.paymentToken);

        underlyingAmount       = t.underlyingAmount;
        strikePrice            = t.strikePrice;
        premium                = t.premium;
        expiration             = t.expiration;
        contractExpiration     = t.contractExpiration;
        isCall                 = t.isCall;
        isAmerican             = t.isAmerican;
        europeanExerciseWindow = t.europeanExerciseWindow;
        gracePeriod            = t.gracePeriod;

        marginInPercent        = true;
        minimumMarginPercent   = t.minimumMarginPercent;
        minimumMarginAbsolute  = 0;
        description            = t.description;

        uint256 minimumMargin = (strikePrice * minimumMarginPercent) / 100;
        uint256 feeEach = _feePerSide(strikePrice, underlyingAmount, address(underlyingToken), address(paymentToken));

        paymentToken.safeTransferFrom(seller, address(this), minimumMargin);
        if (paymentToken.balanceOf(address(this)) < minimumMargin) revert NetMarginShort();
        if (feeEach > 0) {
            paymentToken.safeTransferFrom(seller, feeRecipient, feeEach);
            emit FeePaid(seller, feeEach);
        }
        _supplyToAave(minimumMargin);

        paymentToken.safeTransferFrom(buyer, seller, premium);
        if (feeEach > 0) {
            paymentToken.safeTransferFrom(buyer, feeRecipient, feeEach);
            emit FeePaid(buyer, feeEach);
        }

        isCreated = true;
        premiumPaid = true;
        collateralDeposited = minimumMargin;

        emit OptionCreated(
            seller, strikePrice, underlyingAmount, premium, expiration,
            contractExpiration, collateralDeposited, true, minimumMarginPercent, gracePeriod, isCall
        );
        emit OptionCreatedBySignatures(seller, buyer, t.cosigner);
    }

    function createOptionBySignaturesWithPermits(
        Terms calldata t,
        bytes calldata sigSeller,
        bytes calldata sigBuyer,
        bytes calldata sigCosigner,
        PermitData calldata sellerPermit,
        PermitData calldata buyerPermit
    ) external nonReentrant whenNotPaused {
        if (isCreated || premiumPaid) revert Initialized();
        if (t.minimumMarginPercent < 101) revert InvalidParam();
        if (t.expiration <= block.timestamp) revert InvalidParam();
        if (t.contractExpiration <= t.expiration) revert InvalidParam();
        if (block.timestamp > t.validUntil) revert SignaturesExpired();

        _assertPaymentTokenAllowed(t.paymentToken);
        _sanityCheckStrike(t.strikePrice);

        bytes32 digest = _hashTypedData(_hashTerms(t));
        if (!_isValidSignature(t.seller, digest, sigSeller)) revert ECDSA_BadSig();
        if (!_isValidSignature(t.buyer,  digest, sigBuyer )) revert ECDSA_BadSig();
        if (t.cosigner != address(0) && !_isValidSignature(t.cosigner, digest, sigCosigner)) revert ECDSA_BadSig();

        if (t.nonceSeller != nonces[t.seller]) revert NonceMismatch();
        if (t.nonceBuyer  != nonces[t.buyer])  revert NonceMismatch();

        IERC20Permit(address(t.paymentToken)).permit(
            t.seller, address(this),
            sellerPermit.value, sellerPermit.deadline,
            sellerPermit.v, sellerPermit.r, sellerPermit.s
        );
        IERC20Permit(address(t.paymentToken)).permit(
            t.buyer, address(this),
            buyerPermit.value, buyerPermit.deadline,
            buyerPermit.v, buyerPermit.r, buyerPermit.s
        );

        nonces[t.seller] += 1;
        nonces[t.buyer]  += 1;

        seller = t.seller; buyer = t.buyer;
        underlyingToken = IERC20(t.underlyingToken);
        paymentToken    = IERC20(t.paymentToken);
        underlyingAmount       = t.underlyingAmount;
        strikePrice            = t.strikePrice;
        premium                = t.premium;
        expiration             = t.expiration;
        contractExpiration     = t.contractExpiration;
        isCall                 = t.isCall;
        isAmerican             = t.isAmerican;
        europeanExerciseWindow = t.europeanExerciseWindow;
        gracePeriod            = t.gracePeriod;
        marginInPercent        = true;
        minimumMarginPercent   = t.minimumMarginPercent;
        minimumMarginAbsolute  = 0;
        description            = t.description;

        uint256 minimumMargin = (strikePrice * minimumMarginPercent) / 100;
        uint256 feeEach = _feePerSide(strikePrice, underlyingAmount, address(underlyingToken), address(paymentToken));

        paymentToken.safeTransferFrom(seller, address(this), minimumMargin);
        if (paymentToken.balanceOf(address(this)) < minimumMargin) revert NetMarginShort();
        if (feeEach > 0) {
            paymentToken.safeTransferFrom(seller, feeRecipient, feeEach);
            emit FeePaid(seller, feeEach);
        }
        _supplyToAave(minimumMargin);

        paymentToken.safeTransferFrom(buyer, seller, premium);
        if (feeEach > 0) {
            paymentToken.safeTransferFrom(buyer, feeRecipient, feeEach);
            emit FeePaid(buyer, feeEach);
        }

        isCreated = true; premiumPaid = true; collateralDeposited = minimumMargin;

        emit OptionCreated(
            seller, strikePrice, underlyingAmount, premium, expiration,
            contractExpiration, collateralDeposited, true, minimumMarginPercent, gracePeriod, isCall
        );
        emit OptionCreatedBySignatures(seller, buyer, t.cosigner);
    }

    // --------------------- Pause bi-signée ---------------------
    function setPausedBySignatures(
        PauseTerms calldata p,
        bytes calldata sigSeller,
        bytes calldata sigBuyer
    ) external nonReentrant {
        if (block.timestamp > p.validUntil) revert SignaturesExpired();

        bytes32 digest = _hashTypedData(_hashPause(p));
        if (!_isValidSignature(seller, digest, sigSeller)) revert ECDSA_BadSig();
        if (!_isValidSignature(buyer,  digest, sigBuyer )) revert ECDSA_BadSig();

        if (p.nonceSeller != pauseNonces[seller]) revert NonceMismatch();
        if (p.nonceBuyer  != pauseNonces[buyer])  revert NonceMismatch();
        pauseNonces[seller] += 1;
        pauseNonces[buyer]  += 1;

        paused = p.pause;
        emit PausedSet(p.pause);
    }

    // --------------------- Proposals / Admin -------------------
    function proposeNewDelay(uint _newDelay) public whenNotPaused {
        if (!(isCreated && premiumPaid && !isExercised)) revert BadState();
        if (msg.sender != seller && msg.sender != buyer) revert BadState();
        delayProposalInProgress = true;
        proposedDelay = _newDelay;
        emit NewDelayProposed(_newDelay);
    }

    function approveNewDelay() public whenNotPaused {
        if (!(isCreated && premiumPaid && !isExercised)) revert BadState();
        if (!delayProposalInProgress) revert BadState();
        if (msg.sender != seller && msg.sender != buyer) revert BadState();
        delayProposalInProgress = false;
        gracePeriod = proposedDelay;
        emit NewDelayApproved(proposedDelay);
    }

    function proposeNewMargin(bool inPercent, uint value) public whenNotPaused {
        if (!(isCreated && premiumPaid && !isExercised)) revert BadState();
        if (msg.sender != seller && msg.sender != buyer) revert BadState();
        if (!inPercent) revert InvalidParam();
        if (value < 101) revert InvalidParam();

        marginProposalInProgress = true;
        marginInPercent = true;
        minimumMarginPercent = value;
        minimumMarginAbsolute = 0;

        proposedMargin = value;
        emit MinimumMarginProposed(true, value);
    }

    function approveNewMargin() public whenNotPaused {
        if (!(isCreated && premiumPaid && !isExercised)) revert BadState();
        if (!marginProposalInProgress) revert BadState();
        if (msg.sender != seller && msg.sender != buyer) revert BadState();
        marginProposalInProgress = false;
        emit MinimumMarginApproved(true, minimumMarginPercent);
    }

    // --------------------- Aave management ---------------------
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

    // --------------------- Views / helpers ---------------------
    function calculateMinimumMargin() public view returns (uint) {
        return (strikePrice * minimumMarginPercent) / 100;
    }

    /// Santé de marge (gasless en lecture)
    function marginHealth()
        public
        view
        returns (
            uint256 minMargin,
            uint256 collateral,
            uint256 percentBps,
            int256   excessOrDeficit,
            bool     healthy
        )
    {
        minMargin = calculateMinimumMargin();
        collateral = collateralDeposited;
        if (minMargin == 0) {
            percentBps = collateral == 0 ? 0 : type(uint256).max;
            excessOrDeficit = int256(collateral);
            healthy = collateral > 0;
            return (minMargin, collateral, percentBps, excessOrDeficit, healthy);
        }
        percentBps = (collateral * 10_000) / minMargin;
        healthy = collateral >= minMargin;
        excessOrDeficit = healthy
            ? int256(collateral - minMargin)
            : -int256(minMargin - collateral);
    }

    function marginHealthBps() external view returns (uint256) {
        ( , , uint256 pct, , ) = marginHealth();
        return pct;
    }

    function balancesInfo() external view returns (uint256 cash, uint256 aave, uint256 total) {
        cash = _cashBalance();
        aave = _aaveBalance();
        total = cash + aave;
    }

    function requiredSellerAmount(Terms calldata t) external view returns (uint256) {
        uint minMargin = (t.strikePrice * t.minimumMarginPercent) / 100;
        uint feeEach = (feeRecipient == address(0)) ? 0 : _feePerSide(t.strikePrice, t.underlyingAmount, t.underlyingToken, t.paymentToken);
        return minMargin + feeEach;
    }
    function requiredBuyerAmount(Terms calldata t) external view returns (uint256) {
        uint feeEach = (feeRecipient == address(0)) ? 0 : _feePerSide(t.strikePrice, t.underlyingAmount, t.underlyingToken, t.paymentToken);
        return t.premium + feeEach;
    }

    function canSettleCreation(
        Terms calldata t,
        uint256 sellerBalance,
        uint256 buyerBalance,
        uint256 sellerAllowance,
        uint256 buyerAllowance
    ) external view returns (bool okSeller, bool okBuyer, uint256 needSeller, uint256 needBuyer) {
        uint minMargin = (t.strikePrice * t.minimumMarginPercent) / 100;
        uint feeEach = (feeRecipient == address(0)) ? 0 : _feePerSide(t.strikePrice, t.underlyingAmount, t.underlyingToken, t.paymentToken);
        uint needS = minMargin + feeEach;
        uint needB = t.premium + feeEach;
        bool s = (sellerBalance >= needS) && (sellerAllowance >= needS);
        bool b = (buyerBalance  >= needB) && (buyerAllowance  >= needB);
        return (s, b, needS, needB);
    }

    function logAction(string memory action) internal { emit UserLog(msg.sender, action, block.timestamp); }

    function setDescription(string memory _desc) public onlyBuyer whenNotPaused {
        description = _desc;
        logAction("Description modified");
    }

    function isInTheMoney(uint spotPrice) public view returns (bool) {
        return spotPrice < strikePrice; // logique d'origine (put ITM)
    }

    // ----------------- Aave internal / helpers -----------------
    function _cashBalance() internal view returns (uint256) {
        return paymentToken.balanceOf(address(this));
    }
    function _aaveBalance() internal view returns (uint256) {
        if (!useAave) return 0;
        return aToken.balanceOf(address(this));
    }
    function _totalHeld() internal view returns (uint256) {
        if (!useAave) return _cashBalance();
        return _aaveBalance() + _cashBalance();
    }

    function _supplyToAave(uint256 amount) internal {
        if (!useAave || amount == 0) return;
        uint256 available = _cashBalance();
        if (amount > available) amount = available;
        if (amount == 0) return;

        paymentToken.safeApprove(address(aavePool), amount);
        aavePool.supply(address(paymentToken), amount, address(this), 0);
        emit AaveSupplied(amount);
    }

    function _withdrawFromAave(uint256 amount, address to) internal returns (uint256 out) {
        if (!useAave || amount == 0) return 0;
        uint256 aBal = _aaveBalance();
        if (amount > aBal) amount = aBal;
        if (amount == 0) return 0;

        out = aavePool.withdraw(address(paymentToken), amount, to);
        if (out == 0) revert AaveWithdrawZero();
        emit AaveWithdrawn(out, to);
    }

    function migrateCashToAave(uint256 amount) external onlySeller whenNotPaused {
        if (!useAave) revert AaveDisabled();
        if (amount == 0) amount = _cashBalance();
        _supplyToAave(amount);
    }

    function pullFromAave(uint256 amount) external onlySeller whenNotPaused {
        if (!useAave) revert AaveDisabled();
        if (amount == 0) revert AmountZero();
        _withdrawFromAave(amount, address(this));
    }

    function aaveInfo() external view returns (
        bool _useAave, address _pool, address _aToken, uint256 aBal, uint256 cash, uint256 total
    ) {
        _useAave = useAave;
        _pool    = address(aavePool);
        _aToken  = address(aToken);
        aBal     = _aaveBalance();
        cash     = _cashBalance();
        total    = aBal + cash;
    }

    // ---------------------- Buyback / Expiry -------------------
    function proposeBuyback(uint price) public onlyBuyer whenNotPaused {
        if (!(isCreated && premiumPaid && !isExercised && !isLiquidated)) revert BadState();
        proposedBuybackPrice = price;
        buybackProposed = true;
        emit BuybackProposed(price);
    }

    function acceptBuyback() public onlySeller nonReentrant whenNotPaused {
        if (!buybackProposed) revert BadState();
        paymentToken.safeTransferFrom(seller, buyer, proposedBuybackPrice);

        uint256 cash = _cashBalance();
        uint256 need = collateralDeposited > cash ? (collateralDeposited - cash) : 0;
        if (useAave && need > 0) { _withdrawFromAave(need, address(this)); }
        paymentToken.safeTransfer(seller, collateralDeposited);
        collateralDeposited = 0;
        isLiquidated = true;
        emit BuybackAccepted(proposedBuybackPrice);
    }

    function proposeNewExpiration(uint _newExpiration) public onlyBuyer whenNotPaused {
        if (!(isCreated && premiumPaid && !isExercised)) revert BadState();
        if (_newExpiration <= block.timestamp) revert InvalidParam();
        proposedNewExpiration = _newExpiration;
        newExpirationProposed = true;
        emit NewExpirationProposed(_newExpiration);
    }

    function acceptNewExpiration() public onlySeller whenNotPaused {
        if (!newExpirationProposed) revert BadState();
        expiration = proposedNewExpiration;
        newExpirationProposed = false;
        emit NewExpirationAccepted(expiration);
    }

    // ---------------------- Collateral (seller) ----------------
    function withdrawExcessMargin(uint amount) public nonReentrant onlySeller whenNotPaused {
        if (!isCreated) revert NotCreated();
        uint minimumMargin = (strikePrice * minimumMarginPercent) / 100;
        if (collateralDeposited <= minimumMargin) revert NoExcess();
        if (collateralDeposited - amount < minimumMargin) revert WouldBreach();
        collateralDeposited -= amount;

        uint256 cash = _cashBalance();
        if (useAave && amount > cash) { _withdrawFromAave(amount - cash, address(this)); }
        paymentToken.safeTransfer(seller, amount);
        emit MarginWithdrawn(seller, amount);
    }

    function addCollateral(uint amount) public nonReentrant onlySeller whenNotPaused {
        if (!isCreated) revert NotCreated();
        if (amount == 0) revert AmountZero();
        uint bal0 = paymentToken.balanceOf(address(this));
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        uint rec = paymentToken.balanceOf(address(this)) - bal0;
        if (rec != amount) revert NetMarginShort();
        collateralDeposited += amount;
        _supplyToAave(amount);
        emit MarginAdded(msg.sender, amount);
    }

    // ---------------------- Exercise & settlements -------------
    function exerciseOption() public nonReentrant onlyBuyer optionActive contractActive whenNotPaused {
        if (isAmerican) {
            if (block.timestamp > expiration) revert ContractExpired();
        } else {
            if (block.timestamp < expiration) revert TooEarly();
            if (block.timestamp > expiration + europeanExerciseWindow) revert WindowOver();
        }
        if (isCall) {
            paymentToken.safeTransferFrom(msg.sender, seller, strikePrice);
            underlyingToken.safeTransfer(buyer, underlyingAmount);
        } else {
            underlyingToken.safeTransferFrom(msg.sender, seller, underlyingAmount);
            paymentToken.safeTransfer(buyer, strikePrice);
        }
        isExercised = true;
        emit OptionExercised(buyer, underlyingAmount);
    }

    // ---------------------- Expiry flows -----------------------
    function recoverDeposit() public nonReentrant onlySeller contractActive whenNotPaused {
        if (block.timestamp <= expiration) revert NotExpired();
        if (isExercised) revert AlreadyExercised();

        uint256 cash = _cashBalance();
        uint256 need = collateralDeposited > cash ? (collateralDeposited - cash) : 0;
        if (useAave && need > 0) { _withdrawFromAave(need, address(this)); }
        uint amount = collateralDeposited; collateralDeposited = 0;
        paymentToken.safeTransfer(seller, amount);
        emit DepositRecovered(seller);
    }

    function checkExpirationAndReturnCollateral() public nonReentrant whenNotPaused {
        if (block.timestamp <= expiration) revert NotExpired();
        if (isExercised || isLiquidated) revert BadState();
        uint256 cash = _cashBalance();
        uint256 need = collateralDeposited > cash ? (collateralDeposited - cash) : 0;
        if (useAave && need > 0) { _withdrawFromAave(need, address(this)); }
        uint amount = collateralDeposited; collateralDeposited = 0;
        paymentToken.safeTransfer(seller, amount);
        emit DepositRecovered(seller);
    }

    // ---------------------- Liquidations (toujours permises) ---
    function _payoutLiquidation(address liquidator) internal {
        (uint256 toBuyer, uint256 toLiq, , , ) = _previewLiquidation();
        uint256 cash = _cashBalance();
        uint256 needFromAave = (toBuyer + toLiq) > cash ? (toBuyer + toLiq - cash) : 0;
        if (useAave && needFromAave > 0) { _withdrawFromAave(needFromAave, address(this)); }

        if (toBuyer > 0) { paymentToken.safeTransfer(buyer, toBuyer); }
        if (toLiq   > 0) { paymentToken.safeTransfer(liquidator, toLiq); }

        collateralDeposited = 0;
        isLiquidated = true;
        emit OptionLiquidated(liquidator);
        emit LiquidationPayout(liquidator, toBuyer, toLiq);
    }

    function previewLiquidation()
        external
        view
        returns (uint256 toBuyer, uint256 toLiquidator, uint256 available, uint256 buyerTarget, uint256 liquidatorMax)
    { return _previewLiquidation(); }

    function _previewLiquidation()
        internal
        view
        returns (uint256 toBuyer, uint256 toLiquidator, uint256 available, uint256 buyerTarget, uint256 liquidatorMax)
    {
        uint256 minMargin = calculateMinimumMargin();
        buyerTarget = strikePrice;
        uint256 bonusCapByMargin = minMargin > buyerTarget ? (minMargin - buyerTarget) : 0;
        uint256 bonusCapByOnePercent = strikePrice / 100;
        liquidatorMax = bonusCapByMargin < bonusCapByOnePercent ? bonusCapByMargin : bonusCapByOnePercent;

        uint256 cap = collateralDeposited;
        uint256 cash = _cashBalance();
        uint256 aBal = _aaveBalance();
        available = cash + aBal;
        uint256 paying = cap < available ? cap : available;

        if (paying <= buyerTarget) {
            toBuyer = paying;
            toLiquidator = 0;
        } else {
            toBuyer = buyerTarget;
            uint256 remaining = paying - buyerTarget;
            toLiquidator = remaining < liquidatorMax ? remaining : liquidatorMax;
        }
    }

    function liquidateUndercollateralized() public nonReentrant {
        if (isExercised || isLiquidated) revert BadState();
        if (collateralDeposited >= calculateMinimumMargin()) revert Healthy();
        _payoutLiquidation(msg.sender);
    }

    function checkExpirationAndLiquidate() public nonReentrant {
        if (block.timestamp <= contractExpiration) revert NotExpired();
        if (isExercised || isLiquidated) revert BadState();
        if (block.timestamp <= contractExpiration + gracePeriod) revert GracePeriodInProgress();
        _payoutLiquidation(msg.sender);
    }

    function forceLiquidation() public nonReentrant {
        if (isExercised || isLiquidated) revert BadState();
        if (block.timestamp <= contractExpiration + gracePeriod) revert NotAllowed();
        _payoutLiquidation(msg.sender);
    }

    // ------------------- Harvest Aave interests ----------------
    function harvestSurplus(uint256 amount, address to) external onlySeller nonReentrant whenNotPaused {
        if (!useAave) revert AaveDisabled();
        if (to == address(0)) revert ZeroAddress();
        uint256 total = _totalHeld();
        if (total <= collateralDeposited) revert NoSurplus();
        uint256 maxHarvest = total - collateralDeposited;
        if (amount == 0 || amount > maxHarvest) amount = maxHarvest;

        uint256 cash = _cashBalance();
        uint256 need = amount > cash ? (amount - cash) : 0;
        if (useAave && need > 0) { _withdrawFromAave(need, address(this)); }

        paymentToken.safeTransfer(to, amount);
        emit SurplusHarvested(amount, to);
    }

    // ------------------------- Payoff --------------------------
    function calculatePayoff(uint spotPrice) public view returns (int buyerPayoff, int sellerPayoff) {
        if (!isCreated || !premiumPaid) return (0, 0);
        int gain;
        if (isCall) {
            if (spotPrice > strikePrice) gain = int(spotPrice - strikePrice) * int(underlyingAmount);
            else gain = 0;
        } else {
            if (spotPrice < strikePrice) gain = int(strikePrice - spotPrice) * int(underlyingAmount);
            else gain = 0;
        }
        return (gain, -gain);
    }

    // -------------------------- Infos --------------------------
    function actorInfo() public view returns (address _seller, address _buyer, address _underlyingToken, address _paymentToken) {
        return (seller, buyer, address(underlyingToken), address(paymentToken));
    }

    function optionParametersInfo() public view returns (uint _underlyingAmount, uint _strikePrice, uint _premium, uint _expiration, uint _contractExpiration, bool _isCall) {
        return (underlyingAmount, strikePrice, premium, expiration, contractExpiration, isCall);
    }

    function marginInfo() public view returns (uint _collateralDeposited, uint _minimumMarginPercent, uint _minimumMarginAbsolute, bool _marginInPercent, uint _proposedMargin, bool _marginProposalInProgress) {
        return (collateralDeposited, minimumMarginPercent, minimumMarginAbsolute, marginInPercent, proposedMargin, marginProposalInProgress);
    }

    function delayInfo() public view returns (uint _gracePeriod, uint _proposedDelay, bool _delayProposalInProgress) {
        return (gracePeriod, proposedDelay, delayProposalInProgress);
    }

    function stateInfo() public view returns (bool _isCreated, bool _premiumPaid, bool _isExercised, bool _isCancelled, bool _isLiquidated) {
        return (isCreated, premiumPaid, isExercised, isCancelled, isLiquidated);
    }

    function buybackInfo() public view returns (uint _proposedBuybackPrice, bool _buybackProposed) {
        return (proposedBuybackPrice, buybackProposed);
    }

    function expirationInfo() public view returns (uint _proposedNewExpiration, bool _newExpirationProposed) {
        return (proposedNewExpiration, newExpirationProposed);
    }

    function miscellaneousInfo() public view returns (bytes32 _identifier, string memory _description) {
        return (identifier, description);
    }

    // ----------------------- Oracle plumbing -------------------
    function setOracle(address _oracle) public onlySeller whenNotPaused {
        if (_oracle == address(0)) revert ZeroAddress();
        oracle = IPriceOracle(_oracle);
        emit OracleUpdated(_oracle);
    }

    function _spot() internal view returns (uint256) { return oracle.latestPrice(); }
    function isInTheMoneyNow() external view returns (bool) { return isInTheMoney(_spot()); }
    function calculatePayoffNow() external view returns (int buyerPayoff, int sellerPayoff) { return calculatePayoff(_spot()); }
}
