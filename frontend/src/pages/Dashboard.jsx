import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search as SearchIcon, AlertTriangle, FileX2 } from 'lucide-react';
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

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('latest');

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

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

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getNotes({ page, limit: 12, search: debouncedSearch, sort });
      setNotes(res.data);
      setPagination(res.pagination);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, sort]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateOrUpdateNote = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingNote) {
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
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const openDeleteModal = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
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
        <Button onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}>
          <Plus className="h-5 w-5 mr-2" />
          New Note
        </Button>
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
        <div className="w-full sm:w-48">
          <select
            value={sort}
            onChange={handleSortChange}
            className="w-full h-10 rounded-md border border-gray-300 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:border-gray-700 dark:text-gray-50 cursor-pointer"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
    </div>
  );
};

export default Dashboard;
