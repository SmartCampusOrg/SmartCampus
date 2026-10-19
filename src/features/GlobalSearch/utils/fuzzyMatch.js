const stripDiacritics = (str) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L");

export const fuzzyMatch = (text, query) => {
  const t = (text || "").toLowerCase();
  const q = (query || "").toLowerCase().trim();
  if (!q) return { isMatch: true, indices: [], score: 100 };

  // 1. Exact substring match on raw string
  const exactIdx = t.indexOf(q);
  if (exactIdx !== -1) {
    const indices = Array.from({ length: q.length }, (_, i) => exactIdx + i);
    let score = 80;
    if (exactIdx === 0) {
      score = 100;
    } else if (t[exactIdx - 1] === ' ') {
      score = 90 - (exactIdx * 0.1);
    }
    return { isMatch: true, indices, score };
  }

  // 1b. Normalized match (e.g. "wasik" matches "Wąsik")
  const normT = stripDiacritics(t);
  const normQ = stripDiacritics(q);
  const normExactIdx = normT.indexOf(normQ);
  if (normExactIdx !== -1) {
    const indices = Array.from({ length: q.length }, (_, i) => normExactIdx + i);
    let score = 75;
    if (normExactIdx === 0) {
      score = 95;
    } else if (normT[normExactIdx - 1] === ' ') {
      score = 85 - (normExactIdx * 0.1);
    }
    return { isMatch: true, indices, score };
  }

  // 2. Subsequence match (all letters in order)
  let qIdx = 0;
  const subIndices = [];
  for (let i = 0; i < t.length; i++) {
    if (t[i] === q[qIdx] || normT[i] === normQ[qIdx]) {
      subIndices.push(i);
      qIdx++;
      if (qIdx === q.length) break;
    }
  }
  
  if (qIdx === q.length) {
    const gapPenalty = subIndices[subIndices.length - 1] - subIndices[0] - q.length;
    return { isMatch: true, indices: subIndices, score: 50 - gapPenalty };
  }

  return { isMatch: false, indices: [], score: 0 };
};
