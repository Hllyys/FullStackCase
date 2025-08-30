const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { initDb } = require('./config/db');

(async () => {
  await initDb();

  const app = express();


  const allowedOrigins = [
    'http://localhost:3000', // Next dev (default)
    'http://localhost:3001', // Login ekranın
  ];

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, 
  }));


  app.options('*', cors());

  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));


  // API Routes
  app.use('/api', require('./routes'));

  // 404
  app.use((req, res, next) => {
    if (res.headersSent) return next();
    res.status(404).json({ error: { message: 'Not Found' } });
  });

  // Hata yakalayıcı
  app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    res
      .status(err.status || 500)
      .json({ error: { message: err.message || 'Internal Server Error' } });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server listening on http://localhost:${PORT}`)
  );
})();
