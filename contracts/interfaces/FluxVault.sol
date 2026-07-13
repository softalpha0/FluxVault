// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FTSOIntegration.sol";
import "./YieldStrategy.sol";

contract FluxVault is ERC20, ReentrancyGuard, Ownable {

    FTSOIntegration public ftso;
    YieldStrategy   public strategy;

    mapping(address => bool)    public supportedAssets;
    mapping(address => uint256) public totalDeposited;
    mapping(address => mapping(address => uint256)) public userDeposits;
    mapping(address => mapping(address => uint256)) public userShares;

    uint256 public lastRebalanceTime;
    uint256 public constant REBALANCE_COOLDOWN  = 1 hours;
    uint256 public constant REBALANCE_THRESHOLD = 1000;

    event Deposited(address indexed user, address indexed asset, uint256 amount, uint256 usdValue, uint256 sharesMinted);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount, uint256 yield);
    event Rebalanced(address indexed asset, uint256 newAllocation, uint256 triggerPrice);
    event AssetAdded(address indexed asset);

    constructor(address _ftso, address _strategy)
        ERC20("FluxVault Share", "FLUX")
        Ownable(msg.sender)
    {
        ftso = FTSOIntegration(_ftso);
        strategy = YieldStrategy(_strategy);
        lastRebalanceTime = block.timestamp;
    }

    function deposit(address asset, uint256 amount) external nonReentrant {
        require(supportedAssets[asset], "Asset not supported");
        require(amount > 0, "Amount must be > 0");
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        uint256 usdValue = ftso.getUSDValue(asset, amount);
        uint256 sharesToMint = _calculateShares(asset, amount);
        userDeposits[msg.sender][asset] += amount;
        userShares[msg.sender][asset]   += sharesToMint;
        totalDeposited[asset]           += amount;
        _mint(msg.sender, sharesToMint);
        strategy.allocate(msg.sender, asset, amount);
        ftso.snapshotPrice(asset);
        emit Deposited(msg.sender, asset, amount, usdValue, sharesToMint);
    }

    function withdraw(address asset, uint256 sharesToBurn) external nonReentrant {
        require(supportedAssets[asset], "Asset not supported");
        require(sharesToBurn > 0, "Must burn > 0 shares");
        require(balanceOf(msg.sender) >= sharesToBurn, "Insufficient FLUX shares");
        require(userShares[msg.sender][asset] >= sharesToBurn, "Insufficient asset shares");
        uint256 principalAmount = _calculateAmount(asset, sharesToBurn);
        uint256 yieldEarned = strategy.getYieldEarned(msg.sender, asset);
        userShares[msg.sender][asset]   -= sharesToBurn;
        userDeposits[msg.sender][asset] -= principalAmount;
        totalDeposited[asset]           -= principalAmount;
        _burn(msg.sender, sharesToBurn);
        strategy.withdraw(msg.sender, asset, principalAmount);
        uint256 totalOut = principalAmount + yieldEarned;
        require(IERC20(asset).balanceOf(address(this)) >= totalOut, "Insufficient vault balance");
        IERC20(asset).transfer(msg.sender, totalOut);
        emit Withdrawn(msg.sender, asset, principalAmount, yieldEarned);
    }

    function checkAndRebalance(address asset) external {
        require(supportedAssets[asset], "Asset not supported");
        require(block.timestamp >= lastRebalanceTime + REBALANCE_COOLDOWN, "Cooldown active");
        (bool dropped, uint256 currentPrice) = ftso.hasPriceDropped(asset, REBALANCE_THRESHOLD);
        if (dropped) {
            uint256 newAllocation = strategy.rebalance(asset, currentPrice);
            lastRebalanceTime = block.timestamp;
            emit Rebalanced(asset, newAllocation, currentPrice);
        }
    }

    function getUserPosition(address user, address asset)
        external view returns (
            uint256 deposited,
            uint256 usdValue,
            uint256 yieldEarned,
            uint256 currentAPY,
            uint256 shares
        )
    {
        deposited   = userDeposits[user][asset];
        usdValue    = ftso.getUSDValue(asset, deposited);
        yieldEarned = strategy.getYieldEarned(user, asset);
        currentAPY  = strategy.getCurrentAPY(asset);
        shares      = userShares[user][asset];
    }

    function getTVLInUSD(address asset) external view returns (uint256) {
        return ftso.getUSDValue(asset, totalDeposited[asset]);
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
        supportedAssets[asset] = true;
        emit AssetAdded(asset);
    }

    function updateFTSO(address _ftso) external onlyOwner {
        ftso = FTSOIntegration(_ftso);
    }

    function updateStrategy(address _strategy) external onlyOwner {
        strategy = YieldStrategy(_strategy);
    }
}