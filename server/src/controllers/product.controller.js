import mongoose from "mongoose";
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

// @desc    Get all products
// @route   GET /api/v1/products?page=1&limit=10&query=headphones&categoryId=...
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, categoryId } = req.query;

    // Build the filter object dynamically
    const filter = {};

    // 1. Search by Name (Case insensitive regex)
    if (query) {
        filter.name = { $regex: query, $options: "i" };
    }

    // 2. Filter by Category
    if (categoryId) {
        filter.category = new mongoose.Types.ObjectId(categoryId);
    }

    // 3. Setup Pagination Options
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }, // Newest first
        populate: "category" // Fetch category details automatically
    };

    // To use .paginate(), we  need the 'mongoose-aggregate-paginate-v2' plugin in the model.
    // we have  used standard .find() logic for simplicity and control.

    const skip = (options.page - 1) * options.limit;

    const products = await Product.find(filter)
        .sort(options.sort)
        .skip(skip)
        .limit(options.limit)
        .populate("category", "name") // Get just the name of category
        .populate("owner", "fullName username avatar"); // Get owner details

    const totalProducts = await Product.countDocuments(filter);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            products,
            pagination: {
                total: totalProducts,
                page: options.page,
                limit: options.limit,
                totalPages: Math.ceil(totalProducts / options.limit)
            }
        }, "Products fetched successfully"));
});

// @desc    Get single product by ID
// @route   GET /api/v1/products/:productId
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // Validate if productId is a valid MongoDB ID format
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid Product ID");
    }

    const product = await Product.findById(productId)
        .populate("category", "name")
        .populate("owner", "fullName username email");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// @desc    Update product details
// @route   PATCH /api/v1/products/:productId
// @access  Private (Owner Only)
const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { name, description, price, stock, category } = req.body;

    // 1. Find Product first
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // 2. Authorization Check: Is the user trying to edit the product is the owner?
    // We convert both IDs to strings for comparison
    if (product.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this product");
    }

    // 3. Handle Image Update (Optional)
    let productImageLocalPath;
    if (req.file) {
        productImageLocalPath = req.file.path;
    }

    let productImageUrl = product.productImage;

    if (productImageLocalPath) {
        // Upload new image
        const img = await uploadOnCloudinary(productImageLocalPath);
        if (img) {
            productImageUrl = img.url;
            // TODO: delete the old image from Cloudinary to save space
        }
    }

    // 4. Update Fields
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                name: name || product.name,
                description: description || product.description,
                price: price || product.price,
                stock: stock || product.stock,
                category: category || product.category,
                productImage: productImageUrl
            }
        },
        { new: true }
    ).populate("category");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
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
    getAllProducts,
    getProductById,
    deleteProduct,
    updateProduct
}