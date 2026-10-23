import { Link } from "react-router-dom"
import { CitySearch } from "./CitySearch"
import { ThemeToggle } from "./ThemeToggle"
import { LOGO_URL } from "@/lib/assets"

export function Header() {

  return (
    <header className="sticky top-0 z-50 w-full py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">   
        <div className="mx-auto flex h-16 items-center justify-between px-6 sm:px-16 md:px-14 lg:px-16 ">
            <Link to={"/"} className="flex items-center justify-center">
                <img src={LOGO_URL} className="logo" alt="" />
                <div className="flex flex-col items-start ml-2">
                    <span className="text-base sm:text-lg font-bold">WEATHER APP</span>
                    <span className="text-sm sm:text-base">By Belcadi Oussama</span>
                </div>
            </Link>

            <div className="flex gap-4">
                {/* SEARCH */}
                <CitySearch />
                {/* THEME TOGGLE */}
                <ThemeToggle />
            </div>
        </div>
    </header>  
  )
}

export default Header