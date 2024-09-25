const express = require('express');
const cors = require('cors');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3001;
const apiKey = process.env.API_KEY;

app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

app.get('/api/', (req, res) => {
    res.send('Heil!');
});




app.post('/analyze-resume', upload.single('file'), async (req, res) => {
    try {
        const resumeFile = req.file;
        const companyType = req.body.company_type;

        if (!resumeFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
      

        const dataBuffer = fs.readFileSync(resumeFile.path);

        const pdfData = await pdfParse(dataBuffer);
        const extractedText = pdfData.text;

        fs.unlinkSync(resumeFile.path);

        const message = ` Analyze the following resume and provide feedback based on the company type provided. It may be poorly structured, so please structure it for yourself so that it is more convenient for you to work. Here is the resume text:
    
                ${extractedText}
    
                COMPANY TYPE: ${companyType}
    
                Please provide feedback based on the following criteria:
                1. Rate using this words: Bad, Okay ,Good, Excellent. Based on how well the resume fits the company type '${companyType}'.
                2. List the strengths of the resume.
                3. List the weaknesses of the resume.
                4. Provide a text summary (2-5 sentences) with suggestions on what to improve, add, or remove in the resume.
    
                Important points: Lack of clear structure and organization in the resume should not be included in the disadvantages!
                So send me just feedback without any additional context and without any structured resume, just feedback.
                poor formatting, lack of clear structure, lack of organization should not be included in the disadvantages because it is not a resume problem.
                Send me feedback in valid JSON format with the following fields: "rating": string, "strengths": [string], "weaknesses": [string], "summary": string. Send just JSON object without '''json in start and ''' in end, just object its the most important part.`

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const response = await axios.post(url, {
            contents: [
                {
                    parts: [
                        {
                            text: message
                        }
                    ]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const dataToJson = JSON.parse(response.data.candidates[0].content.parts[0].text);
        console.log(dataToJson);
        res.send(dataToJson);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error processing request' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
