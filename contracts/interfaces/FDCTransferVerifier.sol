// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IEVMTransaction} from "@flarenetwork/flare-periphery-contracts/coston2/IEVMTransaction.sol";
import {IFdcVerification} from "@flarenetwork/flare-periphery-contracts/coston2/IFdcVerification.sol";

/**
 * @title FDCTransferVerifier
 * @notice Uses Flare Data Connector to verify EVM transactions from Sepolia
 * @dev Demonstrates FDC cross-chain verification for FluxVault
 */
contract FDCTransferVerifier {

    struct VerifiedTransfer {
        address from;
        address to;
        uint256 value;
        bytes32 txHash;
        uint64 timestamp;
    }

    VerifiedTransfer[] public verifiedTransfers;
    mapping(bytes32 => bool) public processedTxHashes;

    address public owner;

    event TransferVerified(bytes32 indexed txHash, address from, address to, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Verify an EVM transaction proof from FDC
     * @param transaction The FDC proof containing the verified transaction data
     */
    function verifyAndRecordTransfer(
        IEVMTransaction.Proof calldata transaction
    ) external {
        // 1. Verify the proof is valid using Flare's FDC verification contract
        require(
            isEVMTransactionProofValid(transaction),
            "Invalid FDC proof"
        );

        // 2. Get transaction hash
        bytes32 txHash = transaction.data.requestBody.transactionHash;
        require(!processedTxHashes[txHash], "Transaction already processed");

        // 3. Mark as processed
        processedTxHashes[txHash] = true;

        // 4. Process Transfer events from the transaction
        for (uint256 i = 0; i < transaction.data.responseBody.events.length; i++) {
            IEVMTransaction.Event memory evt = transaction.data.responseBody.events[i];

            // Check for Transfer event signature
            if (
                evt.topics.length >= 3 &&
                evt.topics[0] == keccak256(abi.encodePacked("Transfer(address,address,uint256)"))
            ) {
                address from = address(uint160(uint256(evt.topics[1])));
                address to = address(uint160(uint256(evt.topics[2])));
                uint256 value = abi.decode(evt.data, (uint256));

                verifiedTransfers.push(VerifiedTransfer({
                    from: from,
                    to: to,
                    value: value,
                    txHash: txHash,
                    timestamp: transaction.data.responseBody.timestamp
                }));

                emit TransferVerified(txHash, from, to, value);
            }
        }
    }

    function isEVMTransactionProofValid(
        IEVMTransaction.Proof calldata transaction
    ) public view returns (bool) {
        IFdcVerification fdc = ContractRegistry.getFdcVerification();
        return fdc.verifyEVMTransaction(transaction);
    }

    function getVerifiedTransfers() external view returns (VerifiedTransfer[] memory) {
        return verifiedTransfers;
    }

    function getVerifiedCount() external view returns (uint256) {
        return verifiedTransfers.length;
    }

    function isTxProcessed(bytes32 txHash) external view returns (bool) {
        return processedTxHashes[txHash];
    }
}