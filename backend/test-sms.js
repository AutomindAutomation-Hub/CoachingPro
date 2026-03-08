require('dotenv').config();
const sendSMS = require('./utils/sendSMS');

const run = async () => {
    // Should hit fallback if no key
    process.env.FAST2SMS_API_KEY = '';
    await sendSMS('9999999999', 'Notice: Test MSG');
    
    // Test with fake key to ensure axios handles error
    process.env.FAST2SMS_API_KEY = 'fake_key';
    await sendSMS('9999999999', 'Notice: Real MSG');
};
run();
