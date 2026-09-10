const express = require('express');
const router = express.Router();
const {
  getSiteUpdates,
  getSiteUpdateById,
  createSiteUpdate,
  updateSiteUpdate,
  deleteSiteUpdate,
  toggleSiteUpdateStatus,
} = require('../controllers/siteUpdateController');

router.get('/', getSiteUpdates);
router.get('/:id', getSiteUpdateById);
router.post('/', createSiteUpdate);
router.put('/:id', updateSiteUpdate);
router.delete('/:id', deleteSiteUpdate);
router.patch('/:id/toggle-status', toggleSiteUpdateStatus);

module.exports = router;
