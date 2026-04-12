const db = require('../config/db');

// ─── GET /api/items ───────────────────────────────────────────────────────────
exports.getItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({ success: true, count: rows.length, items: rows });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/items/:id ───────────────────────────────────────────────────────
exports.getItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const [rows] = await db.query(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    res.json({ success: true, item: rows[0] });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/items ──────────────────────────────────────────────────────────
exports.createItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const validStatuses = ['active', 'pending', 'completed'];
    const itemStatus = validStatuses.includes(status) ? status : 'active';

    const [result] = await db.query(
      'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [userId, title.trim(), description || null, itemStatus]
    );

    // Fetch the newly created item
    const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Item created successfully.',
      item: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/items/:id ───────────────────────────────────────────────────────
exports.updateItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const { title, description, status } = req.body;

    // Verify ownership (parameterized query)
    const [existing] = await db.query(
      'SELECT id FROM items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const validStatuses = ['active', 'pending', 'completed'];
    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty.' });
      }
      updates.push('title = ?');
      values.push(title.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    values.push(itemId, userId);

    await db.query(
      `UPDATE items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    // Fetch updated item
    const [rows] = await db.query('SELECT * FROM items WHERE id = ?', [itemId]);

    res.json({
      success: true,
      message: 'Item updated successfully.',
      item: rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/items/:id ────────────────────────────────────────────────────
exports.deleteItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;

    const [result] = await db.query(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/stats ───────────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'active') AS active,
        SUM(status = 'pending') AS pending,
        SUM(status = 'completed') AS completed
      FROM items
      WHERE user_id = ?`,
      [userId]
    );

    const stats = rows[0];

    res.json({
      success: true,
      stats: {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        pending: parseInt(stats.pending) || 0,
        completed: parseInt(stats.completed) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
