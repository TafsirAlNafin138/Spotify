import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express'
import { uploadOnCloudinary } from './config/cloudinary.js';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log("This is my Kingdom");
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import albumRoutes from './routes/album.route.js';
import trackRoutes from './routes/tracks.route.js';
import statRoutes from './routes/stat.route.js';

app.use(helmet());
app.use(cors());
app.use(morgan());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));
app.use(cookieParser());
app.use(clerkMiddleware()); // this will add auth to req object
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/stats', statRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
