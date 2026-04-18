import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { DigestData } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping notification');
    return;
  }

  const dataPath = resolve(__dirname, '../../data/posts.json');
  const data: DigestData = JSON.parse(readFileSync(dataPath, 'utf-8'));

  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const todayPosts = data.posts.filter((p) => p.date && new Date(p.date).getTime() >= dayAgo);

  if (todayPosts.length === 0) {
    console.log('No posts in last 24h, skipping notification');
    return;
  }

  // Top 7 by engagement
  const top = [...todayPosts]
    .sort((a, b) => {
      const scoreA = Math.log10(Math.max(a.viewsNum, 1)) + Math.log10(Math.max(a.reactionsTotal, 1)) * 3;
      const scoreB = Math.log10(Math.max(b.viewsNum, 1)) + Math.log10(Math.max(b.reactionsTotal, 1)) * 3;
      return scoreB - scoreA;
    })
    .slice(0, 7);

  // Channel stats
  const channelCounts = new Map<string, number>();
  for (const p of todayPosts) {
    channelCounts.set(p.channelTitle || p.channel, (channelCounts.get(p.channelTitle || p.channel) || 0) + 1);
  }
  const topChannels = Array.from(channelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Reactions summary
  const totalReactions = todayPosts.reduce((s, p) => s + p.reactionsTotal, 0);
  const totalViews = todayPosts.reduce((s, p) => s + p.viewsNum, 0);
  const viewsFormatted = totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : String(totalViews);

  // Build message
  const lines: string[] = [];
  lines.push(`📡 <b>AI Digest</b> · ${todayPosts.length} постов за сутки`);
  lines.push(`👁 ${viewsFormatted} просмотров · ❤️ ${totalReactions} реакций`);
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━');

  for (let i = 0; i < top.length; i++) {
    const p = top[i];
    const preview = escapeHtml(p.text.substring(0, 200).replace(/\n/g, ' ').trim());
    const reactions = p.reactions
      .slice(0, 4)
      .map((r) => `${r.emoji}${r.count}`)
      .join(' ');

    lines.push('');
    lines.push(`<b>${i + 1}. ${escapeHtml(p.channelTitle || p.channel)}</b>`);
    lines.push(`${preview}${p.text.length > 200 ? '...' : ''}`);
    lines.push(`👁 ${p.views}${reactions ? '  ' + reactions : ''}  <a href="${p.url}">Читать →</a>`);
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(`📊 <b>Каналы:</b> ${topChannels.map(([name, count]) => `${name} (${count})`).join(' · ')}`);
  lines.push('');
  lines.push(`🔗 <a href="https://techno911.github.io/RSS/">Открыть полный дайджест</a>`);

  const text = lines.join('\n');

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  if (response.ok) {
    console.log('Telegram notification sent!');
  } else {
    const err = await response.text();
    console.error('Telegram error:', err);
  }
}

main().catch((err) => {
  console.error('Notify error:', err);
});
