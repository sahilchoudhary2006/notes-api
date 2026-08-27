import React, { useEffect, useState } from 'react';
import { Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const Navbar = ({ onMenuClick }) => {
  const [isDark, setIsDark] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 hidden md:block">NoteFlow</h2>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Button variant="ghost" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
