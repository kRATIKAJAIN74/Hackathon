// Validate and normalize user input (facts)
export const collectFacts = (payload = {}) => {
  const age = Number(payload.age || 30);
  const weight = Number(payload.weight || 70); // kg
  const height = Number(payload.height || 170); // cm
  const goal = (payload.goal || 'general').toString().toLowerCase();
  const activityLevel = (payload.activityLevel || 'moderate').toString().toLowerCase();
  const dietType = (payload.dietType || '').toString().toLowerCase();
  const diseases = Array.isArray(payload.diseases) ? payload.diseases.map(d => d.toLowerCase()) : [];
  const allergies = Array.isArray(payload.allergies) ? payload.allergies.map(a => a.toLowerCase()) : [];

  return { age, weight, height, goal, activityLevel, dietType, diseases, allergies };
};

export default { collectFacts };
