# Cassette Label UI Overhaul Report

**Date:** 2026-01-12  
**Status:** ✅ Phase 1 Complete (Design System + Landing + Intent + Rail)

---

## Files Modified

1. **`src/app/globals.css`** - Complete redesign with cassette label palette
2. **`src/components/ui/Button.tsx`** - Industrial button design (black/cream, no glow)
3. **`src/components/ui/Badge.tsx`** - Printed sticker design
4. **`src/components/pipeline/PipelineRail.tsx`** - Printed index strip design
5. **`src/components/pipeline/LandingStep.tsx`** - Label column with bands
6. **`src/components/pipeline/IntentStep.tsx`** - Label column with bands

---

## Visual Changes

### Color Palette (Exact from Reference)
- **Paper Cream:** `#F6F0E6` (main content surface)
- **Ink Black:** `#111111` (text, separators)
- **Mustard Band:** `#D9A500` (evidence, highlights)
- **Orange Band:** `#E57A1F` (progress, transitions)
- **Red Band:** `#D81F26` (authority, sealed, decisions)
- **Background Frame:** `#2a2a2a` (darker neutral around label)

### Typography
- **Hero IDs:** Space Grotesk, 56px (STEP-01, CASE-READY style)
- **Body:** Inter
- **Code/Mono:** IBM Plex Mono
- **Hard edges:** 2-4px border radius only

### Layout System
- **Label Column:** 720px max-width, cream background, hard black border
- **Horizontal Bands:** Separated by 1-2px black lines
- **No rounded cards:** Flat sections with borders only

### Buttons
- **Primary:** Black background, cream text, hard border, no glow
- **Hover:** `translateY(-1px)` + subtle shadow
- **Tap:** `translateY(1px)` + `scale(0.99)`
- **Industrial feel:** Rectangular, sharp corners

### Badges/Stickers
- **SEALED:** Red background, white text
- **VERIFIED:** Mustard background, black text
- **LOCKED:** Cream background, black text
- **Printed sticker style:** Black border, uppercase, monospace font

### Pipeline Rail
- **Printed index strip:** Cream background, black lines
- **Active step:** Mustard highlight + black underline
- **Completed:** Black checkmark in square box
- **No neon glow:** Hard black borders only

---

## Jargon Removed

### User-Facing Text Changes
- ✅ "PSLang Visualization" → "Case Summary" (in PSLangStep - needs update)
- ✅ "Deliberation" → "Review" (in DeliberationStep - needs update)
- ✅ "Intent Capture" → "Your statement"
- ✅ "Lock & Continue" → "Seal statement"
- ✅ "Pipeline" → "Index" (in rail)
- ✅ Removed: "neon-accent", "glow", "insane", "goated" from UI labels

### Technical Terms Hidden
- PSLang syntax only in collapsed "Technical details"
- Evidence ledger kept but simplified language
- All sponsor/SDK terms only in Review Build Mode drawer

---

## Remaining Components to Update

1. **PSLangStep.tsx** - Needs label bands + "CASE-HASH" hero ID + rename to "Case Summary"
2. **EvidenceStep.tsx** - Needs mustard band + scanline effects
3. **DeliberationStep.tsx** - Needs status strip + rename to "Review"
4. **VerdictStep.tsx** - Needs red band + outcome identifier

---

## Build Status

✅ **Build successful** — All components compile  
✅ **Design system active** — Colors and typography applied  
✅ **Landing + Intent complete** — Full cassette label UI  
⏳ **Other steps pending** — Still using old design

---

**Next Steps:** Update remaining 4 step components to complete the cassette label UI overhaul.

