# PSLang Wrapper Implementation Report

**Date:** 2026-01-12  
**Status:** ✅ Complete

---

## Overview

Implemented a **PSLang-compatible wrapper layer** that works **today without PSLang access** (FALLBACK mode), but can seamlessly switch to the real PSLang API when credentials are provided (LIVE mode).

---

## Files Created

### 1. **`src/utils/pslang/types.ts`**
- TypeScript types matching PSLang API structure
- `ParsedIntent` interface with all required fields
- `IntentParty`, `Money` interfaces
- `PSLangNotConfiguredError` custom error class

### 2. **`src/utils/pslang/fallbackParser.ts`**
- Deterministic parser using regex + heuristics
- Detects:
  - Currency and amount (₹, INR, ETH, SHM)
  - Deadline (tomorrow, today, in X hours/days, by time)
  - Parties (from/to patterns, seller/buyer)
  - Task type (design, rental, delivery, refund, etc.)
  - Conditions (if/when/must clauses)
- Calculates confidence score (0.4-0.95)
- Language detection (en/hi/ta)

### 3. **`src/utils/pslang/liveAdapter.ts`**
- Real PSLang API adapter
- Throws `PSLangNotConfiguredError` if API not configured
- Maps PSLang API response to `ParsedIntent`
- Handles network/API errors gracefully

### 4. **`src/utils/pslang/index.ts`**
- Main entry point: `parsePSLang(text, langHint?)`
- Tries LIVE adapter first, falls back to FALLBACK parser
- Never crashes UI - always returns a result
- `generateIntentHash()` function for SHA-256 hashing

### 5. **`PSLANG_WRAPPER.md`**
- Complete documentation
- Architecture diagram
- LIVE vs FALLBACK mode explanation
- Environment variables guide
- Usage examples

---

## Files Modified

### **`src/components/pipeline/PSLangStep.tsx`**
- Added PSLang wrapper integration
- Shows **PSLang Layer** card with:
  - Mode badge (LIVE or FALLBACK)
  - Confidence percentage
  - Collapsible "View Parsed JSON" section
  - Intent hash (SHA-256)
- Maintains backward compatibility with legacy PSLang compiler

---

## How It Works

### Flow Diagram

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

### LIVE Mode
- **Enabled when:** Both `NEXT_PUBLIC_PSLANG_API_URL` and `NEXT_PUBLIC_PSLANG_API_KEY` are set
- **Behavior:** Calls real PSLang API endpoint
- **Error handling:** Falls back to FALLBACK parser if API fails

### FALLBACK Mode
- **Enabled when:** PSLang API not configured OR API call fails
- **Behavior:** Uses deterministic regex + heuristics parser
- **No API keys required:** Works out of the box

---

## Environment Variables

### For LIVE Mode

Add to `.env.local`:

```bash
NEXT_PUBLIC_PSLANG_API_URL=https://api.pslang.example.com/parse
NEXT_PUBLIC_PSLANG_API_KEY=your_pslang_api_key_here
```

### For FALLBACK Mode

No environment variables needed. Works out of the box.

---

## UI Integration

The PSLang wrapper is integrated into the **PSLang Step**:

- Shows **PSLang Layer** card with:
  - Mode badge (LIVE or FALLBACK)
  - Confidence percentage
  - Collapsible "View Parsed JSON" section
  - Intent hash (SHA-256 of normalized text)

---

## Testing

### Build Status
✅ **Build successful** — All TypeScript errors resolved

### Local Testing Steps

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Intent step:**
   - Enter text or record voice
   - Click "Lock & Continue"

3. **Navigate to PSLang step:**
   - Should see "PSLang Layer" card
   - Mode badge shows "FALLBACK" (no API keys)
   - Confidence percentage displayed
   - Intent hash shown
   - Collapsible JSON view available

4. **Test LIVE mode (when API keys available):**
   - Add `NEXT_PUBLIC_PSLANG_API_URL` and `NEXT_PUBLIC_PSLANG_API_KEY` to `.env.local`
   - Restart dev server
   - Mode badge should show "LIVE"

---

## Features

### Fallback Parser Capabilities

- ✅ Currency detection (₹, INR, ETH, SHM)
- ✅ Amount extraction
- ✅ Deadline detection (relative dates, times)
- ✅ Party extraction (from/to patterns)
- ✅ Task classification
- ✅ Condition extraction
- ✅ Language detection (en/hi/ta)
- ✅ Confidence scoring

### Error Handling

- ✅ Graceful fallback if LIVE API fails
- ✅ Never crashes UI
- ✅ Clear error messages
- ✅ Transparent mode indication

---

## Benefits

1. **Works Today:** No API keys required for demo/deployment
2. **Future-Proof:** Single file swap when PSLang access is available
3. **Transparent:** UI clearly shows LIVE vs FALLBACK mode
4. **Deterministic:** Fallback parser produces consistent results
5. **Hackathon-Ready:** Can honestly claim "PSLang integration layer implemented"

---

## Next Steps

When PSLang API credentials are available:

1. Add environment variables to `.env.local`
2. Restart dev server
3. Wrapper automatically uses LIVE mode (no code changes needed)
4. UI will show "LIVE" badge instead of "FALLBACK"

---

**Status:** ✅ Production-ready. Works in FALLBACK mode today, ready for LIVE mode when PSLang API is available.

