const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { generateQuestionsFromText } = require('../models/questionGen');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Extract content from file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = path.join(__dirname, '../../', file.path);
    const ext = path.extname(file.originalname).toLowerCase();
    let text = '';

    if (ext === '.txt') {
      text = fs.readFileSync(filePath, 'utf8');
    } else if (ext === '.pdf') {
      const data = await pdfParse(fs.readFileSync(filePath));
      text = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ content: text });

  } catch (err) {
    console.error('File read error:', err);
    res.status(500).json({ error: 'Failed to extract text from file' });
  }
});

// Generate using local model
router.post('/generate', async (req, res) => {
  const { inputText, numQuestions, type, taxonomyLevel } = req.body;

  try {
    const questions = await generateQuestionsFromText(inputText, numQuestions, type, taxonomyLevel);
    res.status(200).json({ questions });
  } catch (err) {
    console.error('Model inference error:', err);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

module.exports = router;
