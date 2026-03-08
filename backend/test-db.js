const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Student = require('./models/Student');

const run = async () => {
    await connectDB();
    const students = await Student.find({}, 'batchIds userId');
    console.log(JSON.stringify(students, null, 2));
    process.exit(0);
}
run();
