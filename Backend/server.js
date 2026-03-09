import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import albumRoutes from './routes/album.route.js';
import trackRoutes from './routes/tracks.route.js';
import statRoutes from './routes/stat.route.js';
import userRoutes from './routes/user.route.js';
import likesRoutes from './routes/likes.route.js';
import podcastRoutes from './routes/podcast.route.js';
import podcastFollowerRoutes from './routes/podcastFollower.route.js';
import artistRoutes from './routes/artist.route.js';
import searchRoutes from './routes/search.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Disable ETag generation to prevent 304 Not Modified responses
app.disable('etag');

// Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));

// Webhook Route - Removed

// Global Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/users/history', userRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/podcast-followers', podcastFollowerRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/search', searchRoutes);

app.get("/", (req, res) => {
  res.send("Spotify API is running");
});

const PORT = process.env.PORT || 2222;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
