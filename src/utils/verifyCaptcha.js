import axios from "axios"


export const verifyCaptcha = async (token) => {


//     RECAPTCHA_SECRET_KEY=6LcEmdMsAAAAAH8JNRlGtKdlDGTUfPI3qa2Hd1pf
// RECAPTCHA_SITE_KEY=6LcEmdMsAAAAAG1LWT2rpyzfeTpcIPjD0S2boTwR
    if (!token) throw new Error("Captcha token is required")

    const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null,
        {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                res: token
            }
        }
    );

    const { success, 'error-codes': errorCodes } = res.data;

    if (!success) {
        console.error(`Captcha Failed`, errorCodes);
        throw new Error('Captcha verification failed. Please try again.');
    }

    return true ;

}