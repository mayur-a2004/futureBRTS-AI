
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: '6982cdcb1c0c4ff3edda4eb4', email: 'mayur@gmail.com' }, 'future_brts_neural_master_key_2025', { expiresIn: '7d' });
console.log(token);
