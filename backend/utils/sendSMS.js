// Utility function for sending SMS via Fast2SMS
const axios = require('axios');

const sendSMS = async (phone, message) => {
    if (!phone) {
        console.log(`[SMS MOCK] No phone number provided. Message: ${message}`);
        return false;
    }

    const apiKey = process.env.FAST2SMS_API_KEY;

    // Simulate SMS if no valid API key is present
    if (!apiKey || apiKey === '') {
        console.log(`=========================
[SMS SIMULATED TO: ${phone}]
MESSAGE: ${message}
API_KEY MISSING - SKIPPING ACTUAL DISPATCH
=========================`);
        return true;
    }

    // Send Real SMS
    try {
        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'v3',
                sender_id: 'TXTIND',
                message: message,
                language: 'english',
                flash: 0,
                numbers: phone
            },
            {
                headers: {
                    'authorization': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.return) {
            console.log(`[Fast2SMS SUCCESS] Sent to ${phone}: ${response.data.message[0]}`);
            return true;
        } else {
            console.error(`[Fast2SMS ERROR] Failed to send to ${phone}: ${response.data.message}`);
            return false;
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;

        if (errorMsg.includes('100 INR')) {
            console.log(`=========================
[SMS SIMULATED TO: ${phone}]
MESSAGE: ${message}
FAST2SMS FREE TIER PORTAL RESTRICTION ENCOUNTERED:
${errorMsg}
(Skipping real dispatch - simulated success)
=========================`);
            // We return true so the app can continue working without breaking 
            // the whole "Attendance Saving" process just because the user 
            // hasn't funded their Fast2SMS wallet yet.
            return true;
        }

        console.error(`[Fast2SMS DISPATCH FAILED] ${errorMsg}`);
        return false;
    }
};

module.exports = sendSMS;
