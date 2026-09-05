import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search as SearchIcon, AlertTriangle, FileX2, Type, CheckSquare, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotes, createNote, updateNote, deleteNote } from '../services/notes.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import Pagination from '../components/notes/Pagination';
import { cn } from '../utils/cn';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'archive'
  const [layout, setLayout] = useState('grid'); // 'grid' or 'list'

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('default');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const openCreateModal = (type) => {
    setIsFabOpen(false);
    setModalMode(type);
    if (type === 'list') {
      setEditingNote({ title: '', description: '', lists: [{ title: '', type: 'checklist', items: [] }], drawings: [] });
    } else if (type === 'drawing') {
      setEditingNote({ title: '', description: '', lists: [], drawings: [{ title: '', data: '[]' }] });
    } else {
      setEditingNote(null); // text mode
    }
    setIsNoteModalOpen(true);
  };


  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when sort changes
  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getNotes({ page, limit: 12, search: debouncedSearch, sort, type: filterType, tab: activeTab });
      setNotes(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, sort, filterType, activeTab]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateOrUpdateNote = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingNote && editingNote._id) {
        await updateNote(editingNote._id, data);
        toast.success('Note updated successfully');
      } else {
        await createNote(data);
        toast.success('Note created successfully');
      }
      setIsNoteModalOpen(false);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      setIsDeleting(true);
      await deleteNote(noteToDelete._id);
      toast.success('Note deleted successfully');
      setDeleteModalOpen(false);
      setNoteToDelete(null);
      fetchNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (note) => {
    let mode = 'default';
    
    const hasDrawing = note.drawings && note.drawings.length > 0;
    const hasList = note.lists && note.lists.length > 0;
    const hasDescription = note.description && note.description.trim().length > 0;

    if (hasDrawing && !hasList && !hasDescription) {
      mode = 'drawing';
    } else if (hasList && !hasDrawing && !hasDescription) {
      mode = 'list';
    } else if (!hasDrawing && !hasList) {
      mode = 'text';
    }

    setModalMode(mode);
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const openDeleteModal = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const handleTogglePin = async (note) => {
    try {
      // Optimistic update
      setNotes(currentNotes => currentNotes.map(n => n._id === note._id ? { ...n, isPinned: !n.isPinned } : n));
      await updateNote(note._id, { isPinned: !note.isPinned });
      fetchNotes(); // Re-fetch to sort correctly
    } catch (error) {
      toast.error('Failed to update pin status');
      fetchNotes(); // Revert
    }
  };

  const handleToggleArchive = async (note) => {
    try {
      // Optimistic update
      setNotes(currentNotes => currentNotes.filter(n => n._id !== note._id));
      await updateNote(note._id, { isArchived: !note.isArchived });
      toast.success(note.isArchived ? 'Note unarchived' : 'Note archived');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to archive note');
      fetchNotes(); // Revert
    }
  };

  // Optimistic UI update for checklists
  const toggleNoteItem = async (noteId, listId, itemId, completed) => {
    // 1. Optimistically update UI
    setNotes(currentNotes => currentNotes.map(note => {
      if (note._id === noteId) {
        return {
          ...note,
          lists: note.lists.map(list => {
            if (list._id === listId) {
              return {
                ...list,
                items: list.items.map(item => item._id === itemId ? { ...item, completed } : item)
              };
            }
            return list;
          })
        };
      }
      return note;
    }));

    // 2. Persist to API
    try {
      // Find the deeply updated note to send to the server
      let updatedNoteData;
      setNotes(currentNotes => {
        const found = currentNotes.find(n => n._id === noteId);
        if (found) {
           updatedNoteData = { lists: found.lists };
        }
        return currentNotes;
      });
      
      if (updatedNoteData) {
        await updateNote(noteId, updatedNoteData);
      }
    } catch (error) {
      toast.error('Failed to update list item');
      fetchNotes(); // Revert on failure
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Notes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination ? `Showing ${notes.length} of ${pagination.totalNotes} notes` : 'Loading...'}
          </p>
        </div>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === 'all' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Active
          </button>
          <button
            onClick={() => { setActiveTab('archive'); setPage(1); }}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === 'archive' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Archive
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full h-10 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:border-gray-700 dark:text-gray-50"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {['all', 'text', 'list', 'drawing'].map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={cn(
                "px-4 h-10 rounded-md text-sm font-medium transition-colors capitalize",
                filterType === type 
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              {type}
            </button>
          ))}
          <div className="w-full sm:w-40 sm:ml-2">
            <select
              value={sort}
              onChange={handleSortChange}
              className="w-full h-10 rounded-md border border-gray-300 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:border-gray-700 dark:text-gray-50 cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-md sm:ml-2">
            <button
              onClick={() => setLayout('grid')}
              className={cn(
                "p-1.5 rounded transition-colors",
                layout === 'grid' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
              title="Grid View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button
              onClick={() => setLayout('list')}
              className={cn(
                "p-1.5 rounded transition-colors",
                layout === 'list' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
              title="List View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-gray-200 dark:border-gray-800">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : notes.length > 0 ? (
        <>
          <motion.div 
            className={cn(
              "grid gap-6",
              layout === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}
            layout
          >
            <AnimatePresence>
              {notes.map((note) => (
                <NoteCard 
                  key={note._id} 
                  note={note} 
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onToggleItem={toggleNoteItem}
                  onTogglePin={handleTogglePin}
                  onToggleArchive={handleToggleArchive}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-full mb-4">
            <FileX2 className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No notes found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {debouncedSearch 
              ? `We couldn't find any notes matching "${debouncedSearch}". Try a different search term.` 
              : "You haven't created any notes yet. Click the 'New Note' button to get started!"}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <NoteModal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        onSubmit={handleCreateOrUpdateNote}
        isLoading={isSubmitting}
        defaultValues={editingNote}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="py-2">
          <div className="flex items-center gap-3 text-amber-600 mb-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">This action cannot be undone.</p>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the note <strong>"{noteToDelete?.title}"</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
              Delete Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isFabOpen && filterType === 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-end gap-3 mb-2"
            >
              <button
                onClick={() => openCreateModal('drawing')}
                className="flex items-center gap-3 group"
              >
                <span className="bg-gray-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity">Drawing</span>
                <div className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <PenTool className="h-5 w-5" />
                </div>
              </button>
              
              <button
                onClick={() => openCreateModal('list')}
                className="flex items-center gap-3 group"
              >
                <span className="bg-gray-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity">List</span>
                <div className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <CheckSquare className="h-5 w-5" />
                </div>
              </button>
              
              <button
                onClick={() => openCreateModal('text')}
                className="flex items-center gap-3 group"
              >
                <span className="bg-gray-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity">Text Note</span>
                <div className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                  <Type className="h-5 w-5" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            if (filterType !== 'all') {
              openCreateModal(filterType);
            } else {
              setIsFabOpen(!isFabOpen);
            }
          }}
          className={cn(
            "p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95",
            isFabOpen && filterType === 'all' ? "bg-gray-800 dark:bg-gray-700 text-white rotate-45" : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
