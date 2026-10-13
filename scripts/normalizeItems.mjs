import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const wikiPath = resolve('src/data/wiki-items.json');
const redditPath = resolve('src/data/reddit-threads.json');
const outputPath = resolve('src/data/catalog-items.json');
const unfinishedPattern = /\b(?:unfinished|work\s+in\s+progress|wip|not\s+finished|incomplete|placeholder|prototype|unreleased|still\s+in\s+development)\b/i;

async function readJson(path, fallback = []) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesItem(text, name) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(name)}([^a-z0-9]|$)`, 'i').test(text);
}

function matchPhrase(text) {
  return text.match(unfinishedPattern)?.[0];
}

function resolveSlot(item, categories) {
  const categoryText = categories.join(' ');
  if (/Category:Hats\b/i.test(categoryText)) return 'Head';
  if (/Category:Chestpieces\b/i.test(categoryText)) return 'Chest';
  if (/Category:Leggings\b/i.test(categoryText)) return 'Legs';
  if (/Category:[^,]*(?:Weapons|weapon)\b/i.test(categoryText)) return 'Weapon';
  return item.slot;
}

const [wikiItems, threads] = await Promise.all([
  readJson(wikiPath),
  readJson(redditPath),
]);
const normalizedItems = wikiItems.map((item) => {
  const wikiText = String(item.wikiText ?? '');
  const textCategories = [...wikiText.matchAll(/\[\[Category:([^\]|]+)/gi)].map((match) => `Category:${match[1]}`);
  const categories = [...new Set([...(item.pageMetadata?.categories ?? []), ...textCategories])];
  const slot = resolveSlot(item, categories);
  const categoryMatch = categories.find((category) => unfinishedPattern.test(category));
  const wikiPhrase = matchPhrase(`${wikiText} ${categories.join(' ')}`);
  const mentionedThreads = threads
    .filter((thread) => matchesItem(`${thread.title} ${thread.text ?? ''}`, item.name))
    .map((thread) => {
      const phrase = matchPhrase(`${thread.title} ${thread.text ?? ''}`);
      return {
        title: thread.title,
        url: thread.url,
        subreddit: thread.subreddit,
        score: thread.score,
        ...(phrase ? { unfinishedPhrase: phrase } : {}),
      };
    })
    .slice(0, 5);

  const reasons = [];
  if (categoryMatch) reasons.push(`Wiki category marks this entry: ${categoryMatch.replace(/^Category:/i, '')}.`);
  else if (wikiPhrase) reasons.push(`Detected in wiki text: “${wikiPhrase}”.`);
  const communityPhrase = mentionedThreads.find((thread) => thread.unfinishedPhrase)?.unfinishedPhrase;
  if (communityPhrase) reasons.push(`Community thread mentions “${communityPhrase}”; verify the linked discussion.`);

  return {
    id: String(item.id),
    name: item.name,
    slot,
    category: slot === 'Weapon' ? 'Weapon' : slot === 'Accessory' ? 'Accessory' : 'Armor',
    rarity: item.rarity,
    description: item.description,
    source: 'wiki',
    sourceTitle: item.sourceTitle,
    sourceUrl: item.sourceUrl,
    wikiUrl: item.sourceUrl,
    galleryUrls: [],
    color: item.color,
    pageMetadata: { categories },
    unfinished: reasons.length > 0,
    ...(reasons.length ? { unfinishedReason: reasons.join(' ') } : {}),
    ...(reasons.length ? { unfinishedReasons: reasons } : {}),
    communityReferences: mentionedThreads,
    previewPlaceholder: true,
  };
});

if (normalizedItems.length === 0) throw new Error('No wiki items found; keeping the existing normalized catalog.');
await writeFile(outputPath, `${JSON.stringify(normalizedItems, null, 2)}\n`);
const flagged = normalizedItems.filter((item) => item.unfinished).length;
const linkedThreads = normalizedItems.reduce((count, item) => count + item.communityReferences.length, 0);
console.log(`Normalized ${normalizedItems.length} wiki items; ${flagged} flagged unfinished; ${linkedThreads} item-thread references.`);