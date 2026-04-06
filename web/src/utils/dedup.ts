import type { TelegramPost } from '../types';

/**
 * Normalize text for comparison: lowercase, remove extra whitespace, remove emoji
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u{1F600}-\u{1F9FF}]/gu, '') // remove emoji
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two texts are similar (>70% overlap by words)
 */
function areSimilar(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);

  if (!na || !nb) return false;
  if (na.length < 50 || nb.length < 50) return false;

  // Quick check: if one starts with the same 100 chars
  const prefix = Math.min(100, na.length, nb.length);
  if (na.substring(0, prefix) === nb.substring(0, prefix)) return true;

  // Word overlap check
  const wordsA = new Set(na.split(' ').filter((w) => w.length > 3));
  const wordsB = new Set(nb.split(' ').filter((w) => w.length > 3));
  if (wordsA.size < 5 || wordsB.size < 5) return false;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }

  const similarity = overlap / Math.min(wordsA.size, wordsB.size);
  return similarity > 0.7;
}

export interface DeduplicatedPost {
  post: TelegramPost;
  alsoIn: string[]; // channelTitle of duplicate sources
}

/**
 * Deduplicate posts: keep the one with most views, track "also in" channels.
 */
export function deduplicatePosts(posts: TelegramPost[]): DeduplicatedPost[] {
  const groups: TelegramPost[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < posts.length; i++) {
    if (assigned.has(i)) continue;

    const group = [posts[i]];
    assigned.add(i);

    for (let j = i + 1; j < posts.length; j++) {
      if (assigned.has(j)) continue;
      if (posts[i].channel === posts[j].channel) continue; // same channel = not a cross-post
      if (areSimilar(posts[i].text, posts[j].text)) {
        group.push(posts[j]);
        assigned.add(j);
      }
    }

    groups.push(group);
  }

  return groups.map((group) => {
    // Keep the one with most views
    group.sort((a, b) => b.viewsNum - a.viewsNum);
    const primary = group[0];
    const alsoIn = group
      .slice(1)
      .map((p) => p.channelTitle || p.channel)
      .filter((name) => name !== primary.channelTitle && name !== primary.channel);

    return { post: primary, alsoIn };
  });
}
