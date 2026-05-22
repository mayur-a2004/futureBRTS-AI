const Wishlist = require('../models/Auth');

exports.createWishlist = async (req, res) => {
  try {
    const wishlist = new Wishlist(req.body);
    const savedWishlist = await wishlist.save();
    return { success: true, data: savedWishlist };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find().populate('userId');
    return { success: true, data: wishlist };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.getWishlistById = async (req, res) => {
  try {
    const id = req.params.id;
    const wishlist = await Wishlist.findById(id).populate('userId');
    if (!wishlist) {
      return { success: false, data: 'Wishlist not found' };
    }
    return { success: true, data: wishlist };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.updateWishlist = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedWishlist = await Wishlist.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedWishlist) {
      return { success: false, data: 'Wishlist not found' };
    }
    return { success: true, data: updatedWishlist };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.deleteWishlist = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedWishlist = await Wishlist.findByIdAndDelete(id);
    if (!deletedWishlist) {
      return { success: false, data: 'Wishlist not found' };
    }
    return { success: true, data: 'Wishlist deleted successfully' };
  } catch (error) {
    return { success: false, data: error.message };
  }
};