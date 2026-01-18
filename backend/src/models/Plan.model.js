import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    monthly: {
      type: Number,
      required: [true, 'Monthly price is required'],
      min: 0
    },
    yearly: {
      type: Number,
      required: [true, 'Yearly price is required'],
      min: 0
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  usageLimits: {
    maxUsers: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    maxStorage: {
      type: Number,
      default: -1 // in GB, -1 means unlimited
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stripePriceIdMonthly: {
    type: String
  },
  stripePriceIdYearly: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trialDays: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
