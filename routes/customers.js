const express = require('express');
const router = express.Router();

class CustomerRoutes {
  constructor(db) {
    this.db = db;
  }

  // GET all customers with search, filtering, and pagination
  getAllCustomers = (req, res) => {
    const { page = 1, limit = 10, search = '', city = '' } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT DISTINCT c.*, COUNT(a.id) as address_count 
      FROM customers c 
      LEFT JOIN addresses a ON c.id = a.customer_id
    `;
    
    let countSql = `SELECT COUNT(DISTINCT c.id) as total FROM customers c LEFT JOIN addresses a ON c.id = a.customer_id`;
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push(`(c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone_number LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (city) {
      conditions.push(`a.city LIKE ?`);
      params.push(`%${city}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      sql += whereClause;
      countSql += whereClause;
    }

    sql += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Get total count for pagination
    this.db.get(countSql, params.slice(0, -2), (err, countResult) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Get customers
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        res.json({
          message: 'success',
          data: rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.total,
            totalPages: Math.ceil(countResult.total / limit)
          }
        });
      });
    });
  };

  // GET single customer
  getCustomer = (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM customers WHERE id = ?`;

    this.db.get(sql, [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json({ message: 'success', data: row });
    });
  };

  // POST create new customer
  createCustomer = (req, res) => {
    const { first_name, last_name, phone_number } = req.body;

    // Validation
    if (!first_name || !last_name || !phone_number) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const sql = `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`;

    this.db.run(sql, [first_name, last_name, phone_number], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'Phone number already exists' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      res.json({
        message: 'Customer created successfully',
        data: { id: this.lastID, first_name, last_name, phone_number }
      });
    });
  };

  // PUT update customer
  updateCustomer = (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number } = req.body;

    if (!first_name || !last_name || !phone_number) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const sql = `UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`;

    this.db.run(sql, [first_name, last_name, phone_number, id], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'Phone number already exists' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json({ message: 'Customer updated successfully' });
    });
  };

  // DELETE customer
  deleteCustomer = (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM customers WHERE id = ?`;

    this.db.run(sql, [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json({ message: 'Customer deleted successfully' });
    });
  };

  getRoutes() {
    router.get('/', this.getAllCustomers);
    router.get('/:id', this.getCustomer);
    router.post('/', this.createCustomer);
    router.put('/:id', this.updateCustomer);
    router.delete('/:id', this.deleteCustomer);
    return router;
  }
}

module.exports = CustomerRoutes;