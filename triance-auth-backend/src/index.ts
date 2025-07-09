import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Triance Auth Backend API Running');
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
