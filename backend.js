const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');  // For interacting with external APIs/models

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));  // Logs all requests to the console

// Rate Limiting (Prevent abuse)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10,  // limit each IP to 10 requests per windowMs
    message: 'Too many requests, please try again later.'
});

app.use(limiter);

// AI Model Switching Logic
const models = {
    gpt: {
        endpoint: 'https://api.openai.com/v1/gpt', // Example endpoint
        apiKey: process.env.GPT_API_KEY
    },
    stable_diffusion: {
        endpoint: 'https://api.stablediffusion.com/generate', // Example endpoint
        apiKey: process.env.STABLE_DIFFUSION_API_KEY
    },
    dalle: {
        endpoint: 'https://api.dalle.com/generate', // Example endpoint
        apiKey: process.env.DALLE_API_KEY
    }
};

// Helper function to call model APIs
async function callModelAPI(model, prompt) {
    const { endpoint, apiKey } = models[model];

    try {
        const response = await axios.post(endpoint, { prompt }, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error calling ${model} API:`, error.message);
        throw new Error('Failed to process your request. Please try again.');
    }
}

// Validate input data
function validateInput(req, res, next) {
    const { prompt, model } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'Invalid prompt. Prompt must be a non-empty string.' });
    }

    if (!models[model]) {
        return res.status(400).json({ error: 'Invalid model. Please select a valid model.' });
    }

    next();
}

// Generate Text Endpoint
app.post('/generate_text', validateInput, async (req, res) => {
    const { prompt, model } = req.body;

    try {
        const modelResponse = await callModelAPI(model, prompt);

        // Example structure for GPT response
        if (model === 'gpt') {
            res.json({ response: modelResponse.choices[0].text });
        } else {
            res.status(400).json({ error: 'Text generation is only supported for GPT model.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Image Endpoint
app.post('/generate_image', validateInput, async (req, res) => {
    const { prompt, model } = req.body;

    try {
        const modelResponse = await callModelAPI(model, prompt);

        // Example structure for image model responses
        if (model === 'stable_diffusion' || model === 'dalle') {
            res.json({ image_url: modelResponse.image_url });
        } else {
            res.status(400).json({ error: 'Image generation is only supported for Stable Diffusion and DALL·E models.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware for unhandled routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
