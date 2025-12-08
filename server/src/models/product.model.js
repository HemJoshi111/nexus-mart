import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true // Searching by name is very common
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        productImage: {
            type: String, // Cloudinary URL
            required: true
        },
        price: {
            type: Number,
            required: true,
            default: 0,
            min: [0, "Price cannot be negative"]
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: [0, "Stock cannot be negative"]
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User", // The Seller who owns this product
            required: true
        }
    },
    { timestamps: true }
);

// 🔌 Mongoose Plugin (Good for pagination)
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// productSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model("Product", productSchema);