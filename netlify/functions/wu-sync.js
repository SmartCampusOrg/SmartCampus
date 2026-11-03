import { authenticateAndFetchWu } from '../../server/wuAuth.js';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Metoda niedozwolona' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { username, password, ids } = body || {};
    const lessons = await authenticateAndFetchWu({ username, password, ids });
    return new Response(JSON.stringify({ success: true, count: lessons.length, result: lessons }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Błąd autoryzacji w WU' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
