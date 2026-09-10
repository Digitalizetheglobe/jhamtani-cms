const express = require('express');
const router = express.Router();
const {
  getNewsletters,
  getNewsletterById,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  toggleNewsletterStatus,
} = require('../controllers/newsletterController');

router.get('/', getNewsletters);
router.get('/:id', getNewsletterById);
router.post('/', createNewsletter);
router.put('/:id', updateNewsletter);
router.delete('/:id', deleteNewsletter);
router.patch('/:id/toggle-status', toggleNewsletterStatus);

module.exports = router;
