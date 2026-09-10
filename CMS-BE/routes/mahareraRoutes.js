const express = require('express');
const router = express.Router();
const {
  getMahareras,
  getMahareraById,
  createMaharera,
  updateMaharera,
  deleteMaharera,
  toggleMahareraStatus,
} = require('../controllers/mahareraController');

router.get('/', getMahareras);
router.get('/:id', getMahareraById);
router.post('/', createMaharera);
router.put('/:id', updateMaharera);
router.delete('/:id', deleteMaharera);
router.patch('/:id/toggle-status', toggleMahareraStatus);

module.exports = router;
