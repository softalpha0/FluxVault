// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFlareContractRegistry {
    function getContractAddressByName(string calldata _name) external view returns (address);
}

interface IFtsoV2 {
    function getFeedById(bytes21 _feedId) external view returns (uint256, int8, uint64);
}

contract FTSOIntegration {
    IFtsoV2 public ftsoV2;

    bytes21 public constant BTC_USD_FEED  = bytes21(bytes("FtsoV2/BTC/USD"));
    bytes21 public constant XRP_USD_FEED  = bytes21(bytes("FtsoV2/XRP/USD"));
    bytes21 public constant DOGE_USD_FEED = bytes21(bytes("FtsoV2/DOGE/USD"));

    mapping(address => bytes21)  public assetFeedIds;
    mapping(address => uint256)  public lastRecordedPrice;
    mapping(address => uint64)   public lastPriceTimestamp;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        ftsoV2 = IFtsoV2(
            IFlareContractRegistry(0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019)
                .getContractAddressByName("FtsoV2")
        );
    }

    function getBTCPrice() external view returns (uint256, int8, uint64) {
        return ftsoV2.getFeedById(BTC_USD_FEED);
    }

    function getXRPPrice() external view returns (uint256, int8, uint64) {
        return ftsoV2.getFeedById(XRP_USD_FEED);
    }

    function getDOGEPrice() external view returns (uint256, int8, uint64) {
        return ftsoV2.getFeedById(DOGE_USD_FEED);
    }

    function getAssetPrice(address asset)
        external view returns (uint256, int8, uint64)
    {
        bytes21 feedId = assetFeedIds[asset];
        require(feedId != bytes21(0), "Feed not configured");
        return ftsoV2.getFeedById(feedId);
    }

    function getUSDValue(address asset, uint256 amount)
        external view returns (uint256)
    {
        bytes21 feedId = assetFeedIds[asset];
        require(feedId != bytes21(0), "Feed not configured");
        (uint256 price, int8 decimals, ) = ftsoV2.getFeedById(feedId);
        if (decimals >= 0) {
            return (amount * price) / (10 ** (12 + uint8(decimals)));
        } else {
            return (amount * price * (10 ** uint8(-decimals))) / 1e12;
        }
    }

    function hasPriceDropped(address asset, uint256 thresholdBps)
        external returns (bool dropped, uint256 currentPrice)
    {
        bytes21 feedId = assetFeedIds[asset];
        require(feedId != bytes21(0), "Feed not configured");
        (uint256 price, , uint64 timestamp) = ftsoV2.getFeedById(feedId);
        currentPrice = price;
        uint256 last = lastRecordedPrice[asset];
        lastRecordedPrice[asset] = price;
        lastPriceTimestamp[asset] = timestamp;
        if (last == 0) return (false, price);
        if (price < last) {
            uint256 dropBps = ((last - price) * 10000) / last;
            dropped = dropBps >= thresholdBps;
        }
    }

    function snapshotPrice(address asset) external {
        bytes21 feedId = assetFeedIds[asset];
        require(feedId != bytes21(0), "Feed not configured");
        (uint256 price, , uint64 timestamp) = ftsoV2.getFeedById(feedId);
        lastRecordedPrice[asset] = price;
        lastPriceTimestamp[asset] = timestamp;
    }

    function setAssetFeed(address asset, bytes21 feedId) external onlyOwner {
        assetFeedIds[asset] = feedId;
    }

    function setMultipleAssetFeeds(
        address[] calldata assets,
        bytes21[] calldata feedIds
    ) external onlyOwner {
        require(assets.length == feedIds.length, "Length mismatch");
        for (uint i = 0; i < assets.length; i++) {
            assetFeedIds[assets[i]] = feedIds[i];
        }
    }
}