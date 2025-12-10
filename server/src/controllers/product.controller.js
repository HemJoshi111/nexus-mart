import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// @desc    Add a new product
// @route   POST /api/v1/products
// @access  Private (Seller/Admin)
const addProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, stock } = req.body;

    // 1. Validation
    if (
        [name, description, category, price, stock].some((field) => field === undefined || field === null || (typeof field === "string" && field.trim() === ""))
    ) {
        throw new ApiError(400, "All fields (name, description, price, category, stock) are required");
    }

    // 2. Image Upload
    // We expect a single file named 'productImage'
    const productImageLocalPath = req.file?.path;

    if (!productImageLocalPath) {
        throw new ApiError(400, "Product image is required");
    }

    const productImage = await uploadOnCloudinary(productImageLocalPath);

    if (!productImage) {
        throw new ApiError(500, "Image upload failed");
    }

    // 3. Create Product
    const product = await Product.create({
        name,
        description,
        productImage: productImage.url, //url from cloudinary
        price,
        stock,
        category,
        owner: req.user._id
    });

    if (!product) {
        throw new ApiError(500, "Something went wrong while creating the product");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, product, "Product created successfully"));
});


// @desc    Delete a product
// @route   DELETE /api/v1/products/:productId
// @access  Private (Owner Only)
const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Authorization Check
    if (product.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this product");
    }

    await Product.findByIdAndDelete(productId);

    // TODO: Delete image from Cloudinary

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

export {
    addProduct,
    deleteProduct,

}