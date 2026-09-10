const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sweet_and_savory';
    console.log(`[Database] Connecting to MongoDB: ${mongoUri}`);
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}:${conn.connection.port || 27017}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.error(`[Database Hint] Please ensure MongoDB service is running on 127.0.0.1:27017 or update MONGO_URI in .env`);
    process.exit(1);
  }
};

module.exports = connectDB;
