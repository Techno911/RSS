import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { scrapeChannel } from './scraper.js';
import type { DigestData, ChannelMeta } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const channelsRaw = process.env.CHANNELS || '';
  const channels = channelsRaw.split(',').map((c) => c.trim()).filter(Boolean);
  const maxPages = parseInt(process.env.MAX_PAGES_PER_CHANNEL || '5', 10);
  const rateLimitMs = parseInt(process.env.RATE_LIMIT_MS || '1500', 10);

  if (channels.length === 0) {
    console.error('No channels configured in .env');
    process.exit(1);
  }

  console.log(`Parsing ${channels.length} channels (max ${maxPages} pages each)...\n`);

  const allPosts = [];

  for (const handle of channels) {
    console.log(`[${handle}] starting...`);
    const posts = await scrapeChannel(handle, maxPages, rateLimitMs);
    console.log(`[${handle}] done: ${posts.length} posts\n`);
    allPosts.push(...posts);
  }

  // Deduplicate by post id
  const seen = new Set<string>();
  const uniquePosts = allPosts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // Sort by date descending
  uniquePosts.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  // Build channel metadata
  const channelMap = new Map<string, ChannelMeta>();
  for (const post of uniquePosts) {
    const existing = channelMap.get(post.channel);
    if (existing) {
      existing.postCount++;
    } else {
      channelMap.set(post.channel, {
        handle: post.channel,
        title: post.channelTitle || post.channel,
        avatarUrl: '',
        postCount: 1,
      });
    }
  }

  const data: DigestData = {
    generatedAt: new Date().toISOString(),
    channels: Array.from(channelMap.values()).sort((a, b) => b.postCount - a.postCount),
    posts: uniquePosts,
  };

  const outDir = resolve(__dirname, '../../data');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'posts.json');
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`Done! ${uniquePosts.length} posts from ${channelMap.size} channels`);
  console.log(`Written to ${outPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
