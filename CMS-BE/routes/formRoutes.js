const express = require('express');
const router = express.Router();
const {
  createForm,
  getAllForms,
  getFormById,
  getFormByPage,
  updateForm,
  deleteForm,
  submitForm,
  getFormSubmissions,
  getSubmissionById,
  deleteSubmission,
} = require('../controllers/formController');

router.get('/forms', getAllForms);
router.post('/forms', createForm);
router.get('/forms/:id', getFormById);
router.put('/forms/:id', updateForm);
router.delete('/forms/:id', deleteForm);
router.post('/forms/:formId/submit', submitForm);
router.get('/forms/:formId/submissions', getFormSubmissions);

router.get('/page/:page', getFormByPage);
router.get('/submissions/:id', getSubmissionById);
router.delete('/submissions/:id', deleteSubmission);

module.exports = router;
