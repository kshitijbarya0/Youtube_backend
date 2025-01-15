import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userModel = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        lowercase:true,
        requried:true,
        trim:true,
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        requried:true,
        trim:true,
    },
    fullname:{
        type:String,
        requried:true,
        trim:true,
    },
    avatar:{
        type:String,
        requried:true
    },
    coverImage:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:[true,"password is required"],
        min:8,
        max:16,
        trim:true,
        unique:true
    },
    refreshToken:{
        type:String,
    },
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ]

},{timestamps:true})

userModel.pre("save",async function (next){
    if(!this.isModified("password")){
      return next();
    }
    this.password = bcrypt.hash(this.password,10)
    next();
})
userModel.method.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}
userModel.method.generateAccessToken = function(){
     return jwt.sign(
      {
        _id: this._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    )
}
userModel.method.generateRefreshToken = function(){
    return jwt.sign(
        {
          _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
      )
}

export const User = mongoose.model("User",userModel);