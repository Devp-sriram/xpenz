import Image from "next/image";
import Link from 'next/link'

export default function Home() {
  return (
    <div className='w-full min-h-[90vh] flex flex-col text-2xl font-bold text-center justify-center items-center gap-5'>
      <h1 className='text-4xl xl:text-6xl'> Welcome to <span className='bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent'>xpenz</span></h1>
      <h2> An expense tracker with AI OCR capabilities</h2>
      <Link href='/signin' className='border p-2 px-4 rounded-full border-purple-600'>Get Started</Link>
    </div>
  );
}
