import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../models/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerAdmin = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = await pool.query(
            'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        res.json(newAdmin.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const admin = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

        if (admin.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, admin.rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.rows[0].id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const registerCashier = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newCashier = await pool.query(
            'INSERT INTO cashiers (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        res.json(newCashier.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export const loginCashier = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const cashier = await pool.query('SELECT * FROM cashiers WHERE email = $1', [email]);

        if (cashier.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, cashier.rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: cashier.rows[0].id, role: 'cashier' }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};