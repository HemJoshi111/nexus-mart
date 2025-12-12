import mongoose, { Schema } from "mongoose";

// 1. Define the Cart Item Schema (Sub-document)
const cartItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
        default: 1
    }
}, { _id: false }); // We don't need a separate ID for each item line, the productId is enough to identify it.

// 2. Define the Main Cart Schema
const cartSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true // A user can only have one active cart
    },
    items: {
        type: [cartItemSchema],
        default: []
    }
}, { timestamps: true });

export const Cart = mongoose.model("Cart", cartSchema);