const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); 

const app = express();
app.use(express.json());

const connectDB = require('./db/db');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '20mb' }));
// Connect to DB
connectDB();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'eventManagement.html'));
});

// Routes
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/', categoryRoutes);

const eventRoutes = require('./routes/eventRoutes');
app.use('/', eventRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
