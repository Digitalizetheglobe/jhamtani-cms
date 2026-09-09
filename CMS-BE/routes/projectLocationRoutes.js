const express = require('express');
const router = express.Router();
const {
  getProjectLocations,
  getProjectLocationById,
  createProjectLocation,
  updateProjectLocation,
  deleteProjectLocation,
  toggleProjectLocationStatus,
} = require('../controllers/projectLocationController');

router.get('/', getProjectLocations);
router.get('/:id', getProjectLocationById);
router.post('/', createProjectLocation);
router.put('/:id', updateProjectLocation);
router.delete('/:id', deleteProjectLocation);
router.patch('/:id/toggle-status', toggleProjectLocationStatus);

module.exports = router;
