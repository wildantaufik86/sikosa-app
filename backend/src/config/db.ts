import mongoose from "mongoose";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (e) {
    console.log("Could Not Connect to Database", e);
    process.exit(1);
  }
};

export default connectToDatabase;
