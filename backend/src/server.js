const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { testConnection } = require('./config/elasticsearch');

dotenv.config();
const app = express();

app.use(cors());

app.use(express.json());

connectDB();

// Test Elasticsearch connection
testConnection();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/home', require('./routes/home'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/search', require('./routes/search'));

app.get('/', (req, res) => res.send('Fullstack demo backend is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
