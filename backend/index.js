const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const getSubtitles = require('youtube-captions-scraper').getSubtitles;
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

async function getSubtitlesFromVideo(videoId) {
  try {
    // Try to get English subtitles
    const captions = await getSubtitles({
      videoID: videoId,
      lang: 'en'
    });

    if (!captions || captions.length === 0) {
      throw new Error('No English captions found');
    }

    // Convert captions array to text
    const subtitleText = captions
      .map(caption => caption.text)
      .join(' ');

    return subtitleText;
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    throw error;
  }
}

async function generateMCQs(subtitles) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  // Limit subtitles to ~100,000 characters to be safe
  const truncatedSubtitles = subtitles.length > 100000 
    ? subtitles.substring(0, 100000)
    : subtitles;

  const prompt = `You are a quiz generator. Create 10 multiple choice questions based on the following content. 
Each question should have one correct answer and three incorrect answers.
IMPORTANT: Respond ONLY with a JSON object, no markdown, no code blocks, just the raw JSON.
The JSON format should be exactly like this example, with no additional text:
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "correctIndex": 0
    }
  ]
}

Content to generate questions from: ${truncatedSubtitles}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const cleanJson = text.replace(/^\`\`\`json\s*/, '').replace(/\`\`\`\s*$/, '');
    
    try {
      return JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw Response:', text);
      console.error('Cleaned Response:', cleanJson);
      throw new Error('Failed to parse MCQ response');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

app.post('/api/generate-mcq', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log('Extracted Video ID:', videoId);

    try {
      const subtitleText = await getSubtitlesFromVideo(videoId);
      
      if (!subtitleText) {
        return res.status(404).json({ 
          error: 'No English captions found. Please ensure the video has either manual or auto-generated English captions enabled.'
        });
      }

      const mcqs = await generateMCQs(subtitleText);
      res.json(mcqs);
    } catch (subtitleError) {
      console.error('Subtitle extraction error:', subtitleError);
      res.status(404).json({ 
        error: 'Failed to extract captions. Please ensure the video exists and has English subtitles enabled (either manual or auto-generated).'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate MCQs. Please try again.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});