import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express()
app.use(cors()); // cross origin resource sharing means in simple if i want to allow my friend to enter in my home then its is legal but what if someone who is unkown to me if he/she enter in my home that illegal and the same work CORS do here its allow only know Origin request
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded());// example like you have seen in URL Kshtij+barya=? or kshitij%20barya for handle this kind of content we will use cookieParser
app.use(express.static("public"));
app.use(cookieParser());  
//routes
import userRouter from './routes/user.routes.js'



//routes declaration
app.use("/api/v1/user",userRouter);


export { app }