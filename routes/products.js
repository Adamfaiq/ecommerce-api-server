const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// Create Product
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { name, description, price, category, brand, stock } = req.body;

      const imageUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }

      const product = await Product.create({
        name,
        description,
        price,
        category,
        brand,
        stock,
        images: imageUrls,
      });

      res.status(201).json({ success: true, product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

// Get All Product
router.get("/", async (req, res) => {
  try {
    const { search, category, brand, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (brand) {
      filter.brand = brand;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get product single id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product single id adminOnly
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product adminOnly
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
