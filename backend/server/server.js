const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/videoDB', { useNewUrlParser: true, useUnifiedTopology: true });

const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    videoPath: String
});

const Video = mongoose.model('Video', videoSchema);

// Multer ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Video yükleme endpoint'i
app.post('/upload', upload.single('video'), (req, res) => {
    const newVideo = new Video({
        title: req.body.title,
        description: req.body.description,
        videoPath: req.file.path
    });

    newVideo.save((err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send('Video başarıyla yüklendi!');
    });
});

// Video oynatma endpoint'i
app.get('/videos', (req, res) => {
    Video.find({}, (err, videos) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).json(videos);
    });
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
