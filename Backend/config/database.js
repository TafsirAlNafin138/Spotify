import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

dotenv.config();





// Initialize Neon connection
let sql;
try{
  sql = neon(process.env.DATABASE_URL);
  return ApiResponse.success(200, "Database connected successfully");
}catch(err){
  throw new ApiError(500, "Database connection failed");
}

export default sql;

