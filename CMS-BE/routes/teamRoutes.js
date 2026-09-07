const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllTeamMembers,
  getActiveTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleActiveStatus,
} = require('../controllers/teamController');

const uploadDir = path.join(__dirname, '../uploads/team');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, `team-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

router.get('/', getAllTeamMembers);
router.get('/active', getActiveTeamMembers);
router.get('/:id', getTeamMemberById);
router.post('/', upload.single('photo'), createTeamMember);
router.put('/:id', upload.single('photo'), updateTeamMember);
router.delete('/:id', deleteTeamMember);
router.patch('/:id/toggle-status', toggleActiveStatus);

module.exports = router;
