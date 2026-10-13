import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputPath = resolve('src/data/reddit-threads.json');
const searches = ['unfinished OR WIP OR placeholder', 'prototype OR incomplete OR unreleased'];
const subreddits = ['ArcaneOdyssey', 'Roblox'];
const userAgent = process.env.REDDIT_USER_AGENT ?? 'web:arcane-odyssey-loadout-studio:1.0 (community reference fetcher)';
const threads = new Map();
let successfulSearches = 0;

for (const subreddit of subreddits) {
  for (const terms of searches) {
    const query = subreddit === 'Roblox' ? `"Arcane Odyssey" (${terms})` : terms;
    const params = new URLSearchParams({
      q: query,
      restrict_sr: 'on',
      sort: 'relevance',
      t: 'year',
      limit: '50',
      raw_json: '1',
    });

    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/search.json?${params}`, {
        headers: { 'User-Agent': userAgent, Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`Reddit returned ${response.status}`);
      const payload = await response.json();
      successfulSearches += 1;

      for (const child of payload.data?.children ?? []) {
        const post = child.data;
        if (!post?.id || !post.title || !post.permalink) continue;
        threads.set(post.id, {
          id: post.id,
          title: post.title,
          url: `https://www.reddit.com${post.permalink}`,
          subreddit: post.subreddit ?? subreddit,
          score: Number(post.score) || 0,
          createdUtc: Number(post.created_utc) || 0,
          text: String(post.selftext ?? '').slice(0, 1200),
        });
      }
    } catch (error) {
      console.warn(`Skipping r/${subreddit} search: ${error.message}`);
    }
  }
}

if (successfulSearches === 0) {
  console.warn('Reddit was unavailable; keeping the previous community reference file.');
} else {
  await writeFile(outputPath, `${JSON.stringify([...threads.values()], null, 2)}\n`);
  console.log(`Saved ${threads.size} community threads from ${successfulSearches} Reddit searches.`);
}