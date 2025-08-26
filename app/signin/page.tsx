'use client'
import { useState } from "react";
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Page(){
 
 const [email,setEmail] = useState('')
 const [password,setPassword] = useState('');
 const [username,setUsername] = useState('');
 const [isTouched,setIsTouched] = useState(false);

 const router = useRouter();

 const PasswordErr =()=>{
  return(
     <p className="text-white bg-red-300 rounded-xl justify-center p-1"> password must be 8 character or above</p>
  )
 };

 const isValid = () =>{
  return (
    email && password.length >= 8 && username ? true :false
  ) 
 }

 const handleSubmit = async (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    try{
    const response = await axios.post(`/api/signin`,{email,password,username}); 
    console.log(response);
      if(response.status === 200){
          router.push('/login')
      };
    }catch(err){
       console.log(err) 
    }
}

  return (
   <div className="w-full h-full p-10 flex justify-center items-start ">
    <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-8 justify-center items-center rounded-xl border border-purple-600">
     <form onSubmit={handleSubmit} className="flex flex-col w-full gap-2">
      <label>Username</label>
      <input 
        type="text" 
        placeholder="you_007"
        value={username} 
        onChange={(e)=>setUsername(e.target.value)}
        className="rounded"
      />
      <label>Email</label>
      <input 
        type="email" 
        placeholder="example@mail.com"
        value={email} 
        onChange={(e)=>setEmail(e.target.value)}
        className="rounded "
      />
      <label>Password</label>
      <input 
        type="password" 
        placeholder="min 8 & atleast 1 Uppercase"
        value={password} 
        onChange={(e)=>setPassword(e.target.value)}
        onBlur ={()=>setIsTouched(true)}
        className="rounded"
      />  
        {password.length <= 8 && isTouched && <PasswordErr/> }
      <button type='submit' disabled ={!isValid()} className="w-full p-4 my-2 rounded-2xl bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2]">Submit</button>
     </form>
    </div>
   </div> 
  )
}
