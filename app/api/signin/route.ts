import { NextRequest, NextResponse } from 'next/server';
import db from '@/config/db';
import { hash } from "bcryptjs"

async function handler(req: NextRequest) {
  const { method } = req;
  let body;

  switch (method) {
    case 'POST':
      try { 

        try {
          body = await req.json();
        } catch (err) {
          return NextResponse.json(
            { error: "Lack of user input" },
            { status: 400 }
          );
        }

        const { email , password , username } = body; // assuming password is sent in the request body

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
          return NextResponse.json({msg:'user craeted'},{status: 201});
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
