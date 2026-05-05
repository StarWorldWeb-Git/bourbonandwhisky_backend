import { verifyToken } from '../utils/generateToken.js';

// ─────────────────────────────────────────────────────────────
// optionalAuth Middleware
//
// authMiddleware se fark:
//   authMiddleware → token nahi = 401 BLOCK
//   optionalAuth   → token nahi = guest maano, next() chalo
//
// Token valid   → req.customer = { customer_id, email, ... }
// Token nahi    → req.customer = null  (guest user)
// Token invalid → req.customer = null  (guest treat)
// ─────────────────────────────────────────────────────────────

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    // Token hai hi nahi ya empty → guest
    if (!token || typeof token !== 'string' || token.trim() === '') {
      req.customer = null;
      return next();
    }

    const decoded = verifyToken(token);

    // Decode hua but customer_id missing → guest
    if (!decoded || !decoded.customer_id) {
      req.customer = null;
      return next();
    }

    // Sab theek → customer set karo
    req.customer = decoded;
    return next();

  } catch (error) {
    // TokenExpiredError, JsonWebTokenError → block nahi, guest treat
    req.customer = null;
    return next();
  }
};