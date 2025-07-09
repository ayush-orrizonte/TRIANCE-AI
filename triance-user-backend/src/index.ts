import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Triance User Backend API Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
