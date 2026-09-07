const express = require('express');
const router = express.Router();
const {
  createEmailTemplate,
  getAllEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
} = require('../controllers/emailTemplateController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllEmailTemplates);
router.get('/:id', getEmailTemplateById);
router.post('/', protect, createEmailTemplate);
router.put('/:id', protect, updateEmailTemplate);
router.delete('/:id', protect, deleteEmailTemplate);

module.exports = router;
