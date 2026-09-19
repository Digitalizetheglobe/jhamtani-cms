const express = require('express');
const router = express.Router();
const {
  getCareerJobs,
  getCareerJobById,
  createCareerJob,
  updateCareerJob,
  deleteCareerJob,
} = require('../controllers/careerJobController');

router.get('/', getCareerJobs);
router.get('/:id', getCareerJobById);
router.post('/', createCareerJob);
router.put('/:id', updateCareerJob);
router.delete('/:id', deleteCareerJob);

module.exports = router;
