const mongoose = require('mongoose');
const SubSchema = new mongoose.Schema({ userId: String, plan: String, status: String, expiry: Date });
module.exports = mongoose.model('Subscription', SubSchema);