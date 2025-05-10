import express from 'express';
import cors from 'cors'

const app = express();
const port = 4000;

app.use(express.json())
app.use(cors({origin:"*"}))

app.get('/',(req,res)=>{
  res.send('hello from xpenz')
})

app.listen(port,()=>{
  console.log(`app listening to port ${port}`);
})
