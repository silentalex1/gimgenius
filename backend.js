const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 5000;const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: 'Too many requests, please try again later.'
});

app.use(limiter);

const models = {
    gpt: {
        endpoint: 'https://api.openai.com/v1/gpt',
        apiKey: process.env.GPT_API_KEY
    },
    stable_diffusion: {
        endpoint: 'https://api.stablediffusion.com/generate',
        apiKey: process.env.STABLE_DIFFUSION_API_KEY
    },
    dalle: {
        endpoint: 'https://api.dalle.com/generate',
        apiKey: process.env.DALLE_API_KEY
    },
    nex_network_ai: {
        // No external endpoint for custom AI bot; it will be a local function
    }
};

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

// Custom AI bot logic
function nexNetworkAI(prompt) {
    // Simulated fast response for the custom AI bot
    return new Promise((resolve) => {
        const response = `Nex Network AI says: ${prompt}`;
        resolve({ response });
    });
}

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

app.post('/generate_text', validateInput, async (req, res) => {
    const { prompt, model } = req.body;

    try {
        if (model === 'nex_network_ai') {
            const modelResponse = await nexNetworkAI(prompt);
            res.json(modelResponse);
        } else {
            const modelResponse = await callModelAPI(model, prompt);
            res.json({ response: modelResponse.choices[0].text });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/generate_image', validateInput, async (req, res) => {
    const { prompt, model } = req.body;

    try {
        const modelResponse = await callModelAPI(model, prompt);

        if (model === 'stable_diffusion' || model === 'dalle') {
            res.json({ image_url: modelResponse.image_url });
        } else {
            res.status(400).json({ error: 'Image generation is only supported for Stable Diffusion and DALL·E models.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10,
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Cache Setup (Cache for custom AI responses)
const cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes

// AI Models
const models = {
    gpt: {
        endpoint: 'https://api.openai.com/v1/gpt',
        apiKey: process.env.GPT_API_KEY
    },
    stable_diffusion: {
        endpoint: 'https://api.stablediffusion.com/generate',
        apiKey: process.env.STABLE_DIFFUSION_API_KEY
    },
    dalle: {
        endpoint: 'https://api.dalle.com/generate',
        apiKey: process.env.DALLE_API_KEY
    },
    nex_network_ai: {
        name: 'Nex Network AI'
    }
};

// Custom AI Logic for "Nex Network AI"
function nexNetworkAIResponse(prompt) {
    // Simple response logic to simulate AI interaction (you can replace with more advanced logic)
    if (prompt.toLowerCase().includes('hello')) {
        return "Hello! I am Nex Network AI. How can I assist you today?";
    } else if (prompt.toLowerCase().includes('help')) {
        return "I can assist with various topics like gaming, development, and more. How can I help?";
    }
    return `You said: "${prompt}" - I'm Nex Network AI, always here to assist!`;
}

// Call Model API Function (Extended to include Nex Network AI)
async function callModelAPI(model, prompt) {
    if (model === 'nex_network_ai') {
        // Check the cache first for repeated queries
        const cachedResponse = cache.get(prompt);
        if (cachedResponse) {
            console.log("Serving from cache...");
            return { text: cachedResponse };
        }

        // Generate a custom AI response
        const response = nexNetworkAIResponse(prompt);
        cache.set(prompt, response); // Cache the response
        return { text: response };
    }

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

// Input Validation
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
        res.json({ response: modelResponse.text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling for unhandled routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
