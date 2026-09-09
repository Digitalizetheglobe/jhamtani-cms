const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/email-templates', require('./routes/emailTemplateRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/youtube-videos', require('./routes/youtubeVideoRoutes'));
app.use('/api/gallery-photos', require('./routes/galleryPhotoRoutes'));
app.use('/api/video-uploads', require('./routes/videoUploadRoutes'));
app.use('/api/happy-clients', require('./routes/happyClientRoutes'));
app.use('/api/awards', require('./routes/awardRoutes'));
app.use('/api/brochures', require('./routes/brochureRoutes'));
app.use('/api/project-locations', require('./routes/projectLocationRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));

app.get('/', (req, res) => {
  res.send('Universal CMS Backend Running');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Serving static files from ${path.join(__dirname, 'public')}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
