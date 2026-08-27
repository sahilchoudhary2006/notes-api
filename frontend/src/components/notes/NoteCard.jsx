import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Calendar } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete }) => {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <motion.div 
      className="group relative flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {note.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-4">
          {note.description}
        </p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {formattedDate}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(note)}
            className="p-1.5 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(note)}
            className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
