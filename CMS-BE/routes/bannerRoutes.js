const express = require('express');
const router = express.Router();
const {
  uploadBannerFiles,
  getBanners,
  getBannerById,
  getBannerByPlacement,
  getAllPublicBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} = require('../controllers/bannerController');

router.get('/', getBanners);
router.get('/public/all', getAllPublicBanners);
router.get('/placement/:placement', getBannerByPlacement);
router.get('/:id', getBannerById);
router.post('/', uploadBannerFiles, createBanner);
router.put('/:id', uploadBannerFiles, updateBanner);
router.delete('/:id', deleteBanner);
router.patch('/:id/toggle-status', toggleBannerStatus);

module.exports = router;
