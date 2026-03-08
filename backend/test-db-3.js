const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Student = require('./models/Student');

const run = async () => {
    await connectDB();
    const batchId = "69a1c95922a801f47c9b00e2";
    const students = await Student.find({ batchIds: batchId });
    console.log("Found:", students.length);
    process.exit(0);
}
run();
