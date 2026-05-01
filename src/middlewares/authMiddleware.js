import { errorResponse } from '../utils/apiResponse.js';
import { verifyToken } from '../utils/generateToken.js';

 export const authMiddleware = (req, res, next) => {
    try {
        // Header se token lo
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, 'No token provided');
        }

        const token = authHeader.split(' ')[1];

        // Token verify karo
        const decoded = verifyToken(token);
        req.customer = decoded; // customer info attach karo request me
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 401, 'Token expired, please login again');
        }
        return errorResponse(res, 401, 'Invalid token');
    }
}

