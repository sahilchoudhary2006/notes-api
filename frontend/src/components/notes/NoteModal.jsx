import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../utils/cn';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description is too long'),
});

const NoteModal = ({ isOpen, onClose, onSubmit, isLoading, defaultValues }) => {
  const isEditing = !!defaultValues?._id;

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', description: '' }
  });

  const descriptionContent = watch('description') || '';
  const charCount = descriptionContent.length;

  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        reset({ title: defaultValues.title, description: defaultValues.description });
      } else {
        reset({ title: '', description: '' });
      }
    }
  }, [isOpen, defaultValues, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Note' : 'Create Note'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Title" 
          id="title" 
          placeholder="Note title"
          error={errors.title?.message}
          {...register('title')}
        />
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            className={cn(
              "flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none dark:border-gray-700 dark:text-gray-50 dark:focus:ring-blue-500",
              errors.description && "border-red-500 focus:ring-red-500"
            )}
            placeholder="Write your note here..."
            {...register('description')}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            ) : (
              <span /> 
            )}
            <span className={cn("text-xs", charCount > 1000 ? "text-red-500" : "text-gray-500")}>
              {charCount} / 1000
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NoteModal;
