const express = require('express');
const router = express.Router();

class AddressRoutes {
  constructor(db) {
    this.db = db;
  }

  // GET all addresses for a customer
  getCustomerAddresses = (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT a.*, c.first_name, c.last_name 
      FROM addresses a 
      JOIN customers c ON a.customer_id = c.id 
      WHERE a.customer_id = ? 
      ORDER BY a.created_at DESC
    `;

    this.db.all(sql, [id], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'success', data: rows });
    });
  };

  // POST create new address
  createAddress = (req, res) => {
    const { id } = req.params;
    const { address_details, city, state, pin_code } = req.body;

    // Validation
    if (!address_details || !city || !state || !pin_code) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // First check if customer exists
    this.db.get('SELECT id FROM customers WHERE id = ?', [id], (err, customer) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }

      const sql = `INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`;

      this.db.run(sql, [id, address_details, city, state, pin_code], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          message: 'Address created successfully',
          data: { id: this.lastID, customer_id: id, address_details, city, state, pin_code }
        });
      });
    });
  };

  // PUT update address
  updateAddress = (req, res) => {
    const { addressId } = req.params;
    const { address_details, city, state, pin_code } = req.body;

    if (!address_details || !city || !state || !pin_code) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const sql = `UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?`;

    this.db.run(sql, [address_details, city, state, pin_code, addressId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Address not found' });
        return;
      }
      res.json({ message: 'Address updated successfully' });
    });
  };

  // DELETE address
  deleteAddress = (req, res) => {
    const { addressId } = req.params;
    const sql = `DELETE FROM addresses WHERE id = ?`;

    this.db.run(sql, [addressId], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Address not found' });
        return;
      }
      res.json({ message: 'Address deleted successfully' });
    });
  };

  // GET single address
  getAddress = (req, res) => {
    const { addressId } = req.params;
    const sql = `
      SELECT a.*, c.first_name, c.last_name 
      FROM addresses a 
      JOIN customers c ON a.customer_id = c.id 
      WHERE a.id = ?
    `;

    this.db.get(sql, [addressId], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Address not found' });
        return;
      }
      res.json({ message: 'success', data: row });
    });
  };

  getRoutes() {
    // Customer addresses routes
    router.get('/customers/:id/addresses', this.getCustomerAddresses);
    router.post('/customers/:id/addresses', this.createAddress);
    
    // Individual address routes
    router.get('/addresses/:addressId', this.getAddress);
    router.put('/addresses/:addressId', this.updateAddress);
    router.delete('/addresses/:addressId', this.deleteAddress);
    
    return router;
  }
}

module.exports = AddressRoutes;