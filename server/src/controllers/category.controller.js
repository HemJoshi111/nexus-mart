import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private (Admin only - ideally)

const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
        throw new ApiError(409, "Category with this name already exists");
    }

    const category = await Category.create({
        name,
        owner: req.user._id // Track who created it
    });

    return res
        .status(201)
        .json(new ApiResponse(201, category, "Category created successfully"));
});


// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public

const getAllCategories = asyncHandler(async (req, res) => {
    // We use .find({}) to get everything. 
    // .select("-owner") because the public doesn't care who created "Electronics"
    const categories = await Category.find({}).select("-owner");

    return res
        .status(200)
        .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

// @desc    Update a category
// @route   PATCH /api/v1/categories/:categoryId
// @access  Private

const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "Category name is required");
    }

    // findByIdAndUpdate(id, update, options)
    const category = await Category.findByIdAndUpdate(
        categoryId,
        {
            $set: { name }
        },
        { new: true } // Return the updated document
    );
    console.log(category);

    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category updated successfully"));
});


// @desc    Delete a category
// @route   DELETE /api/v1/categories/:categoryId
// @access  Private

const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const category = await Category.findByIdAndDelete(categoryId);

    // category will contains deleted category details
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // TODO:we should also check if any Products belong to this category
    // before deleting it, otherwise those products become "orphaned".

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Category deleted successfully"));
});


export {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}