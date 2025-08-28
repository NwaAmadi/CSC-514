import express from "express";
import cashierRoutes from "./routes/cashier";
import cors from 'cors'
import bodyParser from 'body-parser'
import adminRoutes from './routes/admin'
import transcationsRoutes from './routes/transactions'

const app = express();
app.use(express.json());
app.use(cors())
app.use(bodyParser.json())

app.use("/api/cashier", cashierRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/transactions', transcationsRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SERVER IS ACTIVE ON:  ${PORT}`));
