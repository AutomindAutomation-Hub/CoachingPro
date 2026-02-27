// Utility function for sending SMS
// For production use Twilio or Fast2SMS API here

const sendSMS = async (phone, message) => {
    if (!phone) {
        console.log(`[SMS MOCK] No phone number provided. Message: ${message}`);
        return false;
    }

    // Mock SMS Send
    console.log(`=========================
[SMS SENT TO: ${phone}]
MESSAGE: ${message}
=========================`);
    return true;
};

module.exports = sendSMS;
