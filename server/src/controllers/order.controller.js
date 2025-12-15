import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Place an order from the cart
// @route   POST /api/v1/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { address } = req.body;

    if (!address) {
        throw new ApiError(400, "Shipping address is required");
    }

    // 1. Get the User's Cart
    const cart = await Cart.findOne({ owner: req.user._id });

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    // 2. Validate Products, Check Stock, and Calculate Total
    // We fetch fresh product data to ensure price/stock accuracy
    let orderItems = [];
    let orderPrice = 0;

    // We prepare bulk write operations to update stock later
    const bulkStockUpdates = [];

    for (const item of cart.items) {
        const product = await Product.findById(item.productId);

        if (!product) {
            throw new ApiError(404, `Product not found (ID: ${item.productId})`);
        }

        if (product.stock < item.quantity) {
            throw new ApiError(400, `Product '${product.name}' is out of stock. Available: ${product.stock}`);
        }

        // We save the CURRENT price of the product
        orderItems.push({
            productId: product._id,
            quantity: item.quantity,
            price: product.price
        });

        orderPrice += product.price * item.quantity;

        // Prepare the stock reduction query
        bulkStockUpdates.push({
            updateOne: {
                filter: { _id: product._id },
                update: { $inc: { stock: -item.quantity } } // $inc -5 means decrease by 5
            }
        });
    }

    // 3. Create the Order
    const order = await Order.create({
        customer: req.user._id,
        orderItems,
        orderPrice,
        address,
        status: "PENDING"
    });

    // 4. Update Stock (Bulk Operation)
    if (bulkStockUpdates.length > 0) {
        await Product.bulkWrite(bulkStockUpdates);
    }

    // 5. Clear the Cart
    cart.items = [];
    await cart.save();

    return res
        .status(201)
        .json(new ApiResponse(201, order, "Order placed successfully"));
});

// @desc    Get logged in user's order history
// @route   GET /api/v1/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user._id })
        .sort({ createdAt: -1 }) // Newest first
        .populate("orderItems.productId", "name productImage"); // Show product names in history

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export {
    createOrder,
    getMyOrders
};