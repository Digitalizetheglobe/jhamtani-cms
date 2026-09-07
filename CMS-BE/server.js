const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/email-templates', require('./routes/emailTemplateRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/youtube-videos', require('./routes/youtubeVideoRoutes'));

// Media Manager Routes
app.use('/api/gallery-photos', require('./routes/galleryPhotoRoutes'));
app.use('/api/video-uploads', require('./routes/videoUploadRoutes'));
app.use('/api/happy-clients', require('./routes/happyClientRoutes'));

// Banner Management Routes
app.use('/api/banners', require('./routes/bannerRoutes'));

// Project Management Routes
app.use('/api/projects', require('./routes/projectRoutes'));

// Root
app.get('/', (req, res) => {
  res.send('Universal CMS Backend Running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from ${path.join(__dirname, 'public')}`);
});