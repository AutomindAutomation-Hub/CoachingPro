const mongoose = require('mongoose');
const Student = require('./models/Student');
const Batch = require('./models/Batch');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const batch = await Batch.findOne({ name: /class 10 - Physics/i });
        if (!batch) {
            console.log('Batch not found');
            process.exit();
        }
        console.log('Batch ID:', batch._id);
        const students = await Student.find({ batchIds: batch._id }).populate('userId').lean();
        console.log('Students found:', students.length);
        students.forEach(s => {
            console.log(`- Enrollment: ${s.enrollmentNo}, User: ${s.userId?.name || 'MISSING'}`);
        });
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
