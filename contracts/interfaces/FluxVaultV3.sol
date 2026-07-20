// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FluxVaultV3
 * @notice Handles FAssets with any decimal precision (6 for FXRP, 18 for mock tokens)
 */
contract FluxVaultV3 is ERC20, ReentrancyGuard, Ownable {

    mapping(address => bool)    public supportedAssets;
    mapping(address => uint256) public totalDeposited;
    mapping(address => uint8)   public assetDecimals;
    mapping(address => uint256) public assetAPY;
    mapping(address => mapping(address => uint256)) public userDeposits;
    mapping(address => mapping(address => uint256)) public userShares;
    mapping(address => mapping(address => uint256)) public depositTimestamp;

    event Deposited(address indexed user, address indexed asset, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount, uint256 yield);
    event AssetAdded(address indexed asset, uint8 decimals);
    event APYSet(address indexed asset, uint256 apyBps);

    constructor() ERC20("FluxVault Share", "FLUX") Ownable(msg.sender) {}

    function deposit(address asset, uint256 amount) external nonReentrant {
        require(supportedAssets[asset], "Asset not supported");
        require(amount > 0, "Amount must be > 0");

        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        uint256 sharesToMint = _calculateShares(asset, amount);

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

        uint256 principalAmount = _calculateAmount(asset, sharesToBurn);
        uint256 yieldEarned = getYieldEarned(msg.sender, asset);

        userShares[msg.sender][asset]   -= sharesToBurn;
        userDeposits[msg.sender][asset] -= principalAmount;
        totalDeposited[asset]           -= principalAmount;

        _burn(msg.sender, sharesToBurn);

        uint256 totalOut = principalAmount + yieldEarned;
        uint256 vaultBal = IERC20(asset).balanceOf(address(this));
        uint256 actualOut = totalOut > vaultBal ? vaultBal : totalOut;

        IERC20(asset).transfer(msg.sender, actualOut);

        emit Withdrawn(msg.sender, asset, principalAmount, yieldEarned);
    }

    function getYieldEarned(address user, address asset) public view returns (uint256) {
        uint256 deposited = userDeposits[user][asset];
        if (deposited == 0) return 0;
        uint256 timeElapsed = block.timestamp - depositTimestamp[user][asset];
        uint256 apy = assetAPY[asset];
        if (apy == 0) return 0;
        return (deposited * apy * timeElapsed) / (365 days * 10000);
    }

    /**
     * @notice Returns position normalized to 18 decimals for frontend display
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
        uint256 rawDeposited = userDeposits[user][asset];
        uint8 dec = assetDecimals[asset];

        // Normalize to 18 decimals for consistent frontend display
        if (dec < 18 && dec > 0) {
            deposited = rawDeposited * (10 ** (18 - dec));
        } else {
            deposited = rawDeposited;
        }

        usdValue    = 0;
        yieldEarned = getYieldEarned(user, asset);

        // Normalize yield too
        if (dec < 18 && dec > 0) {
            yieldEarned = yieldEarned * (10 ** (18 - dec));
        }

        currentAPY  = assetAPY[asset];
        shares      = userShares[user][asset];
    }

    function getTotalDeposited(address asset) external view returns (uint256) {
        return totalDeposited[asset];
    }

    function _calculateShares(address asset, uint256 amount) internal view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 total  = totalDeposited[asset];
        if (supply == 0 || total == 0) return amount;
        return (amount * supply) / total;
    }

    function _calculateAmount(address asset, uint256 shares) internal view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        return (shares * totalDeposited[asset]) / supply;
    }

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