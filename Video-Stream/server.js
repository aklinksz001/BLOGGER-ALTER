// server.js (make sure this code is included)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the root directory

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Initialize gfs
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Multer storage for GridFS
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads' // Collection name in MongoDB
        };
    }
});
const upload = multer({ storage });

// Upload route
app.post('/upload', upload.single('video'), (req, res) => {
    const videoName = req.body.video_name;
    const stream = req.body.stream;

    // Save video metadata in MongoDB
    const videoLink = `http://localhost:3000/video/${req.file.id}`; // Adjust the URL based on your deployment
    // Here, you can add code to save the video name and stream info in your database

    res.json({ message: `Video ${videoName} uploaded successfully!`, video_link: videoLink });
});

// Video retrieval route (adjust based on your logic)
app.get('/video/:id', (req, res) => {
    gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
        }
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
    });
});

// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
