const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();


const accountRoutes = require('./routes/accounts');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/accounts', accountRoutes);

app.listen(PORT, () => {
    console.log(`Server running smoothly on http://localhost:${PORT}`);
});