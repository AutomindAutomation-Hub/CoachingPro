require('dotenv').config();
const sendSMS = require('./utils/sendSMS');
const run = async () => {
    await sendSMS('6206065848', 'Notice: Your ward Aman Kumar Verma was marked ABSENT today for their batch. Please contact the coaching institute.');
};
run();
