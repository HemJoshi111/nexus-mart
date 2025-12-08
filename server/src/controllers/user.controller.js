import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { runInNewContext } from "vm";


// Helper Function: Generate Access & Refresh Tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // Save the refresh token in the database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

// @desc    Register a new user (Buyer/Seller)
// @route   POST /api/v1/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {

    // 1. Get user details from request body
    // Note: 'address' fields typically come as separate fields in multipart forms, 
    // or as a JSON string. Here we assume we extract them manually to build the object.
    const {
        fullName,
        email,
        username,
        password,
        phoneNumber,
        street, city, state, zipCode, country // Address fields
    } = req.body;

    // 2. Validation - Check if fields are not empty
    if (
        [fullName, email, username, password, phoneNumber].some((field) =>
            field === undefined || field === null || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }] // Find if username OR email matches
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // 4. Check for Avatar image (Required)
    // req.files is provided by Multer middleware
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // Optional

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 5. Upload to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    // 6. Create User Object in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // If no cover image, save empty string
        email,
        password,
        username: username.toLowerCase(),
        phoneNumber,
        address: {
            street,
            city,
            state,
            zipCode,
            country: country || "Nepal"
        }
    });

    // 7. Sanitize Response (Check for user creation and remove sensitive info)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" // (-) means exclude these fields
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 8. Send Response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

// @desc    Login user & get tokens
// @route   POST /api/v1/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    // 1. Get data from body (req.body)
    const { email, username, password } = req.body;

    // 2. Validate data (Require username OR email)
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    // 3. Find User in DB
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // 4. Check Password Validity
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // 5. Generate Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // 6. Send Response with Cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie Options (Secure)
    const options = {
        httpOnly: true,  // JavaScript cannot read this cookie (Prevents XSS)
        secure: true     // Only send over HTTPS
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken // Send Access Token in JSON for frontend usage
                    // refreshToken: NO! We do not send this in JSON for security reasons.
                },
                "User logged in Successfully"
            )
        );
});


// @desc    Logout user (Clear cookies & DB token)
// @route   POST /api/v1/users/logout
// @access  Protected (Login required)
const logoutUser = asyncHandler(async (req, res) => {
    // 1. Update User in DB: Remove the refreshToken
    await User.findByIdAndUpdate(
        req.user._id, // We have this because of verifyJWT middleware!
        {
            $unset: {
                refreshToken: 1 // Removing the field from document
            }
        },
        {
            new: true
        }
    )

    // 2. Clear Cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
};