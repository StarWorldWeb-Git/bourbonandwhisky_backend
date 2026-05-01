import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { getProfile, loginCustomer, registerCustomer } from './customer.service.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const ip = req.ip || req.headers['x-forwarded-for'];
        const result = await loginCustomer(email, password, ip);
        return successResponse(res, 200, 'Login successful', result);
    } catch (error) {
        return errorResponse(res, 401, error.message);
    }
}

export const register = async (req, res) => {
    try {
        const ip = req.ip || req.headers['x-forwarded-for'];
        console.log('Client IP:', ip);``
        const result = await registerCustomer(req.body, ip);
        return successResponse(res, 201, 'Registration successful', result);
    } catch (error) {
        return errorResponse(res, 400, error.message);
    }
}

export const profile = async (req, res) => {
    try {
        // req.customer authMiddleware se aata hai
        const data = await getProfile(req.customer.customer_id);
        return successResponse(res, 200, 'Profile fetched', data);
    } catch (error) {
        return errorResponse(res, 404, error.message);
    }
}

