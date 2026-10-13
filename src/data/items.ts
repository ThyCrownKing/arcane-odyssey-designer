import catalogItems from './catalog-items.json';

export const gearSlots = ['Head', 'Chest', 'Legs', 'Weapon', 'Accessory'] as const;
export type GearSlot = (typeof gearSlots)[number];
export type CommunityReference = {
  title: string;
  url: string;
  subreddit: string;
  score: number;
  unfinishedPhrase?: string;
};

export type DesignerItem = {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: string;
  description: string;
  wikiText?: string;
  sourceTitle: string;
  sourceUrl: string;
  pageMetadata?: Record<string, unknown>;
  color: string;
  category?: 'Armor' | 'Accessory' | 'Weapon';
  source?: 'wiki' | 'reddit' | 'community';
  wikiUrl?: string;
  galleryUrls?: string[];
  unfinished?: boolean;
  unfinishedReason?: string;
  unfinishedReasons?: string[];
  communityReferences?: CommunityReference[];
  previewPlaceholder?: boolean;
};

const starterItems: DesignerItem[] = [
  {
    id: 'ravenna-helm',
    name: 'Ravenna Helmet',
    slot: 'Head',
    rarity: 'Rare',
    description: 'A clean silhouette for a battle-ready outfit.',
    wikiText: '',
    sourceTitle: 'Arcane Odyssey Wiki: Armor',
    sourceUrl: 'https://roblox-arcane-odyssey.fandom.com/wiki/Category:Armor',
    color: '#c8a25d',
  },
  {
    id: 'steel-chestplate',
    name: 'Steel Chestplate',
    slot: 'Chest',
    rarity: 'Uncommon',
    description: 'A practical starting layer with a bright metal finish.',
    wikiText: '',
    sourceTitle: 'Arcane Odyssey Wiki: Armor',
    sourceUrl: 'https://roblox-arcane-odyssey.fandom.com/wiki/Category:Armor',
    color: '#4c7f7c',
  },
  {
    id: 'traveler-greaves',
    name: 'Traveler Greaves',
    slot: 'Legs',
    rarity: 'Common',
    description: 'Lightweight gear made for long journeys.',
    wikiText: '',
    sourceTitle: 'Arcane Odyssey Wiki: Armor',
    sourceUrl: 'https://roblox-arcane-odyssey.fandom.com/wiki/Category:Armor',
    color: '#374a47',
  },
  {
    id: 'bronze-sabre',
    name: 'Bronze Sabre',
    slot: 'Weapon',
    rarity: 'Common',
    description: 'A compact blade with a warm bronze guard.',
    wikiText: '',
    sourceTitle: 'Arcane Odyssey Wiki: Weapons',
    sourceUrl: 'https://roblox-arcane-odyssey.fandom.com/wiki/Category:Weapons',
    color: '#d17a54',
  },
  {
    id: 'storm-pendant',
    name: 'Storm Pendant',
    slot: 'Accessory',
    rarity: 'Rare',
    description: 'A small accent for a little color at the collar.',
    wikiText: '',
    sourceTitle: 'Arcane Odyssey Wiki: Accessories',
    sourceUrl: 'https://roblox-arcane-odyssey.fandom.com/wiki/Category:Accessories',
    color: '#6ab4a8',
  },
];

const normalizedItems = catalogItems as DesignerItem[];

export const items = normalizedItems.length > 0 ? normalizedItems : starterItems;

export const isWikiCatalog = items.some((item) => item.source === 'wiki');