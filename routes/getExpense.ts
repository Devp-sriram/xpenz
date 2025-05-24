import express from 'express';
import { getExpense } from '../queries/expense.ts';

const router = express.Router();

export default router.get('/', async (req, res) => {
  const user_id = req.query.user_id;
  const { startDate , endDate } = req.body;
  try {
    const expense = await getExpense(user_id , startDate , endDate);
    res.status(200).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
