const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI, {
        serverApi: { version: "1", strict: true, deprecationErrors: true },
      })

    console.log("Database connection Success!");
  } catch (err) {
    console.log(err);
  }
};
module.exports = connectDB;
