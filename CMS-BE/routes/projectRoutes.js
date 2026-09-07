const express = require('express');
const router = express.Router();
const {
  uploadProjectImage,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectStatus,
} = require('../controllers/projectController');

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', uploadProjectImage, createProject);
router.put('/:id', uploadProjectImage, updateProject);
router.delete('/:id', deleteProject);
router.patch('/:id/toggle-status', toggleProjectStatus);

module.exports = router;
