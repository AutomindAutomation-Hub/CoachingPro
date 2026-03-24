const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const testId = "67ca350ca90fe9bc7d3ee21d"; // Example ID from existing batches maybe?
        const students = await Student.find({ batchIds: testId }).lean();
        console.log(`Searching for string ID: ${testId}, found: ${students.length}`);

        const objId = new mongoose.Types.ObjectId(testId);
        const students2 = await Student.find({ batchIds: objId }).lean();
        console.log(`Searching for ObjectId: ${objId}, found: ${students2.length}`);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
