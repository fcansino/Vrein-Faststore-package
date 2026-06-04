#!/usr/bin/env node
'use strict'

/**
 * @vreinai/faststore-components setup scaffolder
 *
 * Usage: npx @vreinai/faststore-components setup [options]
 *
 * Options:
 *   --dry-run     Print all files that would be generated/modified. Write nothing.
 *   --yes         Overwrite existing files without prompting (alias: --overwrite).
 *   --overwrite   Same as --yes.
 *   --output-dir  Base directory for generated client files (default: src/customizations/src).
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// ─── Parse args ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isYes = args.includes('--yes') || args.includes('--overwrite')

const outputDirIdx = args.indexOf('--output-dir')
const customOutputDir = outputDirIdx !== -1 ? args[outputDirIdx + 1] : null

// ─── Paths ───────────────────────────────────────────────────────────────────

const cwd = process.cwd()
const packageDir = path.join(__dirname, '..')
const templatesDir = path.join(packageDir, 'templates')

// Default base for generated client src files
const outputBase = customOutputDir
  ? path.resolve(cwd, customOutputDir)
  : path.join(cwd, 'src', 'customizations', 'src')

// ─── Template source → output path mappings ──────────────────────────────────

const files = [
  {
    src: path.join(templatesDir, 'graphql', 'vreinQueries.ts.tpl'),
    dest: path.join(outputBase, 'graphql', 'vrein', 'vreinQueries.ts'),
    label: 'Vrein query documents (scanned by FastStore codegen)',
  },
  {
    src: path.join(templatesDir, 'sdk', 'vreinQueryAdapter.ts.tpl'),
    dest: path.join(outputBase, 'sdk', 'vreinQueryAdapter.ts'),
    label: 'Vrein useQuery adapter (isolated FastStore import)',
  },
  {
    src: path.join(templatesDir, 'graphql', 'vrein.graphql.tpl'),
    dest: path.join(cwd, 'src', 'graphql', 'thirdParty', 'typeDefs', 'vrein.graphql'),
    label: 'Vrein GraphQL type definitions (SDL — must include VreinInstallment)',
  },
  {
    src: path.join(templatesDir, 'resolvers', 'vrein.ts.tpl'),
    dest: path.join(cwd, 'src', 'graphql', 'thirdParty', 'resolvers', 'vrein.ts'),
    label: 'Vrein resolver re-export (registers in FastStore thirdParty)',
  },
  {
    src: path.join(templatesDir, 'components', 'VreinCarousel.tsx.tpl'),
    dest: path.join(cwd, 'src', 'components', 'sections', 'VreinCarousel', 'VreinCarousel.tsx'),
    label: 'VreinCarousel wrapper component',
  },
  {
    src: path.join(templatesDir, 'components', 'VreinImageBanner.tsx.tpl'),
    dest: path.join(cwd, 'src', 'components', 'sections', 'VreinImageBanner', 'VreinImageBanner.tsx'),
    label: 'VreinImageBanner wrapper component',
  },
]

// ─── stale files to warn about ───────────────────────────────────────────────

const staleFiles = [
  path.join(cwd, 'src', 'customizations', 'src', 'pages', 'api', 'vrein.ts'),
  path.join(cwd, 'src', 'pages', 'api', 'vrein.ts'),
]

// ─── CMS sections to merge ────────────────────────────────────────────────────

const cmsSectionsPath = path.join(cwd, 'cms', 'faststore', 'sections.json')

const vreinCarouselSection = {
  name: 'VreinCarousel',
  schema: {
    title: 'Vrein Carousel',
    description: 'Product recommendation carousel powered by Vrein AI',
    type: 'object',
    required: ['sectionId'],
    properties: {
      sectionId: {
        title: 'Section ID',
        type: 'string',
        description: 'Vrein section identifier (e.g. BDW-HOME-Carrusel-1)',
      },
    },
  },
}

const vreinImageBannerSection = {
  name: 'VreinImageBanner',
  schema: {
    title: 'Vrein Image Banner',
    description: 'Smart image banner with optional countdown, powered by Vrein AI',
    type: 'object',
    required: ['sectionId'],
    properties: {
      sectionId: {
        title: 'Section ID',
        type: 'string',
        description: 'Vrein section identifier (e.g. BDW-HOME-Banner-1)',
      },
      height: {
        title: 'Banner height (px)',
        type: 'integer',
        default: 420,
      },
      showLazyLoading: {
        title: 'Show skeleton while loading',
        type: 'boolean',
        default: false,
      },
      lazyLoadingHeight: {
        title: 'Skeleton height (px)',
        type: 'integer',
        default: 400,
      },
    },
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }
}

function writeFile(filePath, content) {
  ensureDir(filePath)
  fs.writeFileSync(filePath, content, 'utf8')
}

function relativePath(absPath) {
  return path.relative(cwd, absPath)
}

function log(action, filePath, extra) {
  const rel = relativePath(filePath)
  const suffix = extra ? `  (${extra})` : ''
  console.log(`[${action}] ${rel}${suffix}`)
}

// ─── Interactive prompt ───────────────────────────────────────────────────────

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

// ─── Core logic ──────────────────────────────────────────────────────────────

async function processFile(entry) {
  const templateContent = readFile(entry.src)
  if (!templateContent) {
    console.error(`[ERROR] Template not found: ${entry.src}`)
    process.exit(1)
  }

  const existing = readFile(entry.dest)

  if (!existing) {
    // File does not exist — create it
    if (isDryRun) {
      log('CREATE', entry.dest, entry.label)
    } else {
      writeFile(entry.dest, templateContent)
      log('CREATE', entry.dest, entry.label)
    }
    return
  }

  if (existing === templateContent) {
    log('SKIP', entry.dest, 'already up to date')
    return
  }

  // File exists but content differs
  if (isDryRun) {
    log('UPDATE', entry.dest, entry.label)
    return
  }

  if (isYes) {
    writeFile(entry.dest, templateContent)
    log('UPDATE', entry.dest, entry.label)
    return
  }

  // Interactive prompt
  const answer = await prompt(`[overwrite] ${relativePath(entry.dest)} already exists and has different content. Overwrite? (y/N) `)
  if (answer === 'y' || answer === 'yes') {
    writeFile(entry.dest, templateContent)
    log('UPDATE', entry.dest, entry.label)
  } else {
    log('SKIP', entry.dest, 'kept existing (user declined overwrite)')
  }
}

async function processCmsSections() {
  if (!fs.existsSync(cmsSectionsPath)) {
    log('WARN', cmsSectionsPath, 'sections.json not found — skipping CMS section merge')
    return
  }

  const raw = readFile(cmsSectionsPath)
  let sections
  try {
    sections = JSON.parse(raw)
  } catch {
    log('WARN', cmsSectionsPath, 'could not parse sections.json — skipping CMS section merge')
    return
  }

  if (!Array.isArray(sections)) {
    log('WARN', cmsSectionsPath, 'sections.json is not an array — skipping CMS section merge')
    return
  }

  const names = new Set(sections.map((s) => s.name))
  let changed = false

  if (!names.has('VreinCarousel')) {
    if (!isDryRun) sections.push(vreinCarouselSection)
    log(isDryRun ? 'ADD-SECTION' : 'ADD-SECTION', cmsSectionsPath, 'VreinCarousel entry')
    changed = true
  } else {
    log('SKIP', cmsSectionsPath, 'VreinCarousel section already present')
  }

  if (!names.has('VreinImageBanner')) {
    if (!isDryRun) sections.push(vreinImageBannerSection)
    log(isDryRun ? 'ADD-SECTION' : 'ADD-SECTION', cmsSectionsPath, 'VreinImageBanner entry')
    changed = true
  } else {
    log('SKIP', cmsSectionsPath, 'VreinImageBanner section already present')
  }

  if (changed && !isDryRun) {
    writeFile(cmsSectionsPath, JSON.stringify(sections, null, 2) + '\n')
  }
}

function checkStaleFiles() {
  for (const filePath of staleFiles) {
    if (fs.existsSync(filePath)) {
      log('WARN', filePath, 'stale /api/vrein handler — delete manually: this file is no longer needed')
    }
  }
}

function printGuidance() {
  console.log('')
  console.log('[info] Setup complete.')
  console.log('[info] Next steps:')
  console.log('[info]   1. Run `yarn build` (or `yarn codegen`) to generate persisted query hashes.')
  console.log('[info]   2. Verify .faststore/persisted-documents.json contains entries for:')
  console.log('[info]      vreinProducts, vreinImages, vreinProductData, vreinCategoryId')
  console.log('[info]   3. Run `yarn cms-sync` if sections.json was updated.')
  console.log('[info]   4. Ensure VREIN_HASH env var is set in your environment / Vercel secrets.')
  console.log('[info]')
  console.log('[info] If you previously had a postinstall patch for @faststore/cli:')
  console.log('[info]   - Remove any "postinstall" script referencing patch-faststore-cli.js from package.json')
  console.log('[info]   - Run: rm -rf node_modules && yarn install')
  console.log('[info]   - The /api/vrein route is no longer needed — do not recreate it.')
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  console.log('[vrein-setup] @vreinai/faststore-components setup' + (isDryRun ? ' (DRY RUN)' : ''))
  console.log('')

  // Process template files
  for (const entry of files) {
    await processFile(entry)
  }

  // CMS sections
  await processCmsSections()

  // Stale file warnings
  checkStaleFiles()

  if (!isDryRun) {
    printGuidance()
  }
}

main().catch((err) => {
  console.error('[vrein-setup] Fatal error:', err)
  process.exit(1)
})
