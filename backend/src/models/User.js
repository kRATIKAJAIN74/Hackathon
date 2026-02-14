import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    profile: {
      goal: {
        type: String,
        enum: {
          values: ['fitness', 'diabetes', 'heart_health', 'weight_loss', 'general_wellness'],
          message: '{VALUE} is not a valid goal'
        },
        required: false,
      },
      dietType: {
        type: String,
        enum: {
          values: ['vegetarian', 'non_vegetarian', 'vegan'],
          message: '{VALUE} is not a valid diet type'
        },
        required: false,
      },
      allergies: {
        type: [String],
        default: [],
      },
      healthConditions: {
        type: [String],
        default: [],
      },
      nutritionConstraints: {
        calorieLimit: {
          type: Number,
          default: 2000,
        },
        sugarLimit: {
          type: Number,
          default: 50,
        },
        sodiumLimit: {
          type: Number,
          default: 2300,
        },
        proteinTarget: {
          type: Number,
          default: 50,
        },
      },
    },
    preferences: {
      cuisines: [String],
      saveFavoriteRecipes: {
        type: Boolean,
        default: true,
      },
    },
    favoriteRecipes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcryptjs.compare(password, this.password);
};

// Remove password from JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
