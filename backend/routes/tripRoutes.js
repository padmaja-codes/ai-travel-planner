const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay
} = require('../controllers/tripController');

router.post('/generate', auth, generateTrip);
router.get('/', auth, getUserTrips);
router.get('/:id', auth, getTripById);
router.put('/:id', auth, updateTrip);
router.delete('/:id', auth, deleteTrip);
router.post('/:id/regenerate-day', auth, regenerateDay);

module.exports = router;
