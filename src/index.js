// dotenv.config({ path: "./env" });
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
});


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Sever is running at port : ${process.env.PORT}`)
            app.on("error", (error) => {
                console.log("ERROR", error);
                throw error;
            })
        })
    })
    .catch((err) => {
        console.log("MONOGO db connection failed !!!", err);

    })


//* THIS IS OUR FIRST APPROACH TO CONNECT TO THE DATABASE 
/* 
import express from "express";
const app = express();
//* WE ARE CONNECTING TO THE DATABASE HERE 
(async () => { //* THESE ARE COLLED IF FEE FUNCTIONS 
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR", error);
            throw error;
        })


        app.listen(process.env.PORT, () =>{
            console.log(`App is listening in port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR", error)
        throw error;
    }
})()
    */