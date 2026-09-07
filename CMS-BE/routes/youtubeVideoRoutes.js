const express = require('express');
const router = express.Router();
const {
  getAllYouTubeVideos,
  getActiveYouTubeVideos,
  getYouTubeVideoById,
  createYouTubeVideo,
  updateYouTubeVideo,
  deleteYouTubeVideo,
  toggleActiveStatus,
} = require('../controllers/youtubeVideoController');

router.get('/', getAllYouTubeVideos);
router.get('/active', getActiveYouTubeVideos);
router.get('/:id', getYouTubeVideoById);
router.post('/', createYouTubeVideo);
router.put('/:id', updateYouTubeVideo);
router.delete('/:id', deleteYouTubeVideo);
router.patch('/:id/toggle-status', toggleActiveStatus);

module.exports = router;
