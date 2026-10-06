const Issue = require('../models/Issue');
const { calculatePriorityScore, determinePriorityLevel } = require('../utils/priorityScoring');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = async (req, res) => {
  try {
    const { title, category, description, severity, latitude, longitude, address } = req.body;
    
    // Convert lat/lng to GeoJSON coordinates (lng, lat)
    const coordinates = [parseFloat(longitude), parseFloat(latitude)];

    // Check for duplicates (same category within ~100 meters)
    // 100 meters in radians = 100 / 6378137 (Earth radius in meters)
    const duplicate = await Issue.findOne({
      category,
      status: { $ne: 'Resolved' },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: 100 // meters
        }
      }
    });

    if (duplicate) {
      return res.status(409).json({
        message: 'A similar issue already exists nearby.',
        duplicateId: duplicate._id
      });
    }

    const photos = req.file ? [`/uploads/${req.file.filename}`] : [];

    const issue = new Issue({
      title,
      category,
      description,
      severity,
      location: {
        type: 'Point',
        coordinates
      },
      address,
      photos,
      reporter: req.user.id
    });

    // Calculate initial priority
    issue.priorityScore = calculatePriorityScore(issue);
    issue.priorityLevel = determinePriorityLevel(issue.priorityScore);

    const createdIssue = await issue.save();
    res.status(201).json(createdIssue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all issues (with filtering)
// @route   GET /api/issues
// @access  Public
const getIssues = async (req, res) => {
  try {
    const { category, status, severity, myReports } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (myReports && req.user) query.reporter = req.user.id;

    // Optional: Geo query if lat, lng, radius provided
    if (req.query.lat && req.query.lng && req.query.radius) {
       query.location = {
         $near: {
           $geometry: {
              type: "Point" ,
              coordinates: [ parseFloat(req.query.lng) , parseFloat(req.query.lat) ]
           },
           $maxDistance: parseInt(req.query.radius)
         }
       };
    }

    // Recalculate priority scores dynamically or just rely on stored ones.
    // For performance, we rely on stored ones, updated on upvotes/status changes or via a cron job.
    
    const issues = await Issue.find(query)
      .populate('reporter', 'name')
      .populate('assignee', 'name')
      .sort({ priorityScore: -1, createdAt: -1 });
      
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get issue by ID
// @route   GET /api/issues/:id
// @access  Public
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('assignee', 'name department');
      
    if (issue) {
      res.status(200).json(issue);
    } else {
      res.status(404).json({ message: 'Issue not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update issue status
// @route   PATCH /api/issues/:id/status
// @access  Private (Officer/Admin)
const updateIssueStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = status;
    if (resolutionNotes) issue.resolutionNotes = resolutionNotes;
    if (req.file) issue.resolutionPhoto = `/uploads/${req.file.filename}`;
    
    // Assign to current officer if not assigned
    if (!issue.assignee) {
        issue.assignee = req.user.id;
    }

    const updatedIssue = await issue.save();
    res.status(200).json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upvote an issue
// @route   PATCH /api/issues/:id/upvote
// @access  Private
const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user already upvoted
    const alreadyUpvoted = issue.upvotes.includes(req.user.id);

    if (alreadyUpvoted) {
      // Remove upvote
      issue.upvotes = issue.upvotes.filter((id) => id.toString() !== req.user.id.toString());
    } else {
      // Add upvote
      issue.upvotes.push(req.user.id);
    }

    // Recalculate priority
    issue.priorityScore = calculatePriorityScore(issue);
    issue.priorityLevel = determinePriorityLevel(issue.priorityScore);

    await issue.save();
    res.status(200).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  upvoteIssue
};
