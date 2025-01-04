import { PropsWithChildren } from 'react'
import Header from './Header'
import { Link } from 'react-router-dom'

const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className='w-s bg-gradient-to-bl from-background to-muted'>
        <Header/>
        <main className='flex items-center justify-center min-h-screen mx-auto px-2 s:px-8 sm:px-12 py-8'>
            {children}
        </main>  
        <footer className='border-t backdrop-blur py-12 supports-[backdrop-filter]:bg-background/60'>
            <div className='mx-auto px-4 flex items-center justify-center text-center'>
              <Link to={"/"}>
              <img src="react.svg" className="logo mr-2 sm:mr-3 h-10 sm:h-14 md:h-16" alt="logo" />
              </Link>
              <p className='text-sm sm:text-lg md:text-xl flex flex-col items-start lg:flex-row lg:items-center'>REACT & TypeScript Modern Weather App<span className='text-lg sm:text-xl lg:ml-2 font-semibold'>By Belcadi Oussama</span></p>
              
            </div>
        </footer>
    </div>
  )
}

export default AppLayout