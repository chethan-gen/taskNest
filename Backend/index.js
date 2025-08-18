import express from 'express';
import connectDB from './db.js'; // Import the connectDB function

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Connect to MongoDB
connectDB();

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});