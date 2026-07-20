// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FDCVerifier
 * @notice Uses Flare Data Connector to verify XRPL payment proofs
 * @dev Demonstrates FDC integration for cross-chain verification
 */

interface IFdcVerification {
    struct Payment {
        uint256 blockNumber;
        uint256 timestamp;
        address sourceAddress;
        address receivingAddress;
        int256 amount;
        bytes32 id;
        bytes32 standard;
        uint16 chainId;
    }

    struct Proof {
        bytes32[] merkleProof;
        Payment data;
    }

    function verifyPayment(Proof calldata proof) external view returns (bool);
}

contract FDCVerifier {

    // FDC Verification contract on Coston2
    IFdcVerification public fdcVerification;

    address public owner;

    // Track verified XRPL transactions to prevent double-counting
    mapping(bytes32 => bool) public verifiedTxIds;

    // Track verified amounts per user
    mapping(address => uint256) public verifiedDeposits;

    event PaymentVerified(address indexed user, bytes32 txId, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _fdcVerification) {
        owner = msg.sender;
        fdcVerification = IFdcVerification(_fdcVerification);
    }

    /**
     * @notice Verify an XRPL payment proof from FDC
     * @dev In production this gates large FAsset deposits
     * @param proof The FDC merkle proof of the XRPL transaction
     */
    function verifyXRPLPayment(
        IFdcVerification.Proof calldata proof
    ) external returns (bool verified) {
        require(!verifiedTxIds[proof.data.id], "Transaction already verified");

        verified = fdcVerification.verifyPayment(proof);

        if (verified) {
            verifiedTxIds[proof.data.id] = true;
           uint256 absAmount = proof.data.amount > 0 ? uint256(proof.data.amount) : 0;
            verifiedDeposits[msg.sender] += absAmount;
            emit PaymentVerified(msg.sender, proof.data.id, absAmount);
        }
    }

    /**
     * @notice Check if a transaction has been verified
     */
    function isVerified(bytes32 txId) external view returns (bool) {
        return verifiedTxIds[txId];
    }

    /**
     * @notice Get total verified deposit amount for a user
     */
    function getVerifiedAmount(address user) external view returns (uint256) {
        return verifiedDeposits[user];
    }

    function updateFDC(address _fdcVerification) external onlyOwner {
        fdcVerification = IFdcVerification(_fdcVerification);
    }
}