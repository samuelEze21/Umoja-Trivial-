// Test the category mapping function
const testCategories = [
  "Music – Afrobeats",
  "Places – Nigeria", 
  "Famous People – Nigeria",
  "Food – Nigeria",
  "Current Events – Nigeria",
  "Sports – Football",
  "Festivals – Culture",
  "Fashion – Nigeria",
  "Internet Trends – Nigeria",
  "BBNaija"
];

const mapCategory = (category) => {
  if (!category) return 'CURRENT_AFFAIRS';
  
  const normalizedCategory = category.toLowerCase();
  console.log(`Testing category: "${category}" -> normalized: "${normalizedCategory}"`);
  
  if (normalizedCategory.includes('music') || normalizedCategory.includes('afrobeats')) {
    console.log('  -> MUSIC');
    return 'MUSIC';
  }
  if (normalizedCategory.includes('food')) {
    console.log('  -> FOOD');
    return 'FOOD';
  }
  if (normalizedCategory.includes('places')) {
    console.log('  -> PLACES');
    return 'PLACES';
  }
  if (normalizedCategory.includes('famous people') || normalizedCategory.includes('people')) {
    console.log('  -> PEOPLE');
    return 'PEOPLE';
  }
  if (normalizedCategory.includes('festivals') || normalizedCategory.includes('culture')) {
    console.log('  -> CULTURE');
    return 'CULTURE';
  }
  if (normalizedCategory.includes('current events') || normalizedCategory.includes('current affairs')) {
    console.log('  -> CURRENT_AFFAIRS');
    return 'CURRENT_AFFAIRS';
  }
  if (normalizedCategory.includes('sports') || normalizedCategory.includes('fashion') || 
      normalizedCategory.includes('internet trends') || normalizedCategory.includes('bbnaija')) {
    console.log('  -> CURRENT_AFFAIRS (other)');
    return 'CURRENT_AFFAIRS';
  }
  
  console.log('  -> CURRENT_AFFAIRS (default)');
  return 'CURRENT_AFFAIRS';
};

console.log('Testing category mapping:');
testCategories.forEach(cat => {
  const result = mapCategory(cat);
  console.log(`"${cat}" -> ${result}\n`);
});