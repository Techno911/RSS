export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseCount(str: string | undefined | null): number {
  if (!str) return 0;
  const cleaned = str.trim().replace(/\s/g, '');
  if (!cleaned) return 0;

  const match = cleaned.match(/^([\d.]+)\s*([KMB]?)$/i);
  if (!match) {
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  }

  const value = parseFloat(match[1]);
  const suffix = match[2].toUpperCase();

  switch (suffix) {
    case 'K': return Math.round(value * 1_000);
    case 'M': return Math.round(value * 1_000_000);
    case 'B': return Math.round(value * 1_000_000_000);
    default: return Math.round(value);
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.warn(`  Rate limited (429), retrying in ${delay / 1000}s...`);
        await sleep(delay);
        continue;
      }
      return response;
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(`  Fetch error, retrying in ${delay / 1000}s... (${attempt + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

export function extractBgImage(style: string | undefined | null): string | null {
  if (!style) return null;
  const match = style.match(/background-image:\s*url\('([^']+)'\)/);
  return match ? match[1] : null;
}
