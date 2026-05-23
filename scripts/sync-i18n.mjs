#!/usr/bin/env node
/**
 * Reports translation keys present in english.ts but missing from other locale files.
 * Run: node scripts/sync-i18n.mjs
 *
 * Runtime fallback is handled in i18n.ts via deepMergeTranslations(english, locale).
 * Use this script to find keys that still need human translation in locale files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const langDir = path.join(__dirname, '../src/utils/langauage');

function flatKeys(content) {
  const keys = new Set();
  const stack = [];
  for (const line of content.split('\n')) {
    const closes = (line.match(/\}/g) || []).length;
    for (let c = 0; c < closes; c++) if (stack.length) stack.pop();
    const km = line.match(/^\s*"([^"]+)"\s*:\s*(.*)$/);
    if (!km) continue;
    const [, key, rest] = km;
    const val = rest.trim();
    if (val === '{') stack.push(key);
    else if (val.startsWith('"')) keys.add([...stack, key].join('.'));
  }
  return keys;
}

const locales = {
  sp: 'spanish.ts',
  frcd: 'frenchCanada.ts',
  pt: 'portuguese.ts',
  hn: 'hindi.ts',
};

const enKeys = flatKeys(fs.readFileSync(path.join(langDir, 'english.ts'), 'utf8'));
console.log(`English keys: ${enKeys.size}\n`);

for (const [code, file] of Object.entries(locales)) {
  const locKeys = flatKeys(fs.readFileSync(path.join(langDir, file), 'utf8'));
  const missing = [...enKeys].filter((k) => !locKeys.has(k)).sort();
  console.log(`${code}: ${locKeys.size} keys, ${missing.length} missing in file (filled at runtime from English)`);
  if (missing.length > 0 && missing.length <= 25) {
    missing.forEach((k) => console.log(`  - ${k}`));
  } else if (missing.length > 25) {
    missing.slice(0, 15).forEach((k) => console.log(`  - ${k}`));
    console.log(`  ... and ${missing.length - 15} more`);
  }
  console.log('');
}
