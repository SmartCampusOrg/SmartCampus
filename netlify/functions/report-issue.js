import { createGithubIssue } from '../../server/githubIssue.js';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Metoda niedozwolona' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const payload = await req.json();
    const issue = await createGithubIssue(payload || {});
    return new Response(
      JSON.stringify({ success: true, issue }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Nie udało się utworzyć zgłoszenia na GitHubie.',
        code: err.code || null,
        fallbackUrl: err.fallbackUrl || null,
      }),
      { status: err.statusCode || 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
