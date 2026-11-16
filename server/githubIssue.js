/**
 * server/githubIssue.js
 * Wspólny moduł do tworzenia zgłoszeń (Issues) w repozytorium SmartCampusOrg/SmartCampus.
 */

const GITHUB_OWNER = 'SmartCampusOrg';
const GITHUB_REPO = 'SmartCampus';

const TYPE_TO_CONFIG = {
  bug: {
    label: 'bug',
    titlePrefix: '[Błąd]',
    displayName: 'Błąd',
  },
  enhancement: {
    label: 'enhancement',
    titlePrefix: '[Sugestia]',
    displayName: 'Sugestia / Nowa funkcja',
  },
  ui: {
    label: 'bug',
    titlePrefix: '[UI]',
    displayName: 'Problem z wyglądem (UI)',
  },
  question: {
    label: 'question',
    titlePrefix: '[Pytanie]',
    displayName: 'Pytanie / Inne',
  },
};

export async function createGithubIssue({
  type = 'bug',
  title,
  description,
  moduleName = '',
  contact = '',
  environment = '',
  appVersion = '',
}) {
  const cleanTitle = String(title || '').trim();
  const cleanDesc = String(description || '').trim();

  if (!cleanTitle) {
    const err = new Error('Podaj tytuł zgłoszenia.');
    err.statusCode = 400;
    throw err;
  }

  if (!cleanDesc) {
    const err = new Error('Podaj opis zgłoszenia.');
    err.statusCode = 400;
    throw err;
  }

  const config = TYPE_TO_CONFIG[type] || TYPE_TO_CONFIG.bug;
  const issueTitle = `${config.titlePrefix} ${cleanTitle}`.slice(0, 200);

  const metaLines = [
    `**Typ zgłoszenia:** ${config.displayName}`,
    moduleName ? `**Obszar / Moduł:** ${String(moduleName).trim()}` : null,
    appVersion ? `**Wersja aplikacji:** ${String(appVersion).trim()}` : null,
    contact ? `**Kontakt zwrotny:** ${String(contact).trim()}` : null,
  ].filter(Boolean);

  const envLines = String(environment || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const issueBody = [
    '### Opis zgłoszenia',
    cleanDesc,
    '',
    '---',
    '### Szczegóły zgłoszenia',
    ...metaLines.map((line) => `- ${line}`),
    ...(envLines.length > 0
      ? [
          '',
          '### Dane diagnostyczne środowiska',
          ...envLines.map((line) => `- ${line}`),
        ]
      : []),
    '',
    '_Zgłoszenie wysłane przez formularz w aplikacji Smart Campus._',
  ].join('\n');

  const token =
    process.env.GITHUB_ISSUES_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.VITE_GITHUB_TOKEN;

  if (!token) {
    const fallbackUrl = new URL(`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new`);
    fallbackUrl.searchParams.set('title', issueTitle);
    fallbackUrl.searchParams.set('body', issueBody);
    fallbackUrl.searchParams.set('labels', config.label);

    const err = new Error('Brak skonfigurowanego tokena GitHub po stronie serwera.');
    err.statusCode = 503;
    err.code = 'MISSING_TOKEN';
    err.fallbackUrl = fallbackUrl.toString();
    throw err;
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'SmartCampus-IssueReporter/1.0',
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: [config.label],
      }),
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    const err = new Error(
      data?.message || `Błąd GitHub API (HTTP ${response.status})`
    );
    err.statusCode = response.status >= 400 && response.status < 500 ? 400 : 502;
    throw err;
  }

  return {
    number: data.number,
    url: data.html_url,
    title: data.title,
    label: config.label,
  };
}
