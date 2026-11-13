import { fetchFacultiesFeed } from '../../server/feedScraper.js';

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Metoda niedozwolona' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const faculty = url.searchParams.get('faculty') || 'all';
    const data = await fetchFacultiesFeed(faculty);

    return new Response(JSON.stringify({ success: true, ...data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Błąd pobierania aktualności' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
