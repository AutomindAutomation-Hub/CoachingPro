const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Student = require('./models/Student');

const run = async () => {
    await connectDB();
    const students = await Student.find({ batchIds: "69a1c95922a801f47c9b00e2" });
    console.log("Normal:", students.length);
    const students2 = await Student.find({ batchIds: { $in: ["69a1c95922a801f47c9b00e2"] } });
    console.log("In:", students2.length);
    process.exit(0);
}
run();
