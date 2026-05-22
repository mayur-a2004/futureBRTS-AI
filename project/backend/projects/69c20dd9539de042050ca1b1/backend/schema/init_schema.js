// MongoDB Mongoose Schema mapping
const mongoose = require('mongoose');
const systemSchema = new mongoose.Schema({ title: String, metadata: mongoose.Schema.Types.Mixed }, { timestamps: true });
module.exports = mongoose.model('System', systemSchema);