import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // 1. Get the token from Cookie OR Header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // 2. Check if token exists
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // 3. Verify the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedToken);


        // 4. Find the user based on the decoded ID
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // 5. Attach user to request object
        // Now any controller after this middleware can access 'req.user'
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }

})