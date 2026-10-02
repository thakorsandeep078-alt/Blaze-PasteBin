const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'latest-screenshot' + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let latestCode = "";
let latestImage = null;
let lastUpdated = Date.now(); // Track when it was last changed

// Route to handle new uploads
app.post('/share', upload.single('screenshot'), (req, res) => {
    let changed = false;
    if (req.body.code !== undefined && req.body.code !== latestCode) {
        latestCode = req.body.code;
        changed = true;
    }
    if (req.file) {
        latestImage = req.file.filename;
        changed = true;
    }
    if (changed) {
        lastUpdated = Date.now();
    }
    res.redirect('/');
});

// Route to fetch current clipboard
app.get('/api/latest', (req, res) => {
    res.json({
        code: latestCode,
        image: latestImage ? `/uploads/${latestImage}` : null,
        updatedAt: lastUpdated
    });
});

// Route to clear the clipboard
app.post('/api/clear', (req, res) => {
    latestCode = "";
    if (latestImage) {
        const imagePath = path.join(uploadDir, latestImage);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        latestImage = null;
    }
    lastUpdated = Date.now();
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Clipboard server running on port ${PORT}`);
});