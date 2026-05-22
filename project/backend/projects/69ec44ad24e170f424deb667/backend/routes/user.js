const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/users', (req, res) => {
  /* 
  const users = await UserController.getAllUsers();
  res.json(users);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.get('/user/:id', (req, res) => {
  /* 
  const id = req.params.id;
  const user = await UserController.getUserById(id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.post('/user', (req, res) => {
  /* 
  const { name, email, password, role } = req.body;
  const user = await UserController.createUser(name, email, password, role);
  res.json(user);
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.put('/user/:id', (req, res) => {
  /* 
  const id = req.params.id;
  const { name, email, password, role } = req.body;
  const user = await UserController.updateUser(id, name, email, password, role);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

router.delete('/user/:id', (req, res) => {
  /* 
  const id = req.params.id;
  const user = await UserController.deleteUser(id);
  if (user) {
    res.json({ success: true, message: "User deleted successfully" });
  } else {
    res.status(404).json({ success: false, message: "User not found" });
  }
  */
  res.json({ success: true, message: "PROTOTYPE_MODE_ACTIVE" });
});

module.exports = router;