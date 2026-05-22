const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    return { success: true, data: user };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.readUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return { success: false, data: 'User not found' };
    }
    return { success: true, data: user };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) {
      return { success: false, data: 'User not found' };
    }
    return { success: true, data: user };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    return { success: true, data: 'User deleted successfully' };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return { success: true, data: users };
  } catch (error) {
    return { success: false, data: error.message };
  }
};