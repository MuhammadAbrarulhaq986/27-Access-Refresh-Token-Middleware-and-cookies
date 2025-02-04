import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import fs from "fs"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken() //* YOU ONLY GENERATED THE TOKENS
        const refreshToken = user.generateRefreshToken() //* IN THIS FUNCTIONS

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //* GET USER DETAILS FROM FROUNTEND
    //* VALIDATION -- NOT EMPTY
    //* CHECK IF USER ALREADY EXISTS: USERNAME , EMAIL
    //* CHECK FOR IMAGES, CHECK FOR AVATAR
    //* UPLOAD THEM TO CLOUDINARY, AVATAR
    //* CREATE USSER OBJECT -- CREATE ENTRY IN DB
    //* REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM RESPONSE
    //* CHECK FOR USER CREATION 
    //* RETURN res

    const { fullName, email, username, password } = req.body
    //console.log(" fullName, email, username, password", email, password, username, fullName);
    //* THIS IS ALSO A GOOD WAY TO CHECK THE CONDITIONS
    //if (fullName === "") {
    //    throw new ApiError(400, "Fullname is required")
    //}

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    //console.log(req.files); //* THIS IS USED TO CHECK HOW THE FILES ARE GOING 
    if (existedUser) {
        throw new ApiError(409, "User already exists with the same username or email");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url, //*  THIS IS NECESSARY
        coverImage: coverImage?.url || "", //*  THIS IS OPTIONAL
        email,
        password,
        username: username.toLowerCase(),
    })

    //* WHEN YOU GET THE USER YOU WONT BE GETTING HIS PASSWORD AND REFRESHTOKEN
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

});

const loginUser = asyncHandler(async (req, res) => {
    //* 1. use req.body to call data
    //* 2. use one method to login user  username or email 
    //* 3. find user if he exists or not   
    //* 4. check if password is correct or not
    //* 5. if password is correct then generate access and refresh Tokens 
    //* 6. send cookies


    const { email, username, password } = req.body;

    if (!username || !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }] //* THIS IS MONGODB BUILTIN METHOD
    })
    if (!user) {
        throw new ApiError(404, "User does not exists with this username or email");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                //* THIS RESPONSE IS FROM THE API RESPONSE FILE
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            "User logged in successfully"
        ))
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
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export { registerUser, loginUser, logoutUser };  