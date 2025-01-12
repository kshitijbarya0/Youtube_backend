import mongoose from "mongoose";

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

export const User = mongoose.model("User",userModel);