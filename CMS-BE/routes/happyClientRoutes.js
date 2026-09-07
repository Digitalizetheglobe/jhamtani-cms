const express = require('express');
const router = express.Router();
const {
  getHappyClients,
  getHappyClientById,
  createHappyClient,
  updateHappyClient,
  deleteHappyClient,
  toggleHappyClientStatus,
  toggleHappyClientFeatured,
} = require('../controllers/happyClientController');

router.get('/', getHappyClients);
router.get('/:id', getHappyClientById);
router.post('/', createHappyClient);
router.put('/:id', updateHappyClient);
router.delete('/:id', deleteHappyClient);
router.patch('/:id/toggle-status', toggleHappyClientStatus);
router.patch('/:id/toggle-featured', toggleHappyClientFeatured);

module.exports = router;
