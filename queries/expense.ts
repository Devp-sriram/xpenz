import db from '../config/db.ts';

export default async function createExpense( expense_id , user_id , category_id , amount , date , created_at ){
  const query = `
    INSERT INTO expenses( expense_id , user_id , category_id , amount , date , created_at )
    VALUES ($1 , $2 , $3 , $4 , $5 , $6)
    RETURNING *
  `;

  const values = [expense_id , user_id , category_id , amount , date , created_at];
  const { rows } = await db.query( query , values);
  return rows[0];
}
