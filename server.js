const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

// Statik dosyaları sunmak için
app.use(express.static('uploads'));
app.use('/uploads', express.static('uploads'));

// Multer ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Upload endpoint'i
app.post('/upload', upload.single('video'), (req, res) => {
    try {
        console.log('Upload isteği alındı');
        if (!req.file) {
            console.log('Dosya bulunamadı');
            return res.status(400).send('Dosya yüklenemedi.');
        }

        console.log('Dosya alındı:', req.file);
        console.log('Form verileri:', req.body);

        const video = {
            _id: Date.now().toString(),
            title: req.body.title,
            description: req.body.description,
            videoPath: `/uploads/${req.file.filename}`,
            thumbnailPath: '/path/to/default/thumbnail.jpg',
            views: 0,
            likes: 0,
            dislikes: 0
        };

        console.log('Video nesnesi oluşturuldu:', video);

        let videos = [];
        try {
            videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
        } catch (error) {
            console.log('videos.json dosyası okunamadı, yeni bir dizi oluşturuluyor');
        }
        videos.push(video);
        fs.writeFileSync('videos.json', JSON.stringify(videos));

        console.log('Video kaydedildi');

        res.json(video);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).send(`Sunucu hatası: ${error.message}`);
    }
});

// Video listesini al
app.get('/videos', (req, res) => {
    try {
        const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
        res.json(videos);
    } catch (error) {
        console.error('Videos okuma hatası:', error);
        res.status(500).send('Videolar alınırken bir hata oluştu');
    }
});

// Video beğenme
app.post('/videos/:id/like', (req, res) => {
    try {
        let videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
        const video = videos.find(v => v._id === req.params.id);
        if (video) {
            video.likes = (video.likes || 0) + 1;
            fs.writeFileSync('videos.json', JSON.stringify(videos));
            res.json(video);
        } else {
            res.status(404).send('Video bulunamadı');
        }
    } catch (error) {
        console.error('Beğenme hatası:', error);
        res.status(500).send('Beğenme işlemi sırasında bir hata oluştu');
    }
});

// Video beğenmeme
app.post('/videos/:id/dislike', (req, res) => {
    try {
        let videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
        const video = videos.find(v => v._id === req.params.id);
        if (video) {
            video.dislikes = (video.dislikes || 0) + 1;
            fs.writeFileSync('videos.json', JSON.stringify(videos));
            res.json(video);
        } else {
            res.status(404).send('Video bulunamadı');
        }
    } catch (error) {
        console.error('Beğenmeme hatası:', error);
        res.status(500).send('Beğenmeme işlemi sırasında bir hata oluştu');
    }
});

// Video silme
app.delete('/videos/:id', (req, res) => {
    try {
        let videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
        const videoIndex = videos.findIndex(v => v._id === req.params.id);
        if (videoIndex !== -1) {
            videos.splice(videoIndex, 1);
            fs.writeFileSync('videos.json', JSON.stringify(videos));
            res.send('Video başarıyla silindi');
        } else {
            res.status(404).send('Video bulunamadı');
        }
    } catch (error) {
        console.error('Silme hatası:', error);
        res.status(500).send('Silme işlemi sırasında bir hata oluştu');
    }
});

// Video arama
app.get('/videos/search', (req, res) => {
    try {
        const searchTerm = req.query.q.toLowerCase();
        const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
        const filteredVideos = videos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) || 
            video.description.toLowerCase().includes(searchTerm)
        );
        res.json(filteredVideos);
    } catch (error) {
        console.error('Arama hatası:', error);
        res.status(500).send('Arama sırasında bir hata oluştu');
    }
});

// Diğer endpoint'ler...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});