import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'All Notes', href: '/dashboard', icon: <Home className="h-5 w-5 mr-3" /> },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 md:hidden">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">NoteFlow</span>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
