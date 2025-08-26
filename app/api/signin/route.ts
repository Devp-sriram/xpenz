import { NextRequest, NextResponse } from 'next/server';
import db from '@/config/db';
// import Company from '@/models/company';
// import CheckUser from '../../../controllers/checkuser.js'
import { hash } from "bcryptjs"

async function handler(req: NextRequest) {
  const { method } = req;
  let body;

  switch (method) {
    case 'POST':
      try { 
        try {
          body = await req.json();
          //console.log(body)
        } catch (err) {
          return NextResponse.json(
            { error: "Lack of user input" },
            { status: 400 }
          );
        }

        await db.pool.connect();
        // await connectDb(); // make sure this is a function that connects to your database
        const { email , password , username } = body; // assuming password is sent in the request body

        //if(await CheckUser(email)){
        // console.log('fn'+ await CheckUser(email))
        //    return NextResponse.json({ error:'user aldreay exist'},{status:400});
        //}

        try{
          const { rows } = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
          );

          if (rows.length > 0) {
            return NextResponse.json(
              { error: "User already exists" },
              { status: 400 }
            );
          }
        }catch(err){
          console.log('err while checking user' + err)
        }

        const hashedPassword = await hash(password , 12);
        try{

          const { rows } = await db.query('INSERT INTO users( username , email , password_hash) VALUES($1 ,$2 ,$3)', [ username , email , hashedPassword])
          //const newUser = new Company({ email , password : hashedPassword , company });
          //await newUser.save();
          return NextResponse.json({msg:'user craeted'},{status: 201});
          // if(newUser){
          //   return NextResponse.json({error:'user created'},{status:200})
          // }else{
          //  return NextResponse.json({error:'user not created'},{status:401})
          // }
        }catch(err){
          console.log(err)
        }
      }catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    default:
      return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }
}

export { handler as GET, handler as POST };
