const express = require('express');
const router = express.Router();
const {
  getGalleryCategories,
  getGalleryPhotos,
  getGalleryPhotoById,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  toggleGalleryPhotoStatus,
  uploadFestivalPhoto,
  uploadExhibitionPhoto,
  uploadOutingPhoto,
  uploadHappyClientPhoto,
  getFestivalPhotos,
  getExhibitionPhotos,
  getOutingPhotos,
  getHappyClientPhotos,
} = require('../controllers/galleryPhotoController');

router.get('/', getGalleryPhotos);
router.get('/categories', getGalleryCategories);
router.get('/festivals', getFestivalPhotos);
router.get('/exhibitions', getExhibitionPhotos);
router.get('/outings', getOutingPhotos);
router.get('/happy-clients', getHappyClientPhotos);
router.post('/festivals', uploadFestivalPhoto);
router.post('/exhibitions', uploadExhibitionPhoto);
router.post('/outings', uploadOutingPhoto);
router.post('/happy-clients', uploadHappyClientPhoto);
router.get('/:id', getGalleryPhotoById);
router.post('/', createGalleryPhoto);
router.put('/:id', updateGalleryPhoto);
router.delete('/:id', deleteGalleryPhoto);
router.patch('/:id/toggle-status', toggleGalleryPhotoStatus);

module.exports = router;
