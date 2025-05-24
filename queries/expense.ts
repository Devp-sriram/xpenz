import db from '../config/db.ts';

export async function createExpense( expense_id , user_id , category_id , amount , date , created_at ){
  const query = `
    INSERT INTO expenses( expense_id , user_id , category_id , amount , date , created_at )
    VALUES ($1 , $2 , $3 , $4 , $5 , $6)
    RETURNING *
  `;

  const values = [expense_id , user_id , category_id , amount , date , created_at];
  const { rows } = await db.query( query , values);
  return rows[0];
}

export async function updateExpense ( expense_id , user_id , updates) {
  const {category_id , amount , date} = updates;

  const query = `
    UPDATE expenses
    SET
      category_id = COALESCE($3, category_id),
      amount = COALESCE($4, amount),
      date = COALESCE($5, date)
    WHERE expense_id =$1 AND user_id = $2
    RETURNING *
  `;
  const values = [expense_id , user_id , category_id , amount , date];
  const { rows } = await db.query( query , values);
  return rows[0];
}

