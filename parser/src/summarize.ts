import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { DigestData } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Generate a summary of the digest data without requiring an LLM.
 * Extracts: top channels, top posts, most discussed topics.
 */
function generateSummary(data: DigestData): string {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weekPosts = data.posts.filter((p) => p.date && new Date(p.date).getTime() >= weekAgo);

  if (weekPosts.length === 0) return '';

  // Top channels by post count
  const channelCounts = new Map<string, { title: string; count: number; totalViews: number }>();
  for (const p of weekPosts) {
    const entry = channelCounts.get(p.channel);
    if (entry) {
      entry.count++;
      entry.totalViews += p.viewsNum;
    } else {
      channelCounts.set(p.channel, {
        title: p.channelTitle || p.channel,
        count: 1,
        totalViews: p.viewsNum,
      });
    }
  }
  const topChannels = Array.from(channelCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top posts by engagement
  const topPosts = [...weekPosts]
    .sort((a, b) => {
      const scoreA = Math.log10(Math.max(a.viewsNum, 1)) + Math.log10(Math.max(a.reactionsTotal, 1)) * 3;
      const scoreB = Math.log10(Math.max(b.viewsNum, 1)) + Math.log10(Math.max(b.reactionsTotal, 1)) * 3;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  // Extract frequent words (basic keyword extraction)
  const wordCounts = new Map<string, number>();
  const stopWords = new Set(['это', 'что', 'как', 'для', 'при', 'все', 'или', 'уже', 'его', 'они', 'так', 'был', 'она', 'где', 'вот', 'мне', 'чем', 'них', 'вам', 'нас', 'кто', 'мой', 'тут', 'вас', 'даже', 'если', 'есть', 'будет', 'тоже', 'когда', 'можно', 'того', 'этот', 'этой', 'этом', 'этих', 'более', 'очень', 'может', 'после', 'через', 'просто', 'также', 'свой', 'между', 'только', 'около', 'новый', 'новая', 'новое', 'новые', 'будут', 'нужно', 'потом', 'этого', 'пока', 'самый', 'стал', 'ещё', 'были', 'которые', 'которая', 'которой', 'который']);
  for (const p of weekPosts) {
    const words = p.text.toLowerCase().split(/\s+/).filter((w) => w.length > 4 && !stopWords.has(w));
    for (const w of words) {
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
    }
  }
  const hotWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  // Build summary
  const lines: string[] = [];
  lines.push(`За неделю: ${weekPosts.length} постов из ${channelCounts.size} каналов.`);
  lines.push('');
  lines.push('Самые активные каналы:');
  for (const ch of topChannels) {
    lines.push(`• ${ch.title} — ${ch.count} постов`);
  }
  lines.push('');
  lines.push('Топ по вовлечённости:');
  for (const p of topPosts) {
    const preview = p.text.substring(0, 80).replace(/\n/g, ' ');
    lines.push(`• [${p.channelTitle}] ${preview}... (${p.views} просм.)`);
  }
  lines.push('');
  lines.push(`Горячие темы: ${hotWords.join(', ')}`);

  return lines.join('\n');
}

async function main() {
  const dataPath = resolve(__dirname, '../../data/posts.json');
  const data: DigestData = JSON.parse(readFileSync(dataPath, 'utf-8'));

  const summary = generateSummary(data);
  if (!summary) {
    console.log('No posts for the last week, skipping summary');
    return;
  }

  // Write summary into data
  const updatedData = { ...data, weeklySummary: summary };
  writeFileSync(dataPath, JSON.stringify(updatedData, null, 2), 'utf-8');

  console.log('Weekly summary generated:');
  console.log(summary);
}

main().catch((err) => {
  console.error('Summary error:', err);
  process.exit(1);
});
