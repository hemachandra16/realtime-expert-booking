const express = require('express');
const router = express.Router();
const { getExperts, getExpertById, getSimilarExperts } = require('../controllers/expertController');

// GET /api/experts - List with pagination, search, filter
router.get('/', getExperts);

// GET /api/experts/:id - Expert detail with slots
router.get('/:id', getExpertById);

// GET /api/experts/:id/similar - Similar experts
router.get('/:id/similar', getSimilarExperts);

module.exports = router;
