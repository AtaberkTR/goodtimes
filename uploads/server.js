const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Dosya yüklenemedi.');
        }

        const video = {
            _id: Date.now().toString(),
            title: req.body.title,
            description: req.body.description,
            videoPath: `/uploads/${req.file.filename}`,
            thumbnailPath: '/path/to/default/thumbnail.jpg', // Şimdilik sabit bir thumbnail
            views: 0,
            likes: 0,
            dislikes: 0
        };

        const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
        videos.push(video);
        fs.writeFileSync('videos.json', JSON.stringify(videos));

        res.json(video);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).send(`Sunucu hatası: ${error.message}`);
    }
});

// Diğer endpoint'ler...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});