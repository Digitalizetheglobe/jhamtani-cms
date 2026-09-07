const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByCountry,
  getEventsByMonth,
} = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/country/:country', getEventsByCountry);
router.get('/month/:month', getEventsByMonth);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
