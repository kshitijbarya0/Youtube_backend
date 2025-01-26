import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrors.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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

const loginUser = asyncHandler(async (req, res) => {
    //steps to login User
    //req body -> data
    //find the user
    //password check
    //access and refresh token generate
    //send cookie


    // req body
    const { email, username, password } = req.body
    if (!username && !email) throw new ApiError(400, "username or password is requried");


    // find the user
    const user = await User.findOne({
        // $or means this will find username or email is present in mongoDB
        $or: [{ username }, { email }]
    })
    if (!user) throw new ApiError(404, "user does not exist");


    //password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");


    //access and refresh token generate
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    //send cookie
    const loggedInUser = await User.findById(user._id).
        select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options).
        cookie("refreshToken", refreshToken, options).
        json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User loggedOut"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request")
    try {
        const decodedToken = jwt.verify(
            incomingRefreshTokenm,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await user.findById(decodedToken?._id);
        if (!user) throw new ApiError(401, "Invaild refresh token")
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token");
    }

})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
}