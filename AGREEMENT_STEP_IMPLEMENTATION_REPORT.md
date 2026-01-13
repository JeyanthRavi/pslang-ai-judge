# Agreement Step Implementation Report

**Date:** 2026-01-12  
**Status:** ✅ Core Implementation Complete

---

## Overview

Implemented a final "Agreement" step after Verdict that generates a settlement contract, routes contract terms through INCO adapter for confidential handling, supports two-party signing, and is ready for Shardeum on-chain recording.

---

## Files Created

### 1. **`src/lib/contractBuilder.ts`**
- Generates human-readable settlement contracts
- Creates deterministic hashes (termsHash, agreementId)
- Handles both string and array rationale formats
- Async hash generation using Web Crypto API

### 2. **`src/components/pipeline/AgreementStep.tsx`**
- Full Agreement step component
- Contract text display
- INCO confidential receipt display (LOCAL_PROOF)
- Two-party signing interface (Party A and Party B)
- Shareable link generation for Party B
- Wallet integration via wagmi

---

## Files Modified

### 1. **`src/types/pipeline.ts`**
- Added `"agreement"` to `PipelineStep` type
- Added `AgreementData` interface:
  - `contractText`, `termsHash`, `agreementId`
  - `contractReceipt` (INCO receipt)
  - `partyA` and `partyB` (address + signature)
  - `txHash`, `verified`
- Added `ContractReceipt` interface
- Updated `VerdictData` to support `rationale` as string or string[]

### 2. **`src/store/PipelineContext.tsx`**
- Added `agreement` step to `initialSteps`

### 3. **`src/lib/constants.ts`**
- Added `"agreement"` to `STEP_ORDER`
- Added labels and descriptions for Agreement step

### 4. **`src/integrations/inco/IncoAdapter.ts`**
- Extended with contract-specific functions:
  - `prepareConfidentialContract()`
  - `submitConfidentialContract()` - Returns `ConfidentialContractReceipt`
  - `getContractReceipt()`
- Added `ConfidentialContractReceipt` interface
- Added `ContractMetadata` interface

### 5. **`src/app/page.tsx`**
- Added `AgreementStep` import and rendering

---

## Implementation Details

### Contract Generation Flow

1. **Inputs:**
   - Transcript (from Intent step)
   - PSLang case summary
   - Verdict (decision, confidence, rationale)
   - Evidence root hash

2. **Process:**
   - Generates human-readable contract text
   - Creates `termsHash` (SHA-256 of contract text)
   - Creates `agreementId` (SHA-256 of caseHash + termsHash)

3. **INCO Integration:**
   - Submits contract text to INCO adapter
   - Receives `ConfidentialContractReceipt`:
     - `receiptId`
     - `confidentialTermsHash`
     - `accessPolicy` ("Only Party A + Party B")
   - Currently LOCAL_PROOF (mock implementation)

### Two-Party Signing

1. **Party A (Claimant):**
   - Signs `agreementId` via `wagmi` `signMessage`
   - Generates shareable link: `/agreement?agreementId=...`

2. **Party B (Counterparty):**
   - Opens shareable link
   - Connects wallet
   - Signs same `agreementId`

3. **Storage:**
   - Both signatures stored in pipeline state
   - Ready for on-chain recording

### INCO Confidential Terms

- **Status:** LOCAL_PROOF (mock implementation)
- **Display:** Shows receipt ID, confidential terms hash, access policy
- **Badge:** "LOCAL_PROOF" to indicate mock status
- **Future:** Ready for real INCO SDK integration

---

## Remaining Tasks (Documented)

### 1. Shardeum Smart Contract Update

**File:** `contracts/VerdictSettlement.sol`

Add agreement recording function:

```solidity
struct Agreement {
    bytes32 agreementId;
    bytes32 caseHash;
    bytes32 evidenceRoot;
    bytes32 confidentialTermsHash; // From INCO receipt
    address partyA;
    address partyB;
    bytes signatureA;
    bytes signatureB;
    uint256 timestamp;
}

mapping(bytes32 => Agreement) public agreements;

function recordAgreement(
    bytes32 agreementId,
    bytes32 caseHash,
    bytes32 evidenceRoot,
    bytes32 confidentialTermsHash,
    address partyA,
    address partyB,
    bytes calldata sigA,
    bytes calldata sigB
) external {
    agreements[agreementId] = Agreement({
        agreementId: agreementId,
        caseHash: caseHash,
        evidenceRoot: evidenceRoot,
        confidentialTermsHash: confidentialTermsHash,
        partyA: partyA,
        partyB: partyB,
        signatureA: sigA,
        signatureB: sigB,
        timestamp: block.timestamp
    });
    
    emit AgreementRecorded(agreementId, caseHash, confidentialTermsHash);
}

function getAgreement(bytes32 agreementId) external view returns (Agreement memory) {
    return agreements[agreementId];
}
```

### 2. Wallet Component Update

**File:** `src/components/wallet/WalletSettlement.tsx`

Add agreement recording:
- "Record Agreement on Shardeum" button (enabled when both signatures exist)
- Calls `recordAgreement()` with all parameters
- "Verify Agreement" read-back function
- Match indicators for stored vs local data

### 3. Integration Status Update

**File:** `src/lib/integrationStatus.ts`

Update to check:
- Shardeum agreement = LIVE only if tx exists + read-back matches
- INCO = LOCAL_PROOF unless real endpoint configured

---

## Current Flow

1. ✅ **Verdict** → Decision rendered
2. ✅ **Agreement** → Contract generated
3. ✅ **INCO** → Confidential terms receipt (LOCAL_PROOF)
4. ✅ **Sign A** → Party A signs agreementId
5. ✅ **Sign B** → Party B signs agreementId (via shareable link)
6. ⏳ **Record on Shardeum** → (Contract update needed)
7. ⏳ **Verify** → (Wallet component update needed)

---

## Testing

### Local Test Steps

1. Complete pipeline through Verdict
2. Navigate to Agreement step
3. Verify contract text is generated
4. Verify INCO receipt shows (LOCAL_PROOF badge)
5. Connect wallet and sign as Party A
6. Copy shareable link
7. Open link in new tab/window
8. Connect different wallet and sign as Party B
9. Verify both signatures stored

---

## Status

✅ **Core Implementation:** Complete  
⏳ **Shardeum Contract:** Needs update (documented above)  
⏳ **Wallet Integration:** Needs agreement recording UI (documented above)  
⏳ **Integration Status:** Needs update (documented above)

---

**Next Steps:**
1. Update Shardeum contract with `recordAgreement()` function
2. Deploy updated contract
3. Update wallet component to call agreement recording
4. Update integration status resolver
5. Test end-to-end flow

---

**Note:** The Agreement step is fully functional for contract generation, INCO receipt (LOCAL_PROOF), and two-party signing. Shardeum on-chain recording requires the contract update and wallet component enhancement documented above.

