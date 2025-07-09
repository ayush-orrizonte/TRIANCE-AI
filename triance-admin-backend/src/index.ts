import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Triance Admin Backend API Running');
});

app.listen(PORT, () => {
  console.log(`Admin server running on http://localhost:${PORT}`);
});
