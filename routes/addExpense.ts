import express from 'express';
import { createExpense } from '../queries/expense.ts';

const router = express.Router();

export default router.post('/', async (req, res) => {
  const user_id = req.query.user_id;
  const {expense_id , category_id , amount , date , created_at} = req.body;
  try {
    const expense = await createExpense(expense_id , category_id , amount , date , created_at);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
