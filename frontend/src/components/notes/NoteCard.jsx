import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Calendar, CheckSquare, List as ListIcon, Pin, PinOff, Archive, ArchiveRestore } from 'lucide-react';
import { cn } from '../../utils/cn';

const NoteCard = ({ note, onEdit, onDelete, onToggleItem, onTogglePin, onToggleArchive }) => {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <motion.div 
      onClick={() => onEdit(note)}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-gray-900 border shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer",
        note.isPinned ? "border-blue-400 dark:border-blue-600 shadow-blue-100 dark:shadow-blue-900/20" : "border-gray-100 dark:border-gray-800"
      )}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
    >
      <div>
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {note.title}
          </h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note);
            }}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              note.isPinned 
                ? "text-blue-600 bg-blue-50 dark:bg-blue-900/30 opacity-100" 
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100"
            )}
            title={note.isPinned ? "Unpin Note" : "Pin Note"}
          >
            {note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.map(tag => (
              <span 
                key={tag._id || tag.name} 
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ 
                  backgroundColor: `${tag.color}15`, 
                  borderColor: `${tag.color}30`,
                  color: tag.color 
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        
        {note.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-4 mb-3">
            {note.description}
          </p>
        )}

        {/* Lists Preview */}
        {note.lists && note.lists.length > 0 && (
          <div className="space-y-4 mt-2">
            {note.lists.slice(0, 2).map((list) => {
              const completedCount = list.items.filter(i => i.completed).length;
              const totalCount = list.items.length;
              
              return (
                <div key={list._id || Math.random()} className="text-sm">
                  {list.title && (
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-gray-800 dark:text-gray-200">{list.title}</strong>
                      {list.type === 'checklist' && totalCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {completedCount} of {totalCount}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    {list.items.slice(0, 3).map((item) => (
                      <div key={item._id || Math.random()} className="flex items-start gap-2">
                        {list.type === 'checklist' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleItem(note._id, list._id, item._id, !item.completed);
                            }}
                            className={cn(
                              "mt-0.5 flex-shrink-0 h-4 w-4 rounded flex items-center justify-center border transition-colors",
                              item.completed 
                                ? "bg-blue-500 border-blue-500 text-white" 
                                : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                            )}
                          >
                            {item.completed && <CheckSquare className="h-3 w-3" />}
                          </button>
                        ) : (
                          <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                        )}
                        <span className={cn(
                          "line-clamp-1",
                          list.type === 'checklist' && item.completed ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                    
                    {list.items.length > 3 && (
                      <p className="text-xs text-gray-400 italic mt-1">
                        + {list.items.length - 3} more items...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {note.lists.length > 2 && (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <ListIcon className="h-3 w-3" />
                <span>+ {note.lists.length - 2} more lists</span>
              </div>
            )}
          </div>
        )}

        {/* Drawings Indicator */}
        {note.drawings && note.drawings.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-1 rounded">
            <span className="h-3 w-3">🎨</span>
            <span>{note.drawings.length} {note.drawings.length === 1 ? 'Whiteboard' : 'Whiteboards'}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          {formattedDate}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-1.5 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(note);
            }}
            className="p-1.5 rounded text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
            title={note.isArchived ? "Unarchive" : "Archive"}
          >
            {note.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;
