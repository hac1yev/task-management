import mongoose from "mongoose";

export const connectToDB = async () => {
    const connection: any = {};

    try {
        if(connection.isConnected) return;
        const db = await mongoose.connect(process.env.DATABASE_URI!);
        connection.isConnected = db.connections[0].readyState;
        
    } catch (error: any) {
        throw new Error(error);
    }
};