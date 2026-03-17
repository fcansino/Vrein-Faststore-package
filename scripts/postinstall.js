/**
 * Postinstall: patch @faststore/cli to allow /api custom pages.
 * Runs automatically when the parent project installs @vreinai/faststore-components.
 */

const fs = require('fs')
const path = require('path')

let cliFile
try {
  cliFile = require.resolve('@faststore/cli/dist/utils/createNextjsPages.js')
} catch {
  console.log('[vrein-patch] @faststore/cli not found, skipping patch.')
  process.exit(0)
}

if (!fs.existsSync(cliFile)) {
  console.log('[vrein-patch] CLI file not found, skipping patch.')
  process.exit(0)
}

let content = fs.readFileSync(cliFile, 'utf8')
let changed = false

// Patch 1: Add /api to ALLOWED_PREFIX_PAGES
const p1_original = "const ALLOWED_PREFIX_PAGES = ['/account']"
const p1_patched  = "const ALLOWED_PREFIX_PAGES = ['/account', '/api']"

if (content.includes(p1_original)) {
  content = content.replace(p1_original, p1_patched)
  console.log('[vrein-patch] [1/3] Patched ALLOWED_PREFIX_PAGES to include /api')
  changed = true
} else if (content.includes(p1_patched)) {
  console.log('[vrein-patch] [1/3] Already patched.')
} else {
  console.log('[vrein-patch] [1/3] Pattern not found — skipping.')
}

// Patch 2: Fix Windows backslash in isAllowedPrefixPage
const p2_original = 'return ALLOWED_PREFIX_PAGES.some((prefix) => file.startsWith(prefix));'
const p2_patched  = 'const normalizedFile = file.replace(/\\\\/g, \'/\'); return ALLOWED_PREFIX_PAGES.some((prefix) => normalizedFile.startsWith(prefix));'

if (content.includes(p2_original)) {
  content = content.replace(p2_original, p2_patched)
  console.log('[vrein-patch] [2/3] Patched isAllowedPrefixPage for Windows paths')
  changed = true
} else if (content.includes('normalizedFile')) {
  console.log('[vrein-patch] [2/3] Already patched.')
} else {
  console.log('[vrein-patch] [2/3] Pattern not found — skipping.')
}

// Patch 3: Also copy .ts files (API routes) in createExternalPages
const p3_original = 'if (isReactFile && isDestinationAvailable) {'
const p3_insertion = `// [vrein-patch] Also copy .ts API route files directly
        const isApiRouteFile = filePath.endsWith('.ts') && !filePath.endsWith('.d.ts');
        if (isApiRouteFile && !fs_1.default.existsSync(destinationPath)) {
            fs_1.default.copyFileSync(filePath, destinationPath);
        }
        `

if (!content.includes('[vrein-patch]')) {
  if (content.includes(p3_original)) {
    content = content.replace(p3_original, p3_insertion + p3_original)
    console.log('[vrein-patch] [3/3] Patched createExternalPages to copy .ts API routes')
    changed = true
  } else {
    console.log('[vrein-patch] [3/3] Pattern not found — skipping.')
  }
} else {
  console.log('[vrein-patch] [3/3] Already patched.')
}

if (changed) {
  fs.writeFileSync(cliFile, content)
  console.log('[vrein-patch] All patches applied.')
} else {
  console.log('[vrein-patch] No changes needed.')
}
