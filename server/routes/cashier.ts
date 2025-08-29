import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../utils/supabaseClient";
import { isAdmin } from "../middleware/authMiddleware";

const router = express.Router();


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;


    const { data: cashier, error } = await supabase
      .from("cashiers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !cashier) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    const isMatch = await bcrypt.compare(password, cashier.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    const token = jwt.sign(
      { id: cashier.id, role: "cashier" },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      cashier: {
        id: cashier.id,
        email: cashier.email,
        name: cashier.name,
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get('/', isAdmin, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('cashiers')
      .select('id, name, email')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch cashiers' })
  }
})

router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }


    const { data: exists } = await supabase
      .from('cashiers')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (exists) {
      return res.status(409).json({ message: 'A cashier with this email already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const { error } = await supabase
      .from('cashiers')
      .insert([{ name, email, password_hash: passwordHash }])

    if (error) throw error
    res.status(201).json({ message: 'Cashier registered successfully' })
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to add cashier' })
  }
})


router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from('cashiers').delete().eq('id', id)
    if (error) throw error
    res.json({ message: 'Cashier removed successfully' })
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to delete cashier' })
  }
})

export default router;
