const express = require('express');
const router = express.Router();
const {
  getMediaPublications,
  getMediaPublicationById,
  createMediaPublication,
  updateMediaPublication,
  deleteMediaPublication,
  toggleMediaPublicationStatus,
} = require('../controllers/mediaPublicationController');

router.get('/', getMediaPublications);
router.get('/:id', getMediaPublicationById);
router.post('/', createMediaPublication);
router.put('/:id', updateMediaPublication);
router.delete('/:id', deleteMediaPublication);
router.patch('/:id/toggle-status', toggleMediaPublicationStatus);

module.exports = router;
