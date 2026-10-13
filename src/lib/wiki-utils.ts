import type { DesignerItem } from '../data/items';

const unfinishedPattern = /\b(?:unfinished|work\s+in\s+progress|wip|not\s+finished|incomplete|placeholder|prototype|unreleased|still\s+in\s+development)\b/i;

function metadataText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(metadataText).join(' ');
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, entry]) => `${key} ${metadataText(entry)}`)
      .join(' ');
  }
  return '';
}

export function isUnfinished(item: DesignerItem): boolean {
  if (typeof item.unfinished === 'boolean') return item.unfinished;
  return unfinishedPattern.test(`${item.wikiText} ${metadataText(item.pageMetadata)}`);
}

export function unfinishedReason(item: DesignerItem): string | undefined {
  if (item.unfinishedReason) return item.unfinishedReason;
  const match = `${item.wikiText} ${metadataText(item.pageMetadata)}`.match(unfinishedPattern);
  return match?.[0];
}