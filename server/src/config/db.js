import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/nexusmart`);
        console.log(`☘️  MongoDB Connected! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("❌ MONGODB connection error: ", error);
        process.exit(1);
    }
}

export default connectDB;