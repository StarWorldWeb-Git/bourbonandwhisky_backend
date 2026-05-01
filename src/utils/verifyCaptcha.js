import axios from "axios"

export const verifyCaptcha = async (token) => {


    if (process.env.NODE_ENV === 'development' && token === 'SKIP') {
        return true;
    }

    if (!token) throw new Error('Captcha token is required');

    const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
            params: {
                secret:   process.env.RECAPTCHA_SECRET_KEY,
                response: token
            }
        }
    );

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
        console.error('Captcha failed', errorCodes);
        throw new Error('Captcha verification failed. Please try again.');
    }

    return true;
};