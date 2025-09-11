// src/config/app.config.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.DB_NAME || 'kimjongseo_db',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET || 'kimjongseo-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    destination: process.env.UPLOAD_PATH || './uploads',
  },
});
