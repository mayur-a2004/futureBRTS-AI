const Product = require('../models/Product');

class ProductController {
  async createProduct(req, res) {
    try {
      const product = new Product(req.body);
      const savedProduct = await product.save();
      return { success: true, data: savedProduct };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      return { success: true, data: products };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async getProductById(req, res) {
    try {
      const id = req.params.id;
      const product = await Product.findById(id);
      if (!product) {
        return { success: false, data: 'Product not found' };
      }
      return { success: true, data: product };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async updateProduct(req, res) {
    try {
      const id = req.params.id;
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedProduct) {
        return { success: false, data: 'Product not found' };
      }
      return { success: true, data: updatedProduct };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }

  async deleteProduct(req, res) {
    try {
      const id = req.params.id;
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) {
        return { success: false, data: 'Product not found' };
      }
      return { success: true, data: 'Product deleted successfully' };
    } catch (error) {
      return { success: false, data: error.message };
    }
  }
}

module.exports = ProductController;