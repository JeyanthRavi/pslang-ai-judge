# ThinkRoot Bounty Integration Guide

**VERBA's PSLang Intent Translation + Code-Generation-Ready Pipeline**

---

## What ThinkRoot is Used For

### PSLang Intent Translation Pipeline

VERBA uses ThinkRoot's PSLang approach to translate **natural language testimony** into **structured, code-generation-ready intent specifications**.

**The Flow:**
```
Voice/Text Testimony
    ↓
PSLang Wrapper (parsePSLang)
    ↓
Structured Intent JSON
    ↓
Code-Generation-Ready Spec
    ↓
Drives: Smart contract calls, Agreement text, Future automated code generation
```

**What Gets Extracted:**
- **Currency & Amount** — ₹, INR, ETH, SHM, USD, etc.
- **Deadline** — "tomorrow", "in 3 days", "by 5 PM", relative dates
- **Parties** — From/to patterns, seller/buyer, entity names
- **Task Type** — Design, rental, delivery, refund, service, etc.
- **Conditions** — If/when/must clauses, requirements
- **Confidence Score** — 0.4-0.95 based on extraction quality

**The Output (Structured Intent JSON):**
```json
{
  "currency": "INR",
  "amount": 5000,
  "deadline": "2026-01-13T12:00:00Z",
  "parties": {
    "from": "User",
    "to": "Anil"
  },
  "task": "payment",
  "conditions": ["Payment must be completed by deadline"],
  "normalizedText": "Pay ₹5000 to Anil by tomorrow",
  "confidence": 0.85
}
```

**This structured spec is code-generation-ready:**
- Can drive smart contract function calls
- Can generate agreement text automatically
- Can create dispute template code
- Can assemble legal documents programmatically

---

## Where It Appears in UI

### 1. PSLang Step (`src/components/pipeline/PSLangStep.tsx`)

**Location:** Step 2 of the pipeline (after Intent Capture)

**What You See:**
- **"Structured Case Summary"** card (GlassCard)
- **Mode Badge:** "LIVE" (if PSLang API configured) or "FALLBACK" (deterministic parser)
- **Confidence:** Percentage display (e.g., "85%")
- **Intent Hash:** SHA-256 hash of normalized text (e.g., `0x3a7f2...`)
- **Extracted Fields:** Chips showing claim type, amount, parties
- **Collapsible "View Technical Details":**
  - Full PSLang JSON output
  - Line-by-line animated compilation
  - Evidence references (evidenceId links)

**Demo Script:**
1. Complete Intent step (voice or text)
2. Navigate to PSLang step
3. Watch animated compilation
4. Expand "View Technical Details" to see full JSON
5. Note the mode badge (LIVE/FALLBACK)
6. Note the intent hash (used for on-chain verification)

### 2. ReviewModeDrawer (Top-Right)

**Location:** Fixed position, top-right corner

**What You See:**
- **PSLang Hash:** First 20 characters of intent hash
- **Mode Indicator:** Shows "LIVE" or "FALLBACK" status
- **Confidence Score:** From parsed intent

**How to Access:**
1. Click "Review Mode" button (top-right)
2. Drawer opens showing all proof metrics
3. PSLang hash is displayed in the drawer

### 3. Evidence Step Integration

**Location:** Step 3 (Evidence Upload)

**Connection:**
- PSLang compilation references `evidenceId`s from sealed evidence
- Evidence root hash is included in on-chain receipts
- Shows how PSLang spec links to actual evidence files

---

## Where It Plugs In Backend

### PSLang Wrapper Architecture

**File Structure:**
```
src/utils/pslang/
├── index.ts           # Main entry point (tries LIVE, falls back)
├── liveAdapter.ts     # Real PSLang API adapter
├── fallbackParser.ts  # Deterministic parser (works without API)
└── types.ts          # TypeScript types matching PSLang structure
```

### How It Works

**1. Main Entry Point (`index.ts`):**
```typescript
export async function parsePSLang(
  text: string,
  langHint?: "en" | "hi" | "ta"
): Promise<ParseResult> {
  // Try LIVE adapter first
  try {
    const parsed = await parseLive(text, langHint);
    return { mode: "LIVE", parsed };
  } catch (error) {
    // Fall back to deterministic parser
    const parsed = parseFallback(text, langHint);
    return { mode: "FALLBACK", parsed };
  }
}
```

**2. LIVE Adapter (`liveAdapter.ts`):**
- Checks for `NEXT_PUBLIC_PSLANG_API_URL` and `NEXT_PUBLIC_PSLANG_API_KEY`
- If missing, throws `PSLangNotConfiguredError` (triggers fallback)
- If present, calls ThinkRoot PSLang API
- Returns parsed intent from API response

**3. FALLBACK Parser (`fallbackParser.ts`):**
- Uses regex + heuristics to extract fields
- Deterministic (same input → same output)
- Works without any API keys
- Confidence scoring based on extraction quality

### Environment Variables

**For LIVE Mode:**
```bash
NEXT_PUBLIC_PSLANG_API_URL=https://api.pslang.example.com/parse
NEXT_PUBLIC_PSLANG_API_KEY=your_pslang_api_key_here
```

**For FALLBACK Mode:**
- No environment variables needed
- Works out of the box

### Integration Points

**1. Intent Step → PSLang Step:**
- `src/components/pipeline/IntentStep.tsx` captures voice/text
- `src/components/pipeline/PSLangStep.tsx` calls `parsePSLang()`
- Displays result with mode badge and JSON

**2. PSLang Step → Evidence Step:**
- PSLang compilation includes `evidenceId` references
- Evidence step seals evidence and generates `evidenceRoot`
- Both are used in on-chain receipts

**3. PSLang Step → Verdict Step:**
- Intent hash (`caseHash`) is used for on-chain verification
- Verdict references PSLang fields in rationale

---

## Demo Script Specifically for ThinkRoot Judges

**Duration:** 60-90 seconds

### Step 1: Voice Capture (15 seconds)
1. Click "Begin Testimony"
2. Select "Voice" tab
3. Click "Start Recording"
4. Say: **"I need to pay ₹5000 to Anil by tomorrow for the design work."**
5. Click "Stop Recording"
6. Click "Seal statement"

### Step 2: PSLang Visualization (20 seconds)
1. Navigate to PSLang step (automatic)
2. **Watch animated compilation** (line-by-line JSON appears)
3. **Check mode badge:**
   - If "FALLBACK" → Shows deterministic parser is working
   - If "LIVE" → Shows ThinkRoot PSLang API is connected
4. **Expand "View Technical Details"** to see full JSON:
   ```json
   {
     "currency": "INR",
     "amount": 5000,
     "deadline": "2026-01-13T12:00:00Z",
     "parties": { "from": "User", "to": "Anil" },
     "task": "payment",
     "confidence": 0.85
   }
   ```
5. **Note the intent hash** (e.g., `0x3a7f2...`) — this is used for on-chain verification
6. Click "Confirm & continue"

### Step 3: Evidence Upload (10 seconds)
1. Drag & drop a file (PDF/image)
2. Wait for extraction (if PDF)
3. Click "Lock files & continue"
4. **Note:** PSLang compilation references `evidenceId`s from sealed evidence

### Step 4: Review Mode Drawer (15 seconds)
1. Click "Review Mode" button (top-right)
2. **Check PSLang Hash** — Shows first 20 chars of intent hash
3. **Check Mode Indicator** — Shows "LIVE" or "FALLBACK"
4. **Check Confidence** — From parsed intent

### Step 5: Verdict & On-Chain (20 seconds)
1. Complete Deliberation step
2. Navigate to Verdict step
3. **Note:** Verdict references PSLang fields (amount, parties) in rationale
4. Click "Record on Shardeum (Relayed)"
5. **Note:** Transaction uses `caseHash` (derived from PSLang intent hash)
6. Verify on-chain receipt matches local PSLang hash

### Key Points to Highlight

✅ **PSLang wrapper works today** (FALLBACK mode) without API keys  
✅ **Seamlessly switches to LIVE mode** when ThinkRoot API credentials are provided  
✅ **Structured intent JSON is code-generation-ready** — can drive smart contracts, agreement text, automated code  
✅ **Intent hash is used for on-chain verification** — links testimony to blockchain records  
✅ **Transparent mode indication** — UI clearly shows LIVE vs FALLBACK  

---

## Claims Checklist

### ✅ What We Can Claim

- **PSLang-compatible integration layer implemented** — ✅ True (wrapper exists, works in FALLBACK, ready for LIVE)
- **Structured intent translation** — ✅ True (natural language → JSON spec)
- **Code-generation-ready output** — ✅ True (structured JSON can drive code generation)
- **Deterministic fallback parser** — ✅ True (works without API keys)
- **LIVE mode support** — ✅ True (adapter exists, switches automatically when API keys provided)
- **Intent hash for on-chain verification** — ✅ True (SHA-256 hash used in blockchain records)

### ❌ What We Cannot Claim

- **Direct ThinkRoot SDK usage** — ❌ Not claimed (we use API adapter, not SDK)
- **PSLang API always connected** — ❌ Not claimed (works in FALLBACK mode without API)
- **100% accuracy in parsing** — ❌ Not claimed (confidence scores shown, fallback is heuristic-based)

### Truth Table

| Claim | Status | Evidence |
|-------|--------|----------|
| PSLang wrapper exists | ✅ True | `src/utils/pslang/` directory |
| FALLBACK mode works | ✅ True | Works without API keys, deterministic |
| LIVE mode ready | ✅ True | `liveAdapter.ts` exists, switches automatically |
| Structured JSON output | ✅ True | `ParsedIntent` type, visible in UI |
| Code-gen ready spec | ✅ True | JSON structure can drive code generation |
| Intent hash on-chain | ✅ True | Used in `caseHash` for Shardeum receipts |
| ThinkRoot SDK used | ❌ False | We use API adapter, not SDK |

---

## Technical Details

### PSLang Wrapper Implementation

**Type Safety:**
- `src/utils/pslang/types.ts` defines `ParsedIntent` interface matching PSLang API structure
- TypeScript ensures type safety throughout

**Error Handling:**
- `PSLangNotConfiguredError` thrown when API not configured (caught, triggers fallback)
- Network errors caught, triggers fallback
- Never crashes UI — always returns a result

**Confidence Scoring:**
- **FALLBACK mode:** 0.4-0.95 (based on extracted fields)
  - Base: 0.4
  - +0.2 if amount found
  - +0.2 if deadline found
  - +0.2 if parties found
  - +0.1 if task found
  - Capped at 0.95
- **LIVE mode:** Confidence from PSLang API (typically 0.7-0.95)

**Language Support:**
- **English (en)** — Full support
- **Hindi (hi)** — Detected, fallback parser works
- **Tamil (ta)** — Detected, fallback parser works
- **Unknown** — Defaults to English parsing

### Code-Generation Readiness

**The structured intent JSON can drive:**

1. **Smart Contract Calls:**
   ```solidity
   function executePayment(
     address to,
     uint256 amount,
     uint256 deadline
   ) external {
     // Uses parsed intent fields
   }
   ```

2. **Agreement Text Generation:**
   ```typescript
   const agreement = generateAgreement({
     amount: parsedIntent.amount,
     currency: parsedIntent.currency,
     deadline: parsedIntent.deadline,
     parties: parsedIntent.parties
   });
   ```

3. **Automated Code Generation:**
   ```typescript
   // Future: Generate dispute template code from intent spec
   const template = generateDisputeTemplate(parsedIntent);
   ```

---

## Future Enhancements

- Add more deadline patterns (relative dates, weekdays)
- Improve party detection (address extraction)
- Add duration extraction ("for 3 days")
- Support more currencies
- Add task classification improvements
- Generate smart contract code from intent spec
- Generate legal document templates from intent spec

---

## Status

✅ **Production-ready.** Works in FALLBACK mode today, ready for LIVE mode when ThinkRoot PSLang API is available.

**Files:**
- `src/utils/pslang/index.ts` — Main entry point
- `src/utils/pslang/liveAdapter.ts` — LIVE mode adapter
- `src/utils/pslang/fallbackParser.ts` — FALLBACK mode parser
- `src/utils/pslang/types.ts` — TypeScript types
- `PSLANG_WRAPPER.md` — Technical documentation

