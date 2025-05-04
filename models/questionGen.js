const { pipeline } = require('transformers');
const fs = require('fs');
const path = require('path');

let generator;

async function loadModel() {
  if (!generator) {
    const modelPath = path.join(__dirname, '../../models/flan-t5');
    generator = await pipeline('text2text-generation', modelPath);
  }
}

async function generateQuestionsFromText(inputText, numQuestions = 5, type = 'mcq', taxonomyLevel = '') {
  await loadModel();

  const prompt = `Generate ${numQuestions} ${type === 'mcq' ? 'multiple-choice' : taxonomyLevel} questions from this content:\n\n${inputText}`;

  const result = await generator(prompt, {
    max_length: 512,
    num_return_sequences: 1,
  });

  return result[0]?.generated_text || 'No questions generated';
}

module.exports = { generateQuestionsFromText };
