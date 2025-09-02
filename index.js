const express = require('express');
const cors = require('cors');
const Database = require('./database');
const CustomerRoutes = require('./routes/customers');
const AddressRoutes = require('./routes/addresses');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database and routes
const database = new Database();

database.connect()
  .then((db) => {
    // Initialize route handlers
    const customerRoutes = new CustomerRoutes(db);
    const addressRoutes = new AddressRoutes(db);

    // Mount routes
    app.use('/api/customers', customerRoutes.getRoutes());
    app.use('/api', addressRoutes.getRoutes());

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ message: 'Server is running successfully' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  database.close();
  process.exit(0);
});