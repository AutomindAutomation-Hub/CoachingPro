require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS: 5000})
  .then(async () => {
    console.log("Connected to MongoDB");
    try {
        let u = await User.create({name: "x", email: "xx@xx.com", password: "p", role: "Student"});
        console.log("Created", u.email);
    } catch(err) {
        console.log("Error:", err);
    }
    process.exit(0);
  });
