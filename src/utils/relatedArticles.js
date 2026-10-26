/**
 * Related Posts Helper
 * Calculates relationship between articles based on tags and categories
 */

/**
 * Calculate similarity score between two articles
 * Higher score = more related
 */
export function calculateSimilarity(article1, article2) {
  if (article1.slug === article2.slug) return 0;

  let score = 0;

  // Category match (strong signal)
  if (article1.category === article2.category) {
    score += 3;
  }

  // Tag overlap
  const tags1 = new Set(article1.tags || []);
  const tags2 = new Set(article2.tags || []);
  const commonTags = [...tags1].filter(tag => tags2.has(tag)).length;
  score += commonTags * 2;

  // Adjacent category colors (weak signal - related categories)
  const relatedCategories = {
    'Privacy': ['Security', 'Guide'],
    'Security': ['Privacy', 'Technology'],
    'Guide': ['Privacy', 'Comparison'],
    'Technology': ['Security'],
    'Comparison': ['Guide', 'Privacy'],
  };

  const relatedColor = relatedCategories[article1.category];
  if (relatedColor && relatedColor.includes(article2.category)) {
    score += 1;
  }

  return score;
}

/**
 * Get related articles sorted by relevance
 * Returns articles most similar to the target, excluding the target itself
 */
export function getRelatedArticles(targetSlug, allArticles, limit = 3) {
  const targetArticle = allArticles.find(a => a.slug === targetSlug);
  if (!targetArticle) return [];

  // Calculate similarity for all other articles
  const similarityScores = allArticles
    .map(article => ({
      article,
      score: calculateSimilarity(targetArticle, article),
    }))
    .filter(item => item.score > 0) // Only include relevant articles
    .sort((a, b) => b.score - a.score) // Sort by relevance
    .slice(0, limit); // Take top N

  // If not enough articles by similarity, fill with recent articles
  if (similarityScores.length < limit) {
    const otherArticles = allArticles
      .filter(a => a.slug !== targetSlug)
      .filter(a => !similarityScores.some(s => s.article.slug === a.slug))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit - similarityScores.length);

    similarityScores.push(...otherArticles.map(article => ({ article, score: 0 })));
  }

  return similarityScores.map(item => item.article);
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category, allArticles, limit = 5, excludeSlug = null) {
  return allArticles
    .filter(a => a.category === category && a.slug !== excludeSlug)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

/**
 * Get articles by tag
 */
export function getArticlesByTag(tag, allArticles, limit = 5, excludeSlug = null) {
  return allArticles
    .filter(a => (a.tags || []).includes(tag) && a.slug !== excludeSlug)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}
