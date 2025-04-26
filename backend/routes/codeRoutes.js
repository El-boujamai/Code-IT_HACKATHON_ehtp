const express = require('express');
const codeController = require('../controllers/codeController');

const router = express.Router();

router.post('/visualize', (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    const visualization = codeController.processCodeForVisualization(code);
    res.status(200).json(visualization);
  } catch (error) {
    console.error('Error processing code:', error);
    res.status(500).json({ error: 'Failed to process code' });
  }
});

router.post('/save', codeController.saveVisualization);

module.exports = router;