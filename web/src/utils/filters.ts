import type { TelegramPost, TimePeriod } from '../types';

const PERIOD_MS: Record<TimePeriod, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  'all': Infinity,
};

export function filterByTime(posts: TelegramPost[], period: TimePeriod): TelegramPost[] {
  if (period === 'all') return posts;
  const cutoff = Date.now() - PERIOD_MS[period];
  return posts.filter((p) => p.date && new Date(p.date).getTime() >= cutoff);
}

export function filterPosts(
  posts: TelegramPost[],
  opts: {
    timePeriod: TimePeriod;
    selectedChannels: Set<string>;
    searchQuery: string;
  },
): TelegramPost[] {
  let result = filterByTime(posts, opts.timePeriod);

  if (opts.selectedChannels.size > 0) {
    result = result.filter((p) => opts.selectedChannels.has(p.channel));
  }

  if (opts.searchQuery.trim()) {
    const q = opts.searchQuery.toLowerCase();
    result = result.filter((p) => p.text.toLowerCase().includes(q));
  }

  return result;
}

export function countByChannel(posts: TelegramPost[]): Map<string, { title: string; count: number }> {
  const map = new Map<string, { title: string; count: number }>();
  for (const p of posts) {
    const entry = map.get(p.channel);
    if (entry) {
      entry.count++;
    } else {
      map.set(p.channel, { title: p.channelTitle || p.channel, count: 1 });
    }
  }
  return map;
}
