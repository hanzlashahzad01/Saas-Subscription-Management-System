import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Create Stripe instance only if secret key is provided
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn('⚠️ Stripe secret key not found. Stripe features will be disabled.');
  }
} catch (error) {
  console.error('❌ Stripe initialization error:', error);
}

export default stripe;
