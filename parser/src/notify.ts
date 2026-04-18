import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { DigestData } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Send morning digest to Telegram chat via Bot API.
 * Requires: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.
 */
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

  // Top 5 by engagement
  const top5 = [...todayPosts]
    .sort((a, b) => {
      const scoreA = Math.log10(Math.max(a.viewsNum, 1)) + Math.log10(Math.max(a.reactionsTotal, 1)) * 3;
      const scoreB = Math.log10(Math.max(b.viewsNum, 1)) + Math.log10(Math.max(b.reactionsTotal, 1)) * 3;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  // Build message
  const lines: string[] = [];
  lines.push(`📡 <b>AI Digest</b> · ${todayPosts.length} постов за сутки\n`);

  for (let i = 0; i < top5.length; i++) {
    const p = top5[i];
    const preview = p.text.substring(0, 100).replace(/[<>&]/g, '').replace(/\n/g, ' ').trim();
    lines.push(`${i + 1}. <b>${p.channelTitle || p.channel}</b>`);
    lines.push(`${preview}...`);
    lines.push(`👁 ${p.views} · <a href="${p.url}">Открыть</a>\n`);
  }

  lines.push(`🔗 <a href="https://techno911.github.io/RSS/">Полный дайджест</a>`);

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
  // Don't exit with error — notification failure shouldn't break deploy
});
