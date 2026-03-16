const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
