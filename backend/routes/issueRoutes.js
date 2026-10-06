const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  upvoteIssue
} = require('../controllers/issueController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
  .get(getIssues)
  .post(protect, upload.single('photo'), createIssue);

router.route('/:id')
  .get(getIssueById);

router.route('/:id/status')
  .patch(protect, authorize('Officer', 'Admin'), upload.single('resolutionPhoto'), updateIssueStatus);

router.route('/:id/upvote')
  .patch(protect, upvoteIssue);

module.exports = router;
