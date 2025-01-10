import mongoose from "mongoose"
import {DB_NAME} from "../constant.js"

const MongoDB = async ()=>{
    try {
        const dbconnect = await mongoose.connect(`${process.env.MONGO_DB}/${DB_NAME}`);
        console.log(`DB Connection done ${dbconnect}`);
    } catch (error) {
        console.log(`DB connection failed ${error}`);
        process.exit(1);
    }
}
export default MongoDB;