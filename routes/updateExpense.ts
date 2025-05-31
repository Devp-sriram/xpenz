import express from 'express';
import { updateExpense } from '../queries/expense.ts';

const router = express.Router();

export default router.put('/:id',async(req,res)=>{ 
  try{
    const expense = await updateExpense(
      req.query.user_id,
      req.params.id,
      req.body
    );
    res.status(200).json(expense);
  }catch(e){
    res.status(400).json({error:e.message});
  }
});
