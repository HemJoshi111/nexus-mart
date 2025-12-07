import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
        [fullName, email, username, password, phoneNumber].some((field) => field?.trim() === "")
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

export { registerUser };