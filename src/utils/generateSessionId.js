import crypto from 'crypto';
 
// Guest cart ke liye 32-char unique session ID generate karo
// OpenCart bhi 32-char session ID use karta hai
export const generateSessionId = () => crypto.randomBytes(16).toString('hex')