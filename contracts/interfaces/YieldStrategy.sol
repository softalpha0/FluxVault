// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract YieldStrategy {
    address public vault;
    address public owner;

    mapping(address => uint256) public totalAllocated;
    mapping(address => uint256) public assetAPY;
    mapping(address => mapping(address => uint256)) public depositTimestamp;
    mapping(address => mapping(address => uint256)) public userAllocation;

    event Allocated(address indexed asset, uint256 amount);
    event Withdrawn(address indexed asset, uint256 amount);
    event APYUpdated(address indexed asset, uint256 newAPY);

    modifier onlyVault() {
        require(msg.sender == vault, "Only vault");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setVault(address _vault) external onlyOwner {
        vault = _vault;
    }

    function allocate(address user, address asset, uint256 amount) external onlyVault {
        totalAllocated[asset] += amount;
        userAllocation[user][asset] += amount;
        if (depositTimestamp[user][asset] == 0) {
            depositTimestamp[user][asset] = block.timestamp;
        }
        emit Allocated(asset, amount);
    }

    function withdraw(address user, address asset, uint256 amount) external onlyVault {
        require(totalAllocated[asset] >= amount, "Insufficient allocated");
        totalAllocated[asset] -= amount;
        if (userAllocation[user][asset] >= amount) {
            userAllocation[user][asset] -= amount;
        }
        emit Withdrawn(asset, amount);
    }

    function rebalance(address asset, uint256 currentPrice) external onlyVault returns (uint256) {
        uint256 current = totalAllocated[asset];
        uint256 reduction = (current * 20) / 100;
        totalAllocated[asset] = current - reduction;
        emit Withdrawn(asset, reduction);
        return totalAllocated[asset];
    }

    function getYieldEarned(address user, address asset) external view returns (uint256) {
        uint256 deposited = userAllocation[user][asset];
        if (deposited == 0) return 0;
        uint256 timeElapsed = block.timestamp - depositTimestamp[user][asset];
        uint256 apy = assetAPY[asset];
        return (deposited * apy * timeElapsed) / (365 days * 10000);
    }

    function getCurrentAPY(address asset) external view returns (uint256) {
        return assetAPY[asset];
    }

    function setAPY(address asset, uint256 apyBps) external onlyOwner {
        assetAPY[asset] = apyBps;
        emit APYUpdated(asset, apyBps);
    }
}