export const generateSlug = (title, location) => {
  if (!title) return '';
  
  // 1. Convert to lowercase
  let slug = title.toLowerCase();

  // 2. Remove common stop words
  const stopWords = new Set(['the', 'a', 'an', 'in', 'at', 'of', 'for', 'to', 'with', 'and']);
  const words = slug.split(/[^a-z0-9]+/);
  const filteredWords = words.filter(word => word && !stopWords.has(word));

  // 3. Keep up to 8 key words
  const limitedWords = filteredWords.slice(0, 8);
  slug = limitedWords.join('-');

  // 4. Clean duplicate and boundary hyphens
  slug = slug.replace(/[^a-z0-9-]/g, '');
  slug = slug.replace(/-+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');

  // 5. Append location if not already present
  if (location) {
    const cleanLocation = location.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (cleanLocation && !slug.includes(cleanLocation)) {
      slug = `${slug}-${cleanLocation}`;
    }
  }

  // 6. Append -india if not already present
  if (!slug.endsWith('-india')) {
    slug = `${slug}-india`;
  }

  return slug;
};
