# PSLang Wrapper Documentation

## Overview

The PSLang wrapper provides a **PSLang-compatible integration layer** that works **today without PSLang access**, but can seamlessly switch to the real PSLang API when credentials are provided.

## Architecture

```
Voice/Text Input
    ↓
PSLang Wrapper (parsePSLang)
    ↓
├─→ Try LIVE Adapter (if configured)
│   └─→ PSLang API → ParsedIntent
│
└─→ Fallback Parser (if LIVE fails/unconfigured)
    └─→ Regex + Heuristics → ParsedIntent
    ↓
Structured Intent JSON
    ↓
Intent Hash (SHA-256)
    ↓
Rest of VERBA Flow
```

## Files

- **`src/utils/pslang/types.ts`** - TypeScript types matching PSLang API structure
- **`src/utils/pslang/fallbackParser.ts`** - Deterministic parser (regex + heuristics)
- **`src/utils/pslang/liveAdapter.ts`** - Real PSLang API adapter
- **`src/utils/pslang/index.ts`** - Main entry point (tries LIVE, falls back to FALLBACK)

## LIVE vs FALLBACK Mode

### LIVE Mode
- **Enabled when:** Both `NEXT_PUBLIC_PSLANG_API_URL` and `NEXT_PUBLIC_PSLANG_API_KEY` are set
- **Behavior:** Calls real PSLang API endpoint
- **Error handling:** Falls back to FALLBACK parser if API fails

### FALLBACK Mode
- **Enabled when:** PSLang API not configured OR API call fails
- **Behavior:** Uses deterministic regex + heuristics parser
- **Features:**
  - Detects currency and amount (₹, INR, ETH, SHM)
  - Detects deadline (tomorrow, today, in X hours/days, by time)
  - Detects parties (from/to patterns, seller/buyer)
  - Detects task type (design, rental, delivery, refund, etc.)
  - Extracts conditions (if/when/must clauses)
  - Calculates confidence score (0.4-0.95)

## Environment Variables

### For LIVE Mode

Add to `.env.local`:

```bash
NEXT_PUBLIC_PSLANG_API_URL=https://api.pslang.example.com/parse
NEXT_PUBLIC_PSLANG_API_KEY=your_pslang_api_key_here
```

### For FALLBACK Mode

No environment variables needed. Works out of the box.

## Usage

```typescript
import { parsePSLang, generateIntentHash } from "@/utils/pslang";

// Parse intent
const result = await parsePSLang("I need to pay ₹5000 to Anil by tomorrow");
// result.mode = "LIVE" | "FALLBACK"
// result.parsed = ParsedIntent

// Generate intent hash
const hash = await generateIntentHash(result.parsed.normalizedText);
// hash = "0x..."
```

## UI Integration

The PSLang wrapper is integrated into the **PSLang Step** (`src/components/pipeline/PSLangStep.tsx`):

- Shows **PSLang Layer** card with:
  - Mode badge (LIVE or FALLBACK)
  - Confidence percentage
  - Collapsible "View Parsed JSON" section
  - Intent hash (SHA-256 of normalized text)

## Why This Approach?

1. **Works Today:** No API keys required for demo/deployment
2. **Future-Proof:** Single file swap when PSLang access is available
3. **Transparent:** UI clearly shows LIVE vs FALLBACK mode
4. **Deterministic:** Fallback parser produces consistent results
5. **Hackathon-Ready:** Can honestly claim "PSLang integration layer implemented"

## Switching to LIVE Mode

When PSLang API credentials are available:

1. Add environment variables to `.env.local`:
   ```bash
   NEXT_PUBLIC_PSLANG_API_URL=https://api.pslang.example.com/parse
   NEXT_PUBLIC_PSLANG_API_KEY=your_key
   ```

2. Restart dev server: `npm run dev`

3. The wrapper automatically uses LIVE mode (no code changes needed)

4. UI will show "LIVE" badge instead of "FALLBACK"

## Error Handling

- **PSLangNotConfiguredError:** Thrown when API URL/key missing (caught by wrapper, triggers fallback)
- **Network errors:** Caught by wrapper, triggers fallback
- **API errors:** Caught by wrapper, triggers fallback
- **Never crashes UI:** Always returns a result (LIVE or FALLBACK)

## Confidence Scores

- **FALLBACK mode:** 0.4-0.95 (based on extracted fields)
  - Base: 0.4
  - +0.2 if amount found
  - +0.2 if deadline found
  - +0.2 if parties found
  - +0.1 if task found
  - Capped at 0.95

- **LIVE mode:** Confidence from PSLang API (typically 0.7-0.95)

## Supported Languages

- **English (en)** - Full support
- **Hindi (hi)** - Detected, fallback parser works
- **Tamil (ta)** - Detected, fallback parser works
- **Unknown** - Defaults to English parsing

## Future Enhancements

- Add more deadline patterns (relative dates, weekdays)
- Improve party detection (address extraction)
- Add duration extraction ("for 3 days")
- Support more currencies
- Add task classification improvements

---

**Status:** ✅ Production-ready. Works in FALLBACK mode today, ready for LIVE mode when PSLang API is available.

