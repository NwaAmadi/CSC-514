import { Request, Response } from 'express';
import pool from '../models/db';

export const getAllCashiers = async (req: Request, res: Response) => {
    try {
        const allCashiers = await pool.query('SELECT id, name, email FROM cashiers');
        res.json(allCashiers.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

export const deleteCashier = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM cashiers WHERE id = $1', [id]);
        res.json({ message: 'Cashier deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
