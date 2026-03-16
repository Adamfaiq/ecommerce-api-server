const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { protect } = require("../middleware/auth");

// Semua cart routes kena login
router.use(protect);

// Get cart
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    if (!cart) {
      return res.json({ success: true, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add item to cart
router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove item from cart
router.delete("/:productId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId,
    );

    await cart.save();
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
