/**
 * server/feedScraper.js
 * Pobiera i parsuje publiczne aktualności wydziałowe ze strony pansim.edu.pl (Joomla!).
 */

export const FACULTY_SOURCES = [
  {
    id: 'wie',
    name: 'Wydział Inżynierii i Ekonomii',
    shortName: 'WIE',
    handle: '@wie.pansim',
    url: 'https://pansim.edu.pl/wydzia%C5%82-in%C5%BCynierii-i-ekonomii/aktualnosci-wie'
  },
  {
    id: 'wnozins',
    name: 'Wydział Nauk o Zdrowiu i Nauk Społecznych',
    shortName: 'WNoZiNS',
    handle: '@wnozins.pansim',
    url: 'https://pansim.edu.pl/wydzia%C5%82-nauk-o-zdrowiu-i-nauk-spo%C5%82ecznych/aktualnosci-wydzialowe'
  },
  {
    id: 'wnts',
    name: 'Wydział Nauk Technicznych i Społecznych',
    shortName: 'WNTS',
    handle: '@wnts.pansim',
    url: 'https://pansim.edu.pl/wts/aktualnosci-weditm'
  }
];

const NAMED_ENTITIES = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  ndash: '–',
  mdash: '—',
  bdquo: '„',
  rdquo: '”',
  ldquo: '“',
  laquo: '«',
  raquo: '»',
  hellip: '…',
  bull: '•'
};

function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&([a-zA-Z]+);/g, (full, name) => NAMED_ENTITIES[name] ?? full);
}

function stripTagsAndClean(html) {
  if (!html) return '';
  const noTags = html.replace(/<[^>]+>/g, ' ');
  return decodeHtmlEntities(noTags).replace(/\s+/g, ' ').trim();
}

function toSafeAbsolutePansimUrl(rawPath) {
  if (!rawPath) return null;
  try {
    const decoded = decodeHtmlEntities(rawPath.trim());
    const parsed = new URL(decoded, 'https://pansim.edu.pl');
    if (parsed.origin !== 'https://pansim.edu.pl') return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function parseArticlesFromHtml(html, source) {
  if (!html) return [];

  // Dzielimy stronę po elementach wpisów bloga Joomla!
  const itemSplitRegex = /<div\b[^>]*class="[^"]*\bcom-content-category-blog__item\b(?!s)[^"]*"[^>]*>/gi;
  const matches = [...html.matchAll(itemSplitRegex)];
  const posts = [];

  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i].index;
    const endIdx = i + 1 < matches.length ? matches[i + 1].index : Math.min(html.length, startIdx + 12000);
    const block = html.slice(startIdx, endIdx);

    // 1. Tytuł i link do artykułu
    const headerMatch = block.match(/<div\b[^>]*class="[^"]*\bpage-header\b[^"]*"[^>]*>[\s\S]*?<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!headerMatch) continue;

    const link = toSafeAbsolutePansimUrl(headerMatch[1]);
    const title = stripTagsAndClean(headerMatch[2]);
    if (!link || !title) continue;

    // 2. Data publikacji w formacie ISO
    const timeMatch = block.match(/<time\b[^>]*datetime="([^"]+)"[^>]*>/i);
    const publishedAt = timeMatch ? timeMatch[1].trim() : null;

    // 3. Zdjęcie główne (jeśli występuje)
    const imgMatch = block.match(/<figure\b[^>]*class="[^"]*\bitem-image\b[^"]*"[^>]*>[\s\S]*?<img\b[^>]*src="([^"]+)"[^>]*>/i)
      || block.match(/<div\b[^>]*class="[^"]*\bitem-content\b[^"]*"[^>]*>[\s\S]*?<img\b[^>]*src="([^"]+)"[^>]*>/i);
    const image = imgMatch ? toSafeAbsolutePansimUrl(imgMatch[1]) : null;

    // 4. Zajawka tekstu z akapitów wewnątrz .item-content
    const contentIdx = block.search(/<div\b[^>]*class="[^"]*\bitem-content\b[^"]*"[^>]*>/i);
    const contentSlice = contentIdx !== -1 ? block.slice(contentIdx) : block;
    // Odcinamy część po ewentualnej sekcji readmore / paginacji
    const readmoreIdx = contentSlice.search(/<p\b[^>]*class="[^"]*\breadmore\b[^"]*"/i);
    const cleanContentSlice = readmoreIdx !== -1 ? contentSlice.slice(0, readmoreIdx) : contentSlice;

    const paragraphs = [...cleanContentSlice.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(m => stripTagsAndClean(m[1]))
      .filter(text => text.length > 0);

    let excerpt = paragraphs.join(' ').trim();
    if (excerpt.length > 320) {
      excerpt = excerpt.slice(0, 317).replace(/\s+\S*$/, '') + '…';
    }

    posts.push({
      id: `${source.id}_${link.split('/').pop() || i}`,
      facultyId: source.id,
      facultyName: source.name,
      facultyShort: source.shortName,
      facultyHandle: source.handle,
      title,
      excerpt,
      link,
      image,
      publishedAt
    });
  }

  return posts;
}

export async function fetchFacultiesFeed(facultyFilter = 'all') {
  const targets = facultyFilter && facultyFilter !== 'all'
    ? FACULTY_SOURCES.filter(s => s.id === facultyFilter)
    : FACULTY_SOURCES;

  const results = await Promise.allSettled(
    targets.map(async (source) => {
      const res = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SmartCampusBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml'
        },
        signal: AbortSignal.timeout(7000)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} dla ${source.shortName}`);
      }

      const html = await res.text();
      return parseArticlesFromHtml(html, source);
    })
  );

  const allPosts = [];
  const errors = [];

  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      allPosts.push(...result.value);
    } else {
      errors.push({ facultyId: targets[idx].id, message: result.reason?.message || 'Błąd pobierania' });
    }
  });

  // Sortowanie chronologiczne od najnowszego posta
  allPosts.sort((a, b) => {
    const tA = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tB = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tB - tA;
  });

  return {
    posts: allPosts,
    errors,
    fetchedAt: new Date().toISOString()
  };
}
