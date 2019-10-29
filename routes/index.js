const express = require('express');
const router = express.Router();

// Landing Page
router.get('/', (req, res) => {
  res.render('landing', { layout: false });
});

// Full list Page
router.get('/fulllist', (req, res) => {
  res.render('fulllist', { layout: false });
});

module.exports = router;
