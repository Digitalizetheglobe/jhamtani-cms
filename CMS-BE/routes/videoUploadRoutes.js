const express = require('express');
const router = express.Router();
const {
  getVideoUploads,
  getVideoUploadById,
  createVideoUpload,
  updateVideoUpload,
  deleteVideoUpload,
  toggleVideoUploadStatus,
  toggleVideoUploadPublic,
} = require('../controllers/videoUploadController');

router.get('/', getVideoUploads);
router.get('/:id', getVideoUploadById);
router.post('/', createVideoUpload);
router.put('/:id', updateVideoUpload);
router.delete('/:id', deleteVideoUpload);
router.patch('/:id/toggle-status', toggleVideoUploadStatus);
router.patch('/:id/toggle-public', toggleVideoUploadPublic);

module.exports = router;
