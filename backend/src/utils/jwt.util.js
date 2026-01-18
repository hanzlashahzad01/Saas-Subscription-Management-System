import jwt from 'jsonwebtoken';

// Get JWT secrets from environment or use defaults (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_change_this_in_production_2024';

export const generateToken = (userId) => {
  if (!JWT_SECRET || JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production_2024') {
    console.warn('⚠️ WARNING: Using default JWT_SECRET. Please set JWT_SECRET in .env for production!');
  }
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const generateRefreshToken = (userId) => {
  if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET === 'your_refresh_token_secret_change_this_in_production_2024') {
    console.warn('⚠️ WARNING: Using default JWT_REFRESH_SECRET. Please set JWT_REFRESH_SECRET in .env for production!');
  }
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
