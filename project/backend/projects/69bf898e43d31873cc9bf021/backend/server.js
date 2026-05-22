// Industrial Scaffold
const express = require('express');
const app = express();
app.get('/', (req,res) => res.send('Active'));
app.listen(5000);