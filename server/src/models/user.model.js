import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


// 1. A Sub-schema for Address
const addressSchema = new Schema({
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: "Nepal", trim: true }
}, { _id: false }); // We don't need a unique ID for the address sub-document itself

// 2. Define the Main User Schema
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            // 🔍 Regex Validation: Ensures string follows standard email format
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                "Please enter a valid email address",
            ],
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            // Basic length check
            minlength: [10, "Phone number must be at least 10 digits"],
            maxlength: [15, "Phone number cannot exceed 15 digits"]
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            index: true
        },
        // 🏠 Embedding the address schema here
        address: {
            type: addressSchema,
            default: {}
        },
        avatar: {
            type: String, // Cloudinary URL
            required: [true, "Avatar image is required"],
        },
        coverImage: {
            type: String, // Cloudinary URL
        },
        role: {
            type: String,
            enum: {
                values: ["BUYER", "SELLER", "ADMIN"],
                message: "{VALUE} is not a valid role"
            },
            default: "BUYER"
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);
// 🔒 Pre-save Hook: Encrypt password before saving
userSchema.pre("save", async function (next) {
    // If password field hasn't been modified (e.g. user updated their email only), skip hashing
    if (!this.isModified("password")) return next();

    // Hash the password with 10 rounds of salt
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔑 Method: Check if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    // Compare the plain text password with the hashed password in DB
    return await bcrypt.compare(password, this.password);
};

// 🎟️ Method: Generate Access Token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// 🔄 Method: Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);