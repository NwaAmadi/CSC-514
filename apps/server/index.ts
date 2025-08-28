import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
import cashierRoutes from './routes/cashiers';

app.use('/api/auth', authRoutes);
app.use('/api/cashiers', cashierRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});