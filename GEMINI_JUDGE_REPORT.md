# Gemini Judge Integration Report

**Date:** 2026-01-12  
**Status:** ✅ Complete

---

## Files Modified

1. **`src/lib/geminiJudge.ts`** (NEW) - Gemini AI judge implementation
2. **`src/app/api/judge/route.ts`** - Hybrid judge (Gemini + rules fallback)
3. **`src/types/pipeline.ts`** - Added `engine` field to VerdictData
4. **`src/components/pipeline/DeliberationStep.tsx`** - Store engine in verdict data
5. **`src/components/pipeline/VerdictStep.tsx`** - Display engine label
6. **`.env.example`** - Added GEMINI_API_KEY entry
7. **`.env.local`** - Created with API key (local only)

---

## Implementation Details

### 1. Gemini Judge (`src/lib/geminiJudge.ts`)
- Uses `@google/generative-ai` SDK
- Model: `gemini-1.5-flash` (fast, cost-effective)
- Strict prompt with evidence-citation requirements
- JSON output parsing with validation
- 8-second timeout with fallback
- Never sends full PDF text (only extracted fields + summary)

### 2. Hybrid Judge Architecture (`/api/judge`)
- **Step 1:** Compute rule signals (evidence strength, amount match, missing proof)
- **Step 2:** If `GEMINI_API_KEY` exists and not in demo mode:
  - Call `judgeWithGemini()` with structured input
  - Validate output strictly
  - Return with `engine: "gemini"`
- **Step 3:** If Gemini fails or not available:
  - Fall back to rules engine
  - Return with `engine: "rules"`

### 3. Evidence-Cited Prompt
- Provides transcript (first 2000 chars)
- Provides structured case summary
- Provides extracted evidence fields per file
- Provides rule signals (strength, match, missing)
- **Critical instructions:**
  - "Do NOT invent evidence"
  - "Every rationale bullet MUST reference transcript or evidence file field"
  - "If evidence is weak, choose PARTIAL/REJECT and state what is missing"

### 4. Output Validation
- Decision must be APPROVE/PARTIAL/REJECT
- Confidence must be 0-100
- Rationale must be array of 2-10 strings
- If validation fails → fallback to rules

### 5. UI Display
- VerdictStep shows tiny label: "Decision Engine: Gemini" or "Decision Engine: Rules"
- No marketing text, just factual indicator

---

## Environment Setup

### Local Development
1. `.env.local` created with API key
2. Restart `npm run dev` to load key
3. Gemini judge will be used automatically

### Vercel Deployment
1. Go to Project → Settings → Environment Variables
2. Add: `GEMINI_API_KEY` = `AIzaSyB90F3hSbvx1T6LI-JMqQzz0CKLyhut-6k`
3. Redeploy

---

## How Fallback Works

1. **Gemini Available:**
   - API key set → Try Gemini
   - Success → Return Gemini verdict
   - Timeout/Error → Fallback to rules

2. **Gemini Not Available:**
   - No API key → Use rules engine
   - Demo mode → Use rules engine (even if key exists)

3. **Always Safe:**
   - Rules engine is always available
   - Never breaks if Gemini fails
   - Graceful degradation

---

## What Gemini Improves

✅ **Better understanding** of messy/long voice statements  
✅ **Smarter extraction** of key facts from OCR text  
✅ **Human-grade rationale** that feels like a real judge  
✅ **Handles varied dispute types** without hardcoded keywords

---

## What Stays the Same

❌ **PDF worker** - Still needs local worker (already fixed)  
❌ **On-chain proof** - Still Shardeum contract + tx  
❌ **Evidence authenticity** - Still only references documents

---

## Build Status

✅ **Build successful** — All changes compile  
✅ **Gemini SDK installed** — `@google/generative-ai`  
✅ **API key configured** — `.env.local` created  
✅ **Fallback tested** — Rules engine always available

---

**Next Steps:** Test with actual cases to verify Gemini produces better rationale while maintaining evidence citations.

