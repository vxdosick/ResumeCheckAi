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
        const message = `Analyse the CV below and give an overall assessment based on the type of company. It may be poorly structured, so please structure it for yourself to make it easier for you to work with, do not pay attention to the structure of the CV, the structure should not affect the evaluation in any way, neither positively nor negatively. 
Here is the text of the CV: ${extractedText}
Company Type: ${companyType}
Please leave a grade based on the following criteria:
                0. Give an overall rating of the resume with a number between 1 and 10
                1. List the strengths of the resume, i.e. write what is very well emphasised and highlighted in the resume.
                2. List the weaknesses of the resume, i.e. what would be worth improving, removing or changing.
                3. Give in-text feedback (2-5 sentences) with suggestions on what should be improved, added or removed in the resume, and general rules of resume writing if any have been broken.
Important points: Lack of clear structure and organisation in a CV should not be included as a disadvantage or advantage!
                Your entire resume evaluation message should only be along the structure as I have outlined above and without any additional text. 
                Poor formatting, lack of clear structure, lack of organisation should not be included in disadvantages because it is not a problem with the CV.
Send me feedback in correct JSON format with the following fields: "rating": number, "strengths": [string], "weaknesses": [string], "summary": string. Send only a JSON object without "json" at the beginning and """at the end, just the object is the most important part. That is, your whole message, your whole response should be code in JSON format, so that your response (in pure JSON can be used later in the API)`

        // const message = ` Analyze the following resume and provide feedback based on the company type provided. It may be poorly structured, so please structure it for yourself so that it is more convenient for you to work. Here is the resume text:
    
        //         ${extractedText}
    
        //         COMPANY TYPE: ${companyType}
    
        //         Please provide feedback based on the following criteria:
        //         1. Rate using this words: Bad, Okay ,Good, Excellent. Based on how well the resume fits the company type '${companyType}'.
        //         2. List the strengths of the resume.
        //         3. List the weaknesses of the resume.
        //         4. Provide a text summary (2-5 sentences) with suggestions on what to improve, add, or remove in the resume.
    
        //         Important points: Lack of clear structure and organization in the resume should not be included in the disadvantages!
        //         So send me just feedback without any additional context and without any structured resume, just feedback.
        //         poor formatting, lack of clear structure, lack of organization should not be included in the disadvantages because it is not a resume problem.
        //         Send me feedback in valid JSON format with the following fields: "rating": string, "strengths": [string], "weaknesses": [string], "summary": string. Send just JSON object without '''json in start and ''' in end, just object its the most important part.`

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
