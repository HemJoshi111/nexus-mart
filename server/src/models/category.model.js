import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // No duplicate categories like 'Electronics' and 'electronics'
            trim: true,
            index: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User" // Tracks which Admin created this category
        }
    },
    { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);