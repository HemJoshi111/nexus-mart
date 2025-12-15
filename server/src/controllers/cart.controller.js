import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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

// @desc    Get logged in user's cart
// @route   GET /api/v1/cart
// @access  Private
const getUserCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ owner: req.user._id }).populate("items.productId");

    if (!cart) {
        // If user has no cart, creating an empty one)
        // or just return empty structure
        cart = await Cart.create({ owner: req.user._id, items: [] });
    }

    // Calculate Cart Total logic
    let cartTotal = 0;

    // Filter out items where product might have been deleted from DB
    cart.items = cart.items.filter(item => item.productId);

    cart.items.forEach(item => {
        cartTotal += item.quantity * item.productId.price;
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { ...cart.toObject(), cartTotal }, "Cart fetched successfully"));
});

// @desc    Remove specific item from cart
// @route   DELETE /api/v1/cart/item/:productId
// @access  Private
const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ owner: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    // Filter out the item to remove it
    cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
    );

    await cart.save();

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Item removed from cart"));
});

// @desc    Clear all items from cart
// @route   DELETE /api/v1/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ owner: req.user._id });

    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = [];
    await cart.save();

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

export {
    addItemToCart,
    getUserCart,
    removeItemFromCart,
    clearCart
}