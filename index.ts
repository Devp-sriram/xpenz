import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import addExpense from './routes/addExpense.ts';
import updateExpense from './routes/updateExpense.ts';

dotenv.config();

const app = express();
const port = 4000;

app.use(express.json())
app.use(cors({origin:"*"}))

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.use('/addExpense',addExpense);
app.use('/updateExpense',updateExpense);

app.get('/',(req,res)=>{
  res.send('hello from xpenz')
})

app.listen(port,()=>{
  console.log(`app listening to port ${port}`);
})
