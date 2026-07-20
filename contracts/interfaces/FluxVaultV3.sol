// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FluxVaultV3
 * @notice Non-custodial yield vault for Flare FAssets
 * @dev Normalizes all amounts to 18 decimals internally for consistent share math
 */
contract FluxVaultV3 is ERC20, ReentrancyGuard, Ownable {

    mapping(address => bool)    public supportedAssets;
    mapping(address => uint8)   public assetDecimals;
    mapping(address => uint256) public assetAPY;

    // Stored in raw token decimals
    mapping(address => uint256) public totalDeposited;
    mapping(address => mapping(address => uint256)) public userDeposits;
    mapping(address => mapping(address => uint256)) public userShares;
    mapping(address => mapping(address => uint256)) public depositTimestamp;

    event Deposited(address indexed user, address indexed asset, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount, uint256 yieldAmount);
    event AssetAdded(address indexed asset, uint8 decimals);
    event APYSet(address indexed asset, uint256 apyBps);

    constructor() ERC20("FluxVault Share", "FLUX") Ownable(msg.sender) {}

    // ── Normalize to 18 decimals ───────────────────────────────────────
    function _to18(uint256 amount, uint8 dec) internal pure returns (uint256) {
        if (dec == 18) return amount;
        return amount * (10 ** (18 - dec));
    }

    function _fromNorm(uint256 amount18, uint8 dec) internal pure returns (uint256) {
        if (dec == 18) return amount18;
        return amount18 / (10 ** (18 - dec));
    }

    // ── Core functions ─────────────────────────────────────────────────

    function deposit(address asset, uint256 amount) external nonReentrant {
        require(supportedAssets[asset], "Asset not supported");
        require(amount > 0, "Amount must be > 0");

        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        uint8 dec = assetDecimals[asset];
        uint256 amount18 = _to18(amount, dec);

        uint256 sharesToMint = _calculateShares(asset, amount18);

        if (depositTimestamp[msg.sender][asset] == 0) {
            depositTimestamp[msg.sender][asset] = block.timestamp;
        }

        userDeposits[msg.sender][asset] += amount;
        userShares[msg.sender][asset]   += sharesToMint;
        totalDeposited[asset]           += amount;

        _mint(msg.sender, sharesToMint);

        emit Deposited(msg.sender, asset, amount, sharesToMint);
    }

    function withdraw(address asset, uint256 sharesToBurn) external nonReentrant {
        require(supportedAssets[asset], "Asset not supported");
        require(sharesToBurn > 0, "Must burn > 0 shares");
        require(balanceOf(msg.sender) >= sharesToBurn, "Insufficient FLUX shares");
        require(userShares[msg.sender][asset] >= sharesToBurn, "Insufficient asset shares");

        uint8 dec = assetDecimals[asset];
        uint256 principalAmount = _calculateAmount(asset, sharesToBurn);
        uint256 yieldEarned18   = getYieldEarned18(msg.sender, asset);
        uint256 yieldRaw        = _fromNorm(yieldEarned18, dec);

        userShares[msg.sender][asset]   -= sharesToBurn;
        userDeposits[msg.sender][asset] -= principalAmount;
        totalDeposited[asset]           -= principalAmount;

        _burn(msg.sender, sharesToBurn);

        uint256 totalOut = principalAmount + yieldRaw;
        uint256 vaultBal = IERC20(asset).balanceOf(address(this));
        uint256 actualOut = totalOut > vaultBal ? vaultBal : totalOut;

        IERC20(asset).transfer(msg.sender, actualOut);

        emit Withdrawn(msg.sender, asset, principalAmount, yieldRaw);
    }

    // ── Yield ──────────────────────────────────────────────────────────

    function getYieldEarned18(address user, address asset) public view returns (uint256) {
        uint256 deposited = userDeposits[user][asset];
        if (deposited == 0) return 0;
        uint8 dec = assetDecimals[asset];
        uint256 deposited18 = _to18(deposited, dec);
        uint256 timeElapsed = block.timestamp - depositTimestamp[user][asset];
        uint256 apy = assetAPY[asset];
        if (apy == 0) return 0;
        return (deposited18 * apy * timeElapsed) / (365 days * 10000);
    }

    // ── View ───────────────────────────────────────────────────────────

    /**
     * @notice All values returned in 18 decimals for consistent frontend display
     */
    function getUserPosition(address user, address asset)
        external view returns (
            uint256 deposited,
            uint256 usdValue,
            uint256 yieldEarned,
            uint256 currentAPY,
            uint256 shares
        )
    {
        uint8 dec = assetDecimals[asset];
        deposited   = _to18(userDeposits[user][asset], dec);
        usdValue    = 0;
        yieldEarned = getYieldEarned18(user, asset);
        currentAPY  = assetAPY[asset];
        shares      = userShares[user][asset];
    }

    function getTotalDeposited(address asset) external view returns (uint256) {
        return _to18(totalDeposited[asset], assetDecimals[asset]);
    }

    // ── Internal share math ────────────────────────────────────────────

    function _calculateShares(address asset, uint256 amount18) internal view returns (uint256) {
        uint256 supply  = totalSupply();
        uint256 total18 = _to18(totalDeposited[asset], assetDecimals[asset]);
        if (supply == 0 || total18 == 0) return amount18;
        return (amount18 * supply) / total18;
    }

    function _calculateAmount(address asset, uint256 shares) internal view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        uint256 total18 = _to18(totalDeposited[asset], assetDecimals[asset]);
        uint256 amount18 = (shares * total18) / supply;
        return _fromNorm(amount18, assetDecimals[asset]);
    }

    // ── Admin ──────────────────────────────────────────────────────────

    function addSupportedAsset(address asset) external onlyOwner {
        uint8 dec = IERC20Metadata(asset).decimals();
        supportedAssets[asset] = true;
        assetDecimals[asset] = dec;
        emit AssetAdded(asset, dec);
    }

    function setAPY(address asset, uint256 apyBps) external onlyOwner {
        assetAPY[asset] = apyBps;
        emit APYSet(asset, apyBps);
    }
}