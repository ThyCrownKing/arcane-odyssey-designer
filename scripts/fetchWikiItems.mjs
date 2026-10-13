import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const apiUrl = process.env.WIKI_API_URL ?? 'https://roblox-arcane-odyssey.fandom.com/api.php';
const outputPath = resolve('src/data/wiki-items.json');
const categories = [
  { name: 'Accessories', slot: 'Accessory' },
  { name: 'Cloaks', slot: 'Accessory' },
  { name: 'Collars', slot: 'Accessory' },
  { name: 'Hats', slot: 'Head' },
  { name: 'Chestpieces', slot: 'Chest' },
  { name: 'Leggings', slot: 'Legs' },
  { name: 'Bladed Weapons', slot: 'Weapon' },
  { name: 'Bludgeon Weapons', slot: 'Weapon' },
  { name: 'Cleaver Weapons', slot: 'Weapon' },
  { name: 'Thrusting Weapons', slot: 'Weapon' },
  { name: 'Colossal Bladed Weapons', slot: 'Weapon' },
  { name: 'Colossal Blunt Weapons', slot: 'Weapon' },
  { name: 'Colossal Cleaver Weapons', slot: 'Weapon' },
  { name: 'Colossal Thrusting Weapons', slot: 'Weapon' },
  { name: 'Dual Bladed Weapons', slot: 'Weapon' },
  { name: 'Dual Heavy Bladed Weapons', slot: 'Weapon' },
  { name: 'Dual Light Bladed Weapons', slot: 'Weapon' },
  { name: 'Heavy Bladed Weapons', slot: 'Weapon' },
  { name: 'Heavy Blunt Weapons', slot: 'Weapon' },
  { name: 'Heavy Cleaver Weapons', slot: 'Weapon' },
  { name: 'Light Bladed Weapons', slot: 'Weapon' },
  { name: 'Long Bladed Weapons', slot: 'Weapon' },
  { name: 'Spirit weapons', slot: 'Weapon' },
  { name: 'Story weapons', slot: 'Weapon' },
  { name: 'Strength Weapons', slot: 'Weapon' },
];

function plainText(wikiText) {
  let text = wikiText;
  for (let pass = 0; pass < 8; pass += 1) {
    const withoutTemplates = text.replace(/\{\{[^{}]*\}\}/g, ' ');
    if (withoutTemplates === text) break;
    text = withoutTemplates;
  }
  return text
    .replace(/\[\[Category:[^\]]+\]\]/gi, ' ')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/'{2,}/g, '')
    .replace(/={2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchCategory({ name, slot }) {
  const pages = [];
  let continuation;
  do {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      generator: 'categorymembers',
      gcmtitle: `Category:${name}`,
      gcmtype: 'page',
      gcmlimit: '100',
      prop: 'revisions|info|categories',
      rvprop: 'content',
      rvslots: 'main',
      inprop: 'url',
      cllimit: '50',
    });
    if (continuation) params.set('gcmcontinue', continuation);
    const response = await fetch(`${apiUrl}?${params}`, {
      headers: { 'User-Agent': 'ArcaneOdysseyDesigner/1.0 (wiki catalog attribution)' },
    });
    if (!response.ok) throw new Error(`Wiki API returned ${response.status} for ${name}`);
    const payload = await response.json();
    pages.push(...(payload.query?.pages ?? []));
    continuation = payload.continue?.gcmcontinue;
  } while (continuation);

  return pages
    .filter((page) => page.ns === 0 && page.revisions?.[0]?.slots?.main?.content)
    .map((page) => {
      const wikiText = page.revisions[0].slots.main.content;
      return {
        id: String(page.pageid),
        name: page.title,
        slot,
        rarity: 'Wiki entry',
        description: plainText(wikiText).slice(0, 180) || 'Open the wiki source for item details.',
        wikiText,
        sourceTitle: `Arcane Odyssey Wiki: ${page.title}`,
        sourceUrl: page.fullurl,
        pageMetadata: {
          pageId: page.pageid,
          namespace: page.ns,
          categories: (page.categories ?? []).map((entry) => entry.title),
        },
        color: '#668d7e',
      };
    });
}

const rows = await Promise.all(categories.map(fetchCategory));
const items = [...new Map(rows.flat().map((item) => [item.id, item])).values()];
if (items.length === 0) throw new Error('The wiki returned no items; keeping the existing catalog untouched.');
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(items, null, 2)}\n`);
console.log(`Saved ${items.length} attributed entries to ${outputPath}`);