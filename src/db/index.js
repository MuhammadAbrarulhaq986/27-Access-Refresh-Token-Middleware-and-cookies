import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\n MonogoDB connected!!! DB HOST: ${connectionInstance.connection.host}`);


    } catch (error) {
        console.log("MONGODB connection FAILD!!!", error);
        process.exit(1); //* Exit with code 1 to signal an error
        //***************/ 
        //* console.error("Missing MONGO_URI environment variable!");
        // process.exit(2); //* Exit with custom code 2    
        //***************/ 
        //* console.log("All operations completed successfully!");
        //* process.exit(0); // Exit with code 0 for success
    }
}


export default connectDB;





//* THIS IS HOW MY TEACH THOUGHT US TO CONNECT TO THE DATABASE 
/* 
import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}hackathon`
        );
        console.log(
            `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export default connectDB;

*/