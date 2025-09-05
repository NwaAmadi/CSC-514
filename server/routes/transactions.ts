import express from "express"
import { supabase } from "../utils/supabaseClient"
import { isAuth } from "../middleware/authMiddleware";

const router = express.Router()

router.get("/", isAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user_id, cashier_name, amount, type, description } = req.body

    if (!user_id || !cashier_name || !amount || !type) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const { error } = await supabase.from("transactions").insert([
      { user_id, cashier_name, amount, type, description },
    ])

    if (error) throw error
    res.status(201).json({ message: "Transaction added successfully" })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})


router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { error } = await supabase.from("transactions").delete().eq("id", id)
    if (error) throw error
    res.json({ message: "Transaction deleted successfully" })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

export default router
