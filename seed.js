require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      username: "admin",
      password: hashedPassword
    });

    console.log("Admin user created");
    process.exit();
  });
