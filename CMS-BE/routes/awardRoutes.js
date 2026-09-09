const express = require('express');
const router = express.Router();
const {
  getAwards,
  getAwardById,
  createAward,
  updateAward,
  deleteAward,
  toggleAwardStatus,
} = require('../controllers/awardController');

router.get('/', getAwards);
router.get('/:id', getAwardById);
router.post('/', createAward);
router.put('/:id', updateAward);
router.delete('/:id', deleteAward);
router.patch('/:id/toggle-status', toggleAwardStatus);

module.exports = router;
