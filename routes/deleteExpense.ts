import express from 'express';
import { deleteExpense } from '../queries/expense.ts';

const router = express.Router();

export default router.delete('/:id', async (req, res) => {
  const expense_id = req.params.id;
  const user_id = req.query.user_id;
  try {
    const expense = await deleteExpense(expense_id , user_id);
    res.status(200).json({status:'deleted',data:expense});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
