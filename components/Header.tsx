
export default function Header(){
  return(
    <header className='w-full flex justify-between items-center p-10 font-semibold'>
      <span className='txt-2xl xl:text-4xl bg-gradient-to-r from-[#1E90FF] to-[#8A2BE2] bg-clip-text text-transparent'>xpenz</span>
      <nav className="hidden lg:flex px-14 gap-14">
        <a href='#' className='transition-all transform hover:translate-y-1'>Home</a>
        <a href='#' className='transition-all transform hover:translate-y-1'>Find Jobs</a>
        <a href='#' className='transition-all transform hover:translate-y-1'>Find Talents</a>
        <a href='#' className='transition-all transform hover:translate-y-1'>About us</a>
        <a href='#' className='transition-all transform hover:translate-y-1'>Testimonials</a>
      </nav>

      <button
        className="group relative overflow-hidden text-white bg-gradient-to-r from-[#A128FF] to-[#6100AD] rounded-full px-4 p-2 transform transition-all duration-500 hover:scale-110"
      >
        {/* Default text */}
        <span className="block transition-transform duration-500 ease-in-out group-hover:-translate-y-20">
          Sign Up
        </span>

        {/* Hover text */}
        <span className="absolute left-1/2 -translate-x-1/2 top-full block transition-transform duration-500 ease-in-out group-hover:-translate-y-8">
          Login
        </span>
      </button>
    </header>
  )
}
