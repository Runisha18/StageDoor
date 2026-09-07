import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
//process.env.MONGODB_URI -->Give me the value stored in the MONGODB_URI environment variable



export async function connectToDatabase() {

    if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}
  try {
    await mongoose.connect(MONGODB_URI); 
    //Connect to the MongoDB database using this connection string
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

//async means this function performs an asynchronous operation.
//async makes a function asynchronous, meaning it can perform operations that take time, such as a database connection, without blocking the rest of the application. It also makes the function return a Promise.
//async  → defines an asynchronous function
//await  → waits for an asynchronous operation to finish