const express = require('express');
const router = express.Router();
const {
  getBrochures,
  getBrochureById,
  createBrochure,
  updateBrochure,
  deleteBrochure,
  toggleBrochureStatus,
} = require('../controllers/brochureController');

router.get('/', getBrochures);
router.get('/:id', getBrochureById);
router.post('/', createBrochure);
router.put('/:id', updateBrochure);
router.delete('/:id', deleteBrochure);
router.patch('/:id/toggle-status', toggleBrochureStatus);

module.exports = router;
