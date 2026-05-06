
import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, profile, changePassword, forgotPassword, resetPassword, editAccountInformation, socialLogin, logout } from './customer.controller.js';
import { loginRules, registerRules, validate } from './customer.validation.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';


const customerRouter = Router();


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
customerRouter.post('/social-login', asyncHandler(socialLogin));
customerRouter.post('/login', loginRules, validate, asyncHandler(login));
customerRouter.post('/register', registerLimiter, registerRules, validate, asyncHandler(register));
customerRouter.post('/forgot-password', asyncHandler(forgotPassword));
customerRouter.post('/reset-password', asyncHandler(resetPassword));

// Protected Route (token required)
customerRouter.post('/logout', authMiddleware, asyncHandler(logout));
customerRouter.get('/profile', authMiddleware, asyncHandler(profile));
customerRouter.put('/change-password', authMiddleware, asyncHandler(changePassword));
customerRouter.put('/edit-information', authMiddleware, asyncHandler(editAccountInformation));
export default customerRouter;