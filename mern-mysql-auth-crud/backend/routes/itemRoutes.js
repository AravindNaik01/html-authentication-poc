const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getStats,
} = require('../controllers/itemController');

// All routes are protected
router.use(auth);

router.get('/stats', getStats);    // GET /api/stats
router.get('/', getItems);         // GET /api/items
router.get('/:id', getItem);      // GET /api/items/:id
router.post('/', createItem);      // POST /api/items
router.put('/:id', updateItem);    // PUT /api/items/:id
router.delete('/:id', deleteItem); // DELETE /api/items/:id

module.exports = router;
