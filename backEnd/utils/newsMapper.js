/**
 * Map a News API article to our News model schema
 * @param {Object} article - News API article object
 * @param {string} category - Category to assign to the article
 * @returns {Object} Mapped article object conforming to our News model
 */
const mapArticleToNewsModel = (article, category = 'general') => {
  // Extract or create a summary from the description or content
  const summary = article.description || 
    (article.content ? article.content.substring(0, 150) + '...' : 'No summary available');
  
  // Map the article fields to our News model schema
  return {
    title: article.title,
    content: article.content || article.description || 'No content available',
    summary: summary,
    author: article.author || 'Unknown',
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    source: {
      id: article.source.id || null,
      name: article.source.name || 'Unknown Source'
    },
    imageUrl: article.urlToImage || null,
    url: article.url,
    category: category,
    // We'll extract tags based on content analysis or assign them manually
    tags: extractTagsFromArticle(article),
    // Related teams would be determined by separate logic or manually assigned
    relatedTeams: []
  };
};

/**
 * Extract potential tags from article content
 * This is a simple implementation. In production, you might use NLP techniques
 * @param {Object} article - News API article object
 * @returns {Array} Array of extracted tags
 */
const extractTagsFromArticle = (article) => {
  const tags = [];
  const content = (article.title + ' ' + (article.description || '') + ' ' + (article.content || '')).toLowerCase();
  
  // Add "LaLiga" tag to all articles
  tags.push('LaLiga');
  
  // Check for common Spanish teams
  const teams = [
    'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 
    'Valencia', 'Villarreal', 'Athletic Bilbao', 'Real Sociedad',
    'Real Betis', 'Celta Vigo', 'Espanyol', 'Girona', 'Osasuna',
    'Alaves', 'Mallorca', 'Las Palmas', 'Getafe', 'Cadiz',
    'Granada', 'Rayo Vallecano'
  ];
  
  teams.forEach(team => {
    if (content.includes(team.toLowerCase())) {
      tags.push(team);
    }
  });
  
  // Check for common event types
  if (content.includes('transfer') || content.includes('sign ') || content.includes('signing')) {
    tags.push('transfer');
  }
  
  if (content.includes('injur') || content.includes('fitness') || content.includes('recovery')) {
    tags.push('injury');
  }
  
  if (content.includes('match') || content.includes('game') || 
     content.includes('fixture') || content.includes('played')) {
    tags.push('match');
  }
  
  if (content.includes('preview') || content.includes('upcoming') || 
     content.includes('prepare') || content.includes('ready for')) {
    tags.push('preview');
  }
  
  // Ensure tags are unique
  return [...new Set(tags)];
};

/**
 * Categorize an article based on its content
 * @param {Object} article - News API article object
 * @returns {string} Category string
 */
const categorizeArticle = (article) => {
  const content = (article.title + ' ' + (article.description || '') + ' ' + (article.content || '')).toLowerCase();
  
  if (content.includes('transfer') || content.includes('sign ') || content.includes('signing') || 
      content.includes('deal') || content.includes('contract')) {
    return 'transfer';
  }
  
  if (content.includes('injur') || content.includes('fitness') || 
      content.includes('recovery') || content.includes('return from')) {
    return 'injury';
  }
  
  if (content.includes('result') || content.includes('score') || 
      content.includes('win') || content.includes('lose') || content.includes('draw') ||
      content.includes('match report') || content.includes('match summary')) {
    return 'match_report';
  }
  
  if (content.includes('preview') || content.includes('upcoming') || 
      content.includes('prepare') || content.includes('ready for') ||
      content.includes('before the match')) {
    return 'preview';
  }
  
  return 'general';
};

export { mapArticleToNewsModel, extractTagsFromArticle, categorizeArticle }; 