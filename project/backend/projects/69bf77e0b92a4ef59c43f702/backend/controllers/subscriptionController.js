const Sub = require('../models/Subscription');
exports.status = async (req,res) => res.json(await Sub.findOne({ userId: req.user.id }));