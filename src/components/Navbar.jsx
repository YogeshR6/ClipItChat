import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const App = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navbarClass = 'px-3 md:mt-0 mt-1 w-fit sm:w-max md:pb-1 text-lg md:text-xl text-stone-50 rounded-lg transition duration-300 ease-in-out hover:bg-gray-800';
    const navbarClassActive = 'px-3 md:mt-0 mt-1 w-fit md:w-max md:pb-1 text-lg md:text-xl text-stone-50 rounded-lg bg-gray-800';

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className="flex flex-wrap sm:justify-start sm:flex-nowrap w-full text-sm py-4">
            <nav className="max-w-[90rem] w-full mx-auto sm:flex sm:items-center sm:justify-between xl:px-1 px-3" aria-label="Global">
                <div className="flex items-center justify-between">
                    <a className="flex-none text-xl font-bold text-white">ClipItChat</a>
                    <div className="sm:hidden">
                        <button
                            type="button"
                            className="p-2 inline-flex justify-center items-center gap-x-2 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-transparent dark:border-neutral-700 dark:text-white dark:hover:bg-white/10"
                            aria-controls="navbar-with-collapse"
                            aria-label="Toggle navigation"
                            onClick={toggleNavbar}
                        >
                            <svg className={`${isOpen ? 'hidden' : 'block'} flex-shrink-0 size-4`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></svg>
                            <svg className={`${isOpen ? 'block' : 'hidden'} flex-shrink-0 size-4`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div id="navbar-with-collapse" className={`${isOpen ? 'block' : 'hidden'} transition-all duration-200 overflow-hidden basis-full grow sm:block`}>
                    <div className="flex flex-col sm:gap-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5">
                        <NavLink className={({ isActive }) => isActive ? navbarClassActive : navbarClass} to='/'>Home</NavLink>
                        <NavLink className={({ isActive }) => isActive ? navbarClassActive : navbarClass} to='/posts'>Posts</NavLink>
                        <NavLink className={({ isActive }) => isActive ? navbarClassActive : navbarClass} to='/profile'>My Profile</NavLink>
                        <NavLink className={({ isActive }) => isActive ? navbarClassActive : navbarClass} to='/auth'>Sign In</NavLink>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default App;