import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true
    },
    // We store the price AT THE TIME OF ORDER to handle future price changes in the product catalog
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new Schema(
    {
        orderPrice: {
            type: Number,
            required: true
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        orderItems: {
            type: [orderItemSchema]
        },
        address: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["PENDING", "CANCELLED", "DELIVERED"],
            default: "PENDING"
        },
        paymentId: {
            type: String,
            // We can use this later when integrating Esewa. 
            // For now, it can store a mock ID.
        }
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);