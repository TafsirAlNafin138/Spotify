import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();


const {PGUSER, PGPASSWORD, PGHOST, PGDATABASE} = process.env;


// Initialize Neon connection
export const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`);

