import * as cheerio from 'cheerio';
import type { TelegramPost, Reaction } from './types.js';
import { sleep, parseCount, extractBgImage, fetchWithRetry } from './utils.js';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function parseReactions($wrap: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI): Reaction[] {
  const reactions: Reaction[] = [];
  $wrap.find('.tgme_widget_message_reactions .tgme_reaction').each((_i, el) => {
    const $el = $(el);
    const isPaid = $el.hasClass('tgme_reaction_paid');
    // Emoji is inside <b> inside <i class="emoji">, count is direct text after the <i>
    const emoji = isPaid ? '⭐' : ($el.find('b').first().text().trim() || '👍');
    // Get the full text and remove the emoji part to get the count
    const fullText = $el.text().trim();
    // The count is the numeric part at the end
    const countMatch = fullText.match(/([\d.]+[KMB]?)$/i);
    const countText = countMatch ? countMatch[1] : '';
    if (countText) {
      reactions.push({
        emoji,
        count: countText,
        countNum: parseCount(countText),
      });
    }
  });
  return reactions;
}

function extractImage($wrap: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI): string | null {
  // Try photo
  const photoStyle = $wrap.find('a.tgme_widget_message_photo_wrap').first().attr('style');
  const photo = extractBgImage(photoStyle);
  if (photo) return photo;

  // Try video thumb
  const videoStyle = $wrap.find('.tgme_widget_message_video_thumb').first().attr('style');
  const video = extractBgImage(videoStyle);
  if (video) return video;

  // Try link preview
  const linkStyle = $wrap.find('.link_preview_image').first().attr('style');
  return extractBgImage(linkStyle);
}

export async function scrapeChannel(
  handle: string,
  maxPages: number,
  rateLimitMs: number,
): Promise<TelegramPost[]> {
  const posts: TelegramPost[] = [];
  let beforeId: number | null = null;

  for (let page = 0; page < maxPages; page++) {
    const url = beforeId
      ? `https://t.me/s/${handle}?before=${beforeId}`
      : `https://t.me/s/${handle}`;

    console.log(`  [${handle}] page ${page + 1}/${maxPages}: ${url}`);

    let html: string;
    try {
      const response = await fetchWithRetry(url, {
        headers: { 'User-Agent': USER_AGENT },
      });
      if (!response.ok) {
        console.warn(`  [${handle}] HTTP ${response.status}, stopping`);
        break;
      }
      html = await response.text();
    } catch (err) {
      console.warn(`  [${handle}] fetch error after retries:`, err);
      break;
    }

    const $ = cheerio.load(html);
    let pagePostCount = 0;

    $('.tgme_widget_message_wrap').each((_i, wrapEl) => {
      const $wrap = $(wrapEl);
      const msgEl = $wrap.find('.js-widget_message');
      const dataPost = msgEl.attr('data-post');
      if (!dataPost) return;

      const parts = dataPost.split('/');
      if (parts.length !== 2) return;
      const [channel, msgIdStr] = parts;
      const messageId = parseInt(msgIdStr, 10);
      if (isNaN(messageId)) return;

      const textEl = $wrap.find('.tgme_widget_message_text.js-message_text');
      const text = textEl.text().trim();
      const textHtml = textEl.html() || '';
      const dateStr = $wrap.find('.tgme_widget_message_date time').attr('datetime') || '';
      const viewsStr = $wrap.find('.tgme_widget_message_views').text().trim();
      const channelTitle = $wrap.find('.tgme_widget_message_owner_name span').first().text().trim();

      const imageUrl = extractImage($wrap, $);
      const reactions = parseReactions($wrap, $);
      const reactionsTotal = reactions.reduce((sum, r) => sum + r.countNum, 0);

      posts.push({
        id: dataPost,
        channel,
        channelTitle: channelTitle || handle,
        messageId,
        text,
        textHtml,
        date: dateStr,
        views: viewsStr,
        viewsNum: parseCount(viewsStr),
        reactions,
        reactionsTotal,
        imageUrl,
        url: `https://t.me/${dataPost}`,
      });

      pagePostCount++;
    });

    console.log(`  [${handle}] found ${pagePostCount} posts`);

    if (pagePostCount === 0) break;

    // Pagination: find the "load more" link
    const nextBefore = $('a.tme_messages_more').attr('data-before');
    if (!nextBefore) break;
    beforeId = parseInt(nextBefore, 10);
    if (isNaN(beforeId)) break;

    if (page < maxPages - 1) {
      await sleep(rateLimitMs);
    }
  }

  return posts;
}
