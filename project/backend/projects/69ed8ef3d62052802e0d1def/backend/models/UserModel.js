/* 
   UI PROTOTYPE MODE: BACKEND LOGIC PRESERVED AS DOCUMENTATION
   -----------------------------------------------------------
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const bcrypt = require('bcrypt');

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
*/
*/