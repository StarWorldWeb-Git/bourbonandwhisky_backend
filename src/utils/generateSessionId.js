import crypto from 'crypto';
export const generateSessionId = () => crypto.randomBytes(16).toString('hex')