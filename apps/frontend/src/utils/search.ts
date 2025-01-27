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
  
export  function fuzzySearch(
    query: string,
    items: Card[],
    options: FuzzySearchOptionsForCard = {}
  ): FuzzySearchResult<Card>[] {
    if (!query || !items || items.length === 0) {
      return [];
    }
  
    const {
      threshold = 0.9,
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
        const score = calculateFuzzyScore(normalizedQuery, itemString);
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
  
  function calculateFuzzyScore(query: string, target: string): number {
    if (!query) return 0;
    if (!target) return 0;
  
    let score = 0;
    let queryIndex = 0;
    let targetIndex = 0;
    let consecutiveMatchCount = 0;
  
    while (queryIndex < query.length && targetIndex < target.length) {
      if (query[queryIndex] === target[targetIndex]) {
        score++;
        consecutiveMatchCount++;
  
        if (consecutiveMatchCount > 1) {
          score += consecutiveMatchCount * 0.5;
        }
  
        queryIndex++;
      } else {
        consecutiveMatchCount = 0;
      }
      targetIndex++;
    }
  
    if (score === 0) return 0;
  
    const normalizedScore = score / query.length;
  
    return Math.min(normalizedScore, 1);
  }