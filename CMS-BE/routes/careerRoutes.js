const express = require('express');
const router = express.Router();
const {
  getCareerApplications,
  getCareerApplicationById,
  createCareerApplication,
  updateCareerApplication,
  deleteCareerApplication,
  updateCareerApplicationStatus,
} = require('../controllers/careerController');

router.get('/', getCareerApplications);
router.get('/:id', getCareerApplicationById);
router.post('/', createCareerApplication);
router.put('/:id', updateCareerApplication);
router.delete('/:id', deleteCareerApplication);
router.patch('/:id/status', updateCareerApplicationStatus);

module.exports = router;
