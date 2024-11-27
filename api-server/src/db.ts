import mongoose from "mongoose";

export const connectToDatabase = async()=>{
    await mongoose.connect(process.env.DATABASE_URL as string);
}
connectToDatabase().catch(err => console.log(err));