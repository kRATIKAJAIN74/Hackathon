import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  id: String,
  name: String,
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  tags: [String],
  allergens: [String],
}, { _id: false });

const daySchema = new mongoose.Schema({
  date: Date,
  meals: {
    breakfast: [mealSchema],
    lunch: [mealSchema],
    dinner: [mealSchema],
    snacks: [mealSchema],
  },
}, { _id: false });

const planSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  days: [daySchema],
  meta: {
    goal: String,
    dietType: String,
    allergies: [String],
    dailyCalorieTarget: Number,
    activityLevel: String,
    mealsPerDay: Number,
    preferences: [String],
  },
}, { timestamps: true });

export const Plan = mongoose.model('Plan', planSchema);
