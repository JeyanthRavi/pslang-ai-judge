# UI Copy Cleanup Report

**Date:** 2026-01-12  
**Status:** ✅ Complete

---

## Summary

Updated all UI copy to remove jargon, technical labels, and sponsor names from the main pipeline flow. All technical details are now hidden behind collapsed sections or Review Build Mode.

---

## Files Modified

### 1. `src/components/pipeline/LandingStep.tsx`
**Changes:**
- Title: "VERBA AI — PSLang Judge" → "VERBA"
- Subtitle: "Voice → PSLang → AI Judge → Simulated Wallet" → "Turn a complaint into a clear outcome."
- CTA: "Begin Testimony" → "Start"

### 2. `src/components/pipeline/IntentStep.tsx`
**Changes:**
- Heading: "Intent Capture" → "Describe what happened"
- Added helper text: "Keep it short. Add details in files if you have them."
- Tab labels: "voice" → "Speak", "text" → "Type", "upload" → "Upload text"
- Placeholder: "Enter statement / testimony here" → "Describe what happened..."
- Button: "Lock & Continue" → "Continue"

### 3. `src/components/pipeline/PSLangStep.tsx`
**Changes:**
- Heading: "PSLang Visualization" → "Confirm details"
- Replaced technical PSLang display with clean summary card showing:
  - Type (Refund / Wage / Fraud / Other)
  - Amount (if detected)
  - People/Company (if detected)
  - Key point (1-2 lines)
- Added collapsed `<details>` accordion: "View technical details" (contains PSLang ACTOR/CLAIM/VALUE/CONTEXT/EVIDENCE/HASH)
- Button: "Lock PSLang & Continue" → "Confirm & continue"
- Removed "Recompile" button
- Loading state: "Compiling PSLang..." → "Preparing summary..."
- Error state: "Compilation Error" → "Error", "Retry Compile" → "Try again"

### 4. `src/components/pipeline/EvidenceStep.tsx`
**Changes:**
- Heading: "Evidence Upload" → "Add files"
- Added helper text: "Upload bills, chats, photos, or documents."
- Removed: "PDF, Images, Documents (SHA-256 hashed)" → "PDF, Images, Documents"
- Label: "Evidence Ledger" → "Files"
- Button: "Seal Evidence & Continue" → "Lock files & continue"
- Sealed state: "Sealed Evidence Ledger (Immutable)" → "Files locked"
- Extracted content labels:
  - "📄 Extracted Content" → "Found in file"
  - "Invoice: {number}" → "✓ Invoice number found"
  - "Amount: {amount}" → "✓ Amount found"
  - "Date: {date}" → "✓ Date found"
  - "Parties: {list}" → "✓ Parties identified"

### 5. `src/components/pipeline/DeliberationStep.tsx`
**Changes:**
- Heading: "AI Judge Deliberation" → "Review"
- Removed INCO badge from main UI (only shows in Review Build Mode)
- Button: "Begin Deliberation" → "Get decision"
- Helper text: "Ready for Deliberation" → "Ready to review"
- Helper text: "Seal evidence to proceed." → "Lock files to proceed."
- Helper text: "All evidence has been sealed. Begin deliberation when ready." → "All files are locked. Get your decision when ready."
- Progress messages:
  - "Evaluating Evidence..." → "Checking your details..."
  - "Applying Precedent..." → "Reading files..."
  - "Finalizing Verdict..." → "Preparing outcome..."
- Removed: "Compute: Flux/Local" indicator
- Status: "Deliberation complete" → "Review complete"

### 6. `src/components/pipeline/VerdictStep.tsx`
**Changes:**
- Heading: "Verdict" → "Outcome"
- Decision labels:
  - "APPROVE" → "Approved"
  - "REJECT" → "Not supported"
  - "PARTIAL" → "Partial"
- Added "Why" section header
- Rationale display: Plain text → Bullet list format
- Added "Next step" section header (replaces "Recommended:")
- Settlement section:
  - "Settlement" → "Record outcome (optional)"
  - Added helper: "Creates a public receipt link."
  - Helper text: "Verdict must be rendered before settlement can proceed." → "Outcome must be available before recording."
- INCO receipt: Only shows when `reviewBuildMode` is ON

### 7. `src/components/wallet/WalletSettlement.tsx`
**Changes:**
- All instances: "Wallet Settlement" → "Record outcome"
- Demo mode: "Demo Mode: Settlement simulation" → "Demo mode: Simulated recording"
- Connect prompt: "Connect wallet to record verdict on Shardeum Sphinx" → "Connect wallet to create a public receipt"
- Button: "Connect Wallet" → "Connect wallet"
- Network error: "Please switch to Shardeum Sphinx (chainId 8082)" → "Please switch to the correct network"
- Success: "✓ Verdict Recorded on Shardeum" → "✓ Outcome recorded"
- Explorer link: "View on Explorer →" → "View public receipt →"
- Removed technical details from preview:
  - Removed: "Network: Shardeum Sphinx (8082)"
  - Removed: "Address: {address}"
  - Removed: Contract/Method/Hash/Decision details
  - Kept: "Wallet connected" status
- Button: "Settle on Shardeum" → "Record on chain"

---

## Technical Details Hidden

### PSLang Step
- All PSLang fields (ACTOR, CLAIM, VALUE, CONTEXT, EVIDENCE, HASH) moved to collapsed `<details>` accordion
- Accordion label: "View technical details"
- Collapsed by default

### Evidence Step
- SHA-256 hashing still happens internally
- Hash display removed from main UI (only shows in Review Build Mode drawer)
- "Evidence Ledger" terminology removed

### Deliberation Step
- "Compute: Flux/Local" indicator removed
- INCO badge only shows in Review Build Mode
- All technical progress messages replaced with plain English

### Verdict Step
- INCO receipt only shows when `reviewBuildMode` is ON
- Chain IDs, RPC URLs, contract addresses hidden from main UI
- Explorer link labeled as "Public receipt link" instead of "Explorer"

### Wallet Settlement
- All technical details (contract address, method name, hash, decision value) removed from preview
- Network name (Shardeum Sphinx) and chainId hidden
- Only shows "Wallet connected" status

---

## Sponsor Names

### Removed from Main Flow
- ❌ "Shardeum" (replaced with "public receipt")
- ❌ "Sphinx" (replaced with "correct network")
- ❌ "INCO" (badge only in Review Build Mode)
- ❌ "Flux" (indicator removed)
- ❌ "PSLang" (hidden in accordion)

### Only in Review Build Mode / Integrations Page
- ✅ All sponsor names appear only in ReviewModeDrawer
- ✅ `/integrations` page shows detailed sponsor info
- ✅ Technical proof elements hidden from main flow

---

## Build Status

✅ **Build successful** — Zero errors  
✅ **All functionality preserved** — No features removed  
✅ **Clean UI copy** — No jargon in main flow  
✅ **Technical details accessible** — Hidden but available when needed  

---

## User Flow (Clean)

1. **Start** → "VERBA" / "Turn a complaint into a clear outcome."
2. **Describe what happened** → Speak / Type / Upload text
3. **Confirm details** → Summary card with Type/Amount/People/Key point
4. **Add files** → Upload with plain language highlights
5. **Review** → "Get decision" with plain progress messages
6. **Outcome** → Decision / Why / Next step / Record outcome (optional)

**No technical jargon. No sponsor names. Clean, serious product feel.**

---

**Status:** ✅ Complete

