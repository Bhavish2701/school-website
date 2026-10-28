const express = require('express');
const router = express.Router();
const { formatSuccess } = require('../../utils/apiResponse');

router.get('/documents', (req, res) => {
  res.json(formatSuccess([
    { id: 'doc-1', name: 'Transfer_Certificate_Template.pdf', category: 'Certificates', size: '1.2 MB' },
    { id: 'doc-2', name: 'Academic_Calendar_2026_27.pdf', category: 'Handbooks', size: '2.4 MB' },
    { id: 'doc-3', name: 'Fee_Receipt_Format.pdf', category: 'Finance', size: '450 KB' }
  ], 'Files retrieved'));
});

router.post('/upload', (req, res) => {
  res.status(201).json(formatSuccess({
    fileId: 'file-' + Date.now(),
    url: '/assets/uploads/' + (req.body.filename || 'uploaded_doc.pdf'),
    uploadedAt: new Date().toISOString()
  }, 'File uploaded successfully'));
});

module.exports = router;
