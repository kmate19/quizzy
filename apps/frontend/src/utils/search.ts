export interface Card {
  name: string;
  desc: string;
  category: string;
  created_by: string;
}

interface FuzzySearchOptionsForCard {
  threshold?: number;
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
  keys?: keyof Card | (keyof Card)[] | ((item: Card) => string | string[]);
}

export  interface FuzzySearchResult<T> {
  item: T;
  score: number;
}

function levenshteinDistance(s1: string, s2: string): number {
if (s1.length === 0) return s2.length;
if (s2.length === 0) return s1.length;

const matrix: number[][] = [];

let i;
for (i = 0; i <= s2.length; i++) {
  matrix[i] = [i];
}

let j;
for (j = 0; j <= s1.length; j++) {
  matrix[0][j] = j;
}


for (i = 1; i <= s2.length; i++) {
  for (j = 1; j <= s1.length; j++) {
    if (s2.charAt(i - 1) == s1.charAt(j - 1)) {
      matrix[i][j] = matrix[i - 1][j - 1];
    } else {
      matrix[i][j] = Math.min(
        matrix[i - 1][j - 1] + 1,
        Math.min(
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      );
    }
  }
}

return matrix[s2.length][s1.length];
}

function calculateLevenshteinScore(query: string, target: string): number {
if (!query) return 0;
if (!target) return 0;

const distance = levenshteinDistance(query, target);
const maxLength = Math.max(query.length, target.length);

if (maxLength === 0) return 1; 

const score = 1 - (distance / maxLength); 
return Math.max(0, score); 
}


export  function fuzzySearch(
  query: string,
  items: Card[],
  options: FuzzySearchOptionsForCard = {}
): FuzzySearchResult<Card>[] {
  if (!query || !items || items.length === 0) {
    return [];
  }

  const {
    threshold = 0.8,//tuning
    caseSensitive = false,
    trimWhitespace = true,
    keys,
  } = options;

  const normalizedQuery = normalizeString(query, caseSensitive, trimWhitespace);

  const results: FuzzySearchResult<Card>[] = [];

  for (const item of items) {
    let itemStrings: string[] = [];

    if (typeof keys === 'function') {
      const keyValues = keys(item);
      if (Array.isArray(keyValues)) {
        itemStrings = keyValues.map(val => normalizeString(String(val), caseSensitive, trimWhitespace));
      } else {
        itemStrings = [normalizeString(String(keyValues), caseSensitive, trimWhitespace)];
      }
    } else if (typeof keys === 'string') {
      const keyValue = item[keys];
      itemStrings = [normalizeString(String(keyValue), caseSensitive, trimWhitespace)];
    } else if (Array.isArray(keys)) {
      itemStrings = keys.map(key => {
        const keyValue = item[key];
        return normalizeString(String(keyValue), caseSensitive, trimWhitespace);
      });
    }

    let bestScore = 0;
    for (const itemString of itemStrings) {
      const score = calculateLevenshteinScore(normalizedQuery, itemString); 
      bestScore = Math.max(bestScore, score);
    }

    if (bestScore >= threshold) {
      results.push({ item, score: bestScore });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

function normalizeString(str: string, caseSensitive: boolean, trimWhitespace: boolean): string {
  let normalized = str;
  if (trimWhitespace) {
    normalized = normalized.trim();
  }
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}