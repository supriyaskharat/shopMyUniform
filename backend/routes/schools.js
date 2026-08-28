// routes/schools.js
// Returns the list of schools available on the platform.
// Used in the Profile page for school selection dropdown.

const express = require('express');
const School = require('../models/School');

const router = express.Router();

// GET /api/schools — Get all schools
router.get('/', async (req, res) => {
  try {
    const schools = await School.find().sort({ name: 1 });
    res.json({ success: true, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/schools/:id — Get a single school by ID
router.get('/:id', async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
