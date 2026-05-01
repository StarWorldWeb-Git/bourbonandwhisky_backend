
import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, profile } from './customer.controller.js';
import { loginRules, registerRules, validate } from './customer.validation.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';


const customerRouter = Router();

// Rate Limiter - Brute force se bachao
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,                    
    message: {
        success: false,
        message: 'Too many login attempts. Try again after 15 minutes.'
    }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 3,                    
    message: {
        success: false,
        message: 'Too many registrations. Try again after 1 hour.'
    }
});

// Public Routes
customerRouter.post('/login',    loginLimiter,    loginRules,    validate, login);
customerRouter.post('/register', registerLimiter, registerRules, validate, register);

// Protected Route (token required)
customerRouter.get('/profile', authMiddleware, profile);

 export default customerRouter;