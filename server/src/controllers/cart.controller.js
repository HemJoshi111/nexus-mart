import { Cart } from "../models/category.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js"

// @desc    Add item to cart or update quantity if it exists
// @route   POST /api/v1/cart
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    // 1. Verify Product Validity
    // Check if product actually exists & has stock)
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.stock < quantity) {
        throw new ApiError(400, "Product is out of stock");
    }

    // 2. Find the User's Cart
    let cart = await Cart.findOne({ owner: req.user._id });

    // 3. If No Cart, Create New One
    if (!cart) {
        cart = await Cart.create({
            owner: req.user._id,
            items: [{ productId, quantity }]
        });
    } else {
        // 4. Cart Exists: Check if item is already in cart
        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        // findIndex returns index of first item, that satisfy the condition
        // if no any item satisfy the condition, returns -1.
        if (itemIndex > -1) {
            // PRODUCT EXISTS: Update quantity
            cart.items[itemIndex].quantity = quantity; // Or += quantity depending on UI logic
        } else {
            // PRODUCT IS NEW: Push to array
            cart.items.push({ productId, quantity });
        }

        await cart.save();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Item added to cart"));
});

// @desc Get logged in user's cart items
// @route GET /api/v1/cart
// @access Private

export {
    addItemToCart,
    getUserCart,

}