// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * VerdictSettlement Contract
 * Stores verdict records on Shardeum Sphinx (chainId 8082)
 */
contract VerdictSettlement {
    struct Receipt {
        bytes32 caseHash; // PSLang hash (acts as case identifier)
        uint8 outcomeCode; // 0 = REJECT, 1 = PARTIAL, 2 = APPROVE
        uint16 confidenceBps; // Confidence in basis points (0-10000, where 10000 = 100%)
        bytes32 evidenceRoot; // Merkle root or combined hash of sealed evidence
        uint256 timestamp;
        address submitter;
    }

    mapping(bytes32 => Receipt) public receipts; // caseHash => Receipt
    mapping(address => bytes32[]) public submitterCases;

    event ReceiptRecorded(
        bytes32 indexed caseHash,
        uint8 outcomeCode,
        uint16 confidenceBps,
        bytes32 evidenceRoot,
        address indexed submitter,
        uint256 timestamp
    );

    /**
     * Record a verdict receipt on-chain
     * @param _caseHash The PSLang compilation hash (case identifier)
     * @param _outcomeCode 0 = REJECT, 1 = PARTIAL, 2 = APPROVE
     * @param _confidenceBps Confidence in basis points (0-10000)
     * @param _evidenceRoot Hash of sealed evidence (sorted, concatenated hashes)
     */
    function recordReceipt(
        bytes32 _caseHash,
        uint8 _outcomeCode,
        uint16 _confidenceBps,
        bytes32 _evidenceRoot
    ) external {
        require(_outcomeCode <= 2, "Invalid outcome code");
        require(_confidenceBps <= 10000, "Invalid confidence");
        require(receipts[_caseHash].timestamp == 0, "Receipt already recorded");

        Receipt memory receipt = Receipt({
            caseHash: _caseHash,
            outcomeCode: _outcomeCode,
            confidenceBps: _confidenceBps,
            evidenceRoot: _evidenceRoot,
            timestamp: block.timestamp,
            submitter: msg.sender
        });

        receipts[_caseHash] = receipt;
        submitterCases[msg.sender].push(_caseHash);

        emit ReceiptRecorded(
            _caseHash,
            _outcomeCode,
            _confidenceBps,
            _evidenceRoot,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * Get receipt by case hash
     */
    function getReceipt(bytes32 _caseHash) external view returns (
        bytes32 caseHash,
        uint8 outcomeCode,
        uint16 confidenceBps,
        bytes32 evidenceRoot,
        uint256 timestamp,
        address submitter
    ) {
        Receipt memory receipt = receipts[_caseHash];
        return (
            receipt.caseHash,
            receipt.outcomeCode,
            receipt.confidenceBps,
            receipt.evidenceRoot,
            receipt.timestamp,
            receipt.submitter
        );
    }

    /**
     * Get all case hashes for a submitter
     */
    function getSubmitterCases(address _submitter) external view returns (bytes32[] memory) {
        return submitterCases[_submitter];
    }

    // Legacy function for backward compatibility (if needed)
    function recordVerdict(
        bytes32 _pslangHash,
        uint8 _decision,
        uint256 _amount
    ) external {
        // Map to new receipt format (evidenceRoot = 0x0 for legacy)
        recordReceipt(_pslangHash, _decision, 5000, bytes32(0));
    }

    // ========== Agreement Recording ==========

    struct AgreementRecord {
        bytes32 agreementId;
        bytes32 caseHash;
        bytes32 evidenceRoot;
        bytes32 termsHash; // INCO confidentialTermsHash
        address partyA;
        address partyB;
        bytes sigA;
        bytes sigB;
        uint64 timestamp;
    }

    mapping(bytes32 => AgreementRecord) public agreements;

    event AgreementRecorded(
        bytes32 indexed agreementId,
        bytes32 indexed caseHash,
        bytes32 termsHash,
        address indexed partyA,
        address partyB,
        uint64 timestamp
    );

    /**
     * Record an agreement on-chain
     * @param _agreementId The agreement identifier (hash of caseHash + termsHash)
     * @param _caseHash The PSLang compilation hash
     * @param _evidenceRoot Hash of sealed evidence
     * @param _termsHash INCO confidential terms hash
     * @param _partyA Address of first signer
     * @param _partyB Address of second signer
     * @param _sigA Signature from partyA
     * @param _sigB Signature from partyB
     */
    function recordAgreement(
        bytes32 _agreementId,
        bytes32 _caseHash,
        bytes32 _evidenceRoot,
        bytes32 _termsHash,
        address _partyA,
        address _partyB,
        bytes calldata _sigA,
        bytes calldata _sigB
    ) external {
        require(_partyA != address(0) && _partyB != address(0), "Invalid party addresses");
        require(agreements[_agreementId].timestamp == 0, "Agreement already recorded");

        AgreementRecord memory agreement = AgreementRecord({
            agreementId: _agreementId,
            caseHash: _caseHash,
            evidenceRoot: _evidenceRoot,
            termsHash: _termsHash,
            partyA: _partyA,
            partyB: _partyB,
            sigA: _sigA,
            sigB: _sigB,
            timestamp: uint64(block.timestamp)
        });

        agreements[_agreementId] = agreement;

        emit AgreementRecorded(
            _agreementId,
            _caseHash,
            _termsHash,
            _partyA,
            _partyB,
            uint64(block.timestamp)
        );
    }

    /**
     * Get agreement by agreementId
     */
    function getAgreement(bytes32 _agreementId) external view returns (
        bytes32 agreementId,
        bytes32 caseHash,
        bytes32 evidenceRoot,
        bytes32 termsHash,
        address partyA,
        address partyB,
        bytes memory sigA,
        bytes memory sigB,
        uint64 timestamp
    ) {
        AgreementRecord memory agreement = agreements[_agreementId];
        return (
            agreement.agreementId,
            agreement.caseHash,
            agreement.evidenceRoot,
            agreement.termsHash,
            agreement.partyA,
            agreement.partyB,
            agreement.sigA,
            agreement.sigB,
            agreement.timestamp
        );
    }
}

