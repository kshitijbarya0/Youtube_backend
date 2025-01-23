import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrors.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    // steps to create registerUser 
    // 1) get user details from frontend
    // 2) all validation - Check not Empty   
    // 3) check if user already exits :- {email, username}
    // 4) check for images, check for avatar
    // 5) upload them to cloundinary
    // 6) create user Object - create entry in db
    // 7) remove password and refresh token field from response
    // 8) check for user creation 
    // 10) return final *\_/*
    // **************Start *******************//

    // imp note if data comes from any form or json then it will be availble in body
    //get user details from frontend
    const { fullName, username, email, password } = req.body
    // method 1 we can check one by one 
    // if (fullName === "") {
    //     throw new ApiError(400, "fullname is required");
    // }

    //all validation - Check not Empty
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exits :- {email, username}
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) throw new ApiError(409, "User with email or username already exists");

    //check for images, check for avatar
    const avatarLoacalPath = req.files?.avatar[0]?.path
    let coverImageLoaclPath;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLoaclPath = req.files.coverImage[0].path;
    }
    if (!avatarLoacalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    //upload them to cloundinary
    const avatarImage = await uploadOnCloudinary(avatarLoacalPath);
    const coverImage = await uploadOnCloudinary(coverImageLoaclPath);
    if (!avatarImage) throw new ApiError(400, "Avatar file is required");

    // create user Object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatarImage.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation 
    if (!createdUser) throw new ApiError(500, "Something went wrong while registring user")

    //return final
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export {
    registerUser,


}