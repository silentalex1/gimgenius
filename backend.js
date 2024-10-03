const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI, StableDiffusion } = require('./models');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const aiModels = {
    'gpt': new OpenAI(),
    'stable_diffusion': new StableDiffusion(),
    'dalle': new OpenAI()  // DALL·E integrated with OpenAI for image generation
};

app.post('/generate_text', (req, res) => {
    const { prompt, model } = req.body;
    const selectedModel = aiModels[model] || aiModels['gpt'];
    
    selectedModel.generateText(prompt)
        .then(response => res.json({ response }))
        .catch(err => res.status(500).json({ error: 'Text generation failed' }));
});

app.post('/generate_image', (req, res) => {
    const { prompt, model } = req.body;
    const selectedModel = aiModels[model] || aiModels['stable_diffusion'];
    
    selectedModel.generateImage(prompt)
        .then(imageUrl => res.json({ image_url: imageUrl }))
        .catch(err => res.status(500).json({ error: 'Image generation failed' }));
});

app.listen(3000, () => {
    console.log('Nex Network AI Backend running on port 3000');
});
