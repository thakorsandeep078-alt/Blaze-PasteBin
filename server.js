const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'latest-screenshot' + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let latestCode = "";
let latestImage = null;

app.post('/share', upload.single('screenshot'), (req, res) => {
    if (req.body.code) latestCode = req.body.code;
    if (req.file) latestImage = req.file.filename;
    res.redirect('/');
});

app.get('/api/latest', (req, res) => {
    res.json({
        code: latestCode,
        image: latestImage ? `/uploads/${latestImage}` : null
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));