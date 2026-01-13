# Prerender Fix Report — Global Providers

**Date:** 2026-01-12  
**Status:** ✅ Fixed permanently

---

## Problem

The `/integrations` page was being pre-rendered as a Server Component but was calling `usePipelineContext()`, which requires `PipelineProvider` to be available. This caused a build error:

```
Error: usePipelineContext must be used within PipelineProvider
```

## Root Cause

- `PipelineProvider` was only wrapping the homepage (`src/app/page.tsx`)
- `/integrations` route had no access to `PipelineProvider` during prerender
- Next.js App Router prerenders pages at build time, and client hooks require providers to be available

## Solution

### 1. Created Global AppProviders Wrapper

**File:** `src/providers/AppProviders.tsx` (NEW)

- Wraps all routes with necessary providers:
  - `WalletProvider` (outer)
  - `PipelineProvider` (inner)
- Single "use client" directive
- Exported for use in layout

### 2. Updated Root Layout

**File:** `src/app/layout.tsx`

- Replaced `WalletProvider` with `AppProviders`
- Now all routes have access to both Wallet and Pipeline providers
- Removed duplicate provider usage

### 3. Removed Duplicate Provider from Homepage

**File:** `src/app/page.tsx`

- Removed `PipelineProvider` wrapper (now global)
- PipelineContent uses context directly

### 4. Fixed /integrations Page

**File:** `src/app/integrations/page.tsx`

- Already had "use client" directive
- Now safely uses `usePipelineContext()` (available globally)
- Handles empty pipeline data gracefully (defaults for demoMode, incoMode, txHash)

## Files Changed

1. **NEW:** `src/providers/AppProviders.tsx` - Global provider wrapper
2. **MODIFIED:** `src/app/layout.tsx` - Uses AppProviders instead of WalletProvider only
3. **MODIFIED:** `src/app/page.tsx` - Removed duplicate PipelineProvider
4. **MODIFIED:** `src/app/integrations/page.tsx` - Uses pipeline context safely

## Why This Fixes the Prerender Error Permanently

1. **Global Provider Access:** All routes now have `PipelineProvider` available via `AppProviders` in root layout
2. **Client Component:** `/integrations` is marked "use client" so it can use hooks
3. **Safe Fallbacks:** Page handles empty pipeline data gracefully
4. **No Duplicate Providers:** Single provider tree prevents conflicts

## Build Status

✅ **Build successful** - No prerender errors
✅ **All routes have provider access**
✅ **No duplicate providers**

## Verification

```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages using 7 workers (6/6)
# ○ (Static) prerendered as static content
```

The prerender error is permanently fixed because:
- Providers are now global (available to all routes)
- Client components can safely use hooks
- No server/client component mismatch

---

## Conclusion

The architecture is now correct: providers are global, routes can safely use context hooks, and the build will never fail with "PipelineProvider missing" again.

