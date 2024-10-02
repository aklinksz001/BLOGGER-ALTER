const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const path = require('path');
const app = express();
require('dotenv').config();

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Initialize GridFS
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads'); // Use "uploads" collection to store video files
});

// Configure multer storage for GridFS
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            filename: `${Date.now()}-${file.originalname}`, // Use unique filename
            bucketName: 'uploads' // Collection name
        };
    }
});

const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname)); // Serve files from the root directory

// Serve the password.html file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'password.html')); // Serve password page first
});

// Endpoint to upload videos
app.post('/upload', upload.single('video'), async (req, res) => {
    const videoUrl = `/video/${req.file.id}`; // Save the video ID to create a link
    const newVideo = {
        video_link: videoUrl,
        stream: req.body.stream, // Save selected stream
        video_name: req.body.video_name // Save video name
    };
    
    // Here you would save newVideo to a separate collection for metadata
    await Video.create(newVideo); // Save video info in MongoDB (ensure you define Video model)
    
    res.json({ message: 'Video uploaded successfully!', link: videoUrl });
});

// Define Video Schema
const videoSchema = new mongoose.Schema({
    video_link: { type: String, required: true },
    stream: { type: String, required: true },
    video_name: { type: String, required: true }, // Add video_name field
    createdAt: { type: Date, default: Date.now } // Auto-generate date
});
const Video = mongoose.model('Video', videoSchema);

// Endpoint to get videos by stream and pagination
app.get('/videos', async (req, res) => {
    const { stream, page = 0 } = req.query;
    const limit = 10;
    const videos = await Video.find({ stream }).sort({ createdAt: -1 }).skip(page * limit).limit(limit);
    res.json(videos);
});

// Endpoint to stream video by ID
app.get('/video/:id', (req, res) => {
    gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ error: 'No file exists' });
        }

        // Check if the file is a video
        if (file.contentType === 'video/mp4') {
            // Streaming video
            const readstream = gfs.createReadStream(file._id);
            readstream.pipe(res);
        } else {
            res.status(404).json({ error: 'Not a video file' });
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
