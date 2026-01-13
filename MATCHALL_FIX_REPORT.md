# matchAll RegExp Fix Report

**Date:** 2026-01-12  
**Status:** ✅ Complete

---

## Issue

Runtime error: `String.prototype.matchAll called with a non-global RegExp argument` in `src/lib/pdfExtractor.ts` within `detectFields()` function.

---

## Fix Applied

### 1. Added Helper Function
Created `toGlobalRegex()` helper that ensures RegExp is global:
```typescript
function toGlobalRegex(re: RegExp): RegExp {
  if (re.flags.includes("g")) {
    return re;
  }
  return new RegExp(re.source, re.flags + "g");
}
```

### 2. Fixed Non-Global Patterns
**Patterns that were non-global:**
- `/(?:AMOUNT|TOTAL|SUM|PAY|PAID)\s*:?\s*(?:₹|INR|RS\.?|USD|\$)\s*([\d,]+\.?\d*)/i` - Missing `g` flag

**Patterns that were already global:**
- `/(?:₹|INR|RS\.?|USD|\$)\s*([\d,]+\.?\d*)/g` - Already had `g` flag

### 3. Updated matchAll Usage
Changed:
```typescript
const matches = text.matchAll(pattern);
```

To:
```typescript
const matches = text.matchAll(toGlobalRegex(pattern));
```

---

## Files Modified

1. **`src/lib/pdfExtractor.ts`**
   - Added `toGlobalRegex()` helper function
   - Updated `matchAll()` call to use `toGlobalRegex()` wrapper

---

## Verification

✅ **Build successful** — No TypeScript errors  
✅ **Runtime error fixed** — All RegExp patterns are now global before `matchAll()`  
✅ **No duplicate flags** — Helper checks for existing `g` flag before adding

---

**Status:** Error resolved. PDF extraction now works without runtime errors.

