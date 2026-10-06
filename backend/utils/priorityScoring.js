const calculatePriorityScore = (issue) => {
  let score = 0;

  // 1. Severity Base Score
  switch (issue.severity) {
    case 'High': score += 30; break;
    case 'Medium': score += 20; break;
    case 'Low': score += 10; break;
  }

  // 2. Upvotes Score (+2 per upvote)
  if (issue.upvotes && issue.upvotes.length > 0) {
    score += issue.upvotes.length * 2;
  }

  // 3. Category Importance
  const criticalCategories = ['Electricity', 'Traffic Signal', 'Water Leakage'];
  const highCategories = ['Pothole', 'Drainage', 'Damaged Road'];
  
  if (criticalCategories.includes(issue.category)) {
    score += 15;
  } else if (highCategories.includes(issue.category)) {
    score += 10;
  } else {
    score += 5;
  }

  // 4. Age Score (+1 per day, max 14)
  const today = new Date();
  const createdDate = new Date(issue.createdAt || today);
  const diffTime = Math.abs(today - createdDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  const ageScore = Math.min(diffDays, 14);
  score += ageScore;

  // Cap score at 100 for percentage if needed
  // score = Math.min(score, 100);

  return score;
};

const determinePriorityLevel = (score) => {
  if (score >= 70) return 'Critical';
  if (score >= 41) return 'High';
  if (score >= 21) return 'Medium';
  return 'Low';
};

module.exports = {
  calculatePriorityScore,
  determinePriorityLevel
};
