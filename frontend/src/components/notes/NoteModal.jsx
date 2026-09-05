import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../utils/cn';
import { Plus, Trash2, CheckSquare, List as ListIcon, ArrowUp, ArrowDown, PenTool } from 'lucide-react';
import DrawingEditor from './DrawingEditor';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(5000, 'Description is too long').optional().default(""),
  lists: z.array(z.object({
    title: z.string().optional(),
    type: z.enum(['checklist', 'bullet']).default('checklist'),
    items: z.array(z.object({
      text: z.string().min(1, "Item cannot be empty"),
      completed: z.boolean().default(false)
    }))
  })).optional().default([]),
  drawings: z.array(z.object({
    title: z.string().optional(),
    data: z.string().optional().default("[]")
  })).optional().default([])
});

const ListEditor = ({ listIndex, control, register, removeList, watch, setValue }) => {
  const { fields: itemFields, append: appendItem, remove: removeItem, move: moveItem } = useFieldArray({
    control,
    name: `lists.${listIndex}.items`
  });
  
  const listType = watch(`lists.${listIndex}.type`);
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newItemText.trim()) {
        appendItem({ text: newItemText.trim(), completed: false });
        setNewItemText('');
      }
    }
  };

  const handleAddButtonClick = () => {
    if (newItemText.trim()) {
      appendItem({ text: newItemText.trim(), completed: false });
      setNewItemText('');
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between mb-3">
        <input
          {...register(`lists.${listIndex}.title`)}
          placeholder="List Title (optional)"
          className="bg-transparent text-sm font-semibold focus:outline-none focus:border-b border-blue-500 w-full max-w-[200px]"
        />
        <div className="flex gap-2 items-center text-gray-500">
          <span className="text-xs uppercase bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
            {listType}
          </span>
          <button 
            type="button" 
            onClick={() => removeList(listIndex)}
            className="hover:text-red-500 transition-colors p-1"
            title="Delete List"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {itemFields.map((item, itemIndex) => (
          <div key={item.id} className="flex items-center gap-2 group">
            {listType === 'checklist' ? (
              <button
                type="button"
                onClick={() => setValue(`lists.${listIndex}.items.${itemIndex}.completed`, !watch(`lists.${listIndex}.items.${itemIndex}.completed`))}
                className={cn(
                  "flex-shrink-0 h-4 w-4 rounded flex items-center justify-center border transition-colors",
                  watch(`lists.${listIndex}.items.${itemIndex}.completed`)
                    ? "bg-blue-500 border-blue-500 text-white" 
                    : "border-gray-400 bg-white dark:bg-gray-900"
                )}
              >
                {watch(`lists.${listIndex}.items.${itemIndex}.completed`) && <CheckSquare className="h-3 w-3" />}
              </button>
            ) : (
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-600 dark:bg-gray-400 mx-1" />
            )}
            
            <input
              {...register(`lists.${listIndex}.items.${itemIndex}.text`)}
              className={cn(
                "flex-1 bg-transparent text-sm focus:outline-none focus:border-b border-blue-500 py-1",
                listType === 'checklist' && watch(`lists.${listIndex}.items.${itemIndex}.completed`) ? "line-through text-gray-400" : ""
              )}
            />

            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
              <button
                type="button"
                disabled={itemIndex === 0}
                onClick={() => moveItem(itemIndex, itemIndex - 1)}
                className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-gray-400"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={itemIndex === itemFields.length - 1}
                onClick={() => moveItem(itemIndex, itemIndex + 1)}
                className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-gray-400"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(itemIndex)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleAddItem}
            placeholder={listType === 'checklist' ? "Add a task (press Enter)" : "Add an item (press Enter)"}
            className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none py-1.5 px-2"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddButtonClick}>
          Add
        </Button>
      </div>
    </div>
  );
};

const NoteModal = ({ isOpen, onClose, onSubmit, isLoading, defaultValues }) => {
  const isEditing = !!defaultValues?._id;

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: '', description: '', lists: [], drawings: [] }
  });

  const { fields: listFields, append: appendList, remove: removeList } = useFieldArray({
    control,
    name: 'lists'
  });

  const { fields: drawingFields, append: appendDrawing, remove: removeDrawing } = useFieldArray({
    control,
    name: 'drawings'
  });

  const descriptionContent = watch('description') || '';
  const charCount = descriptionContent.length;

  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        const defaultLists = defaultValues.lists ? defaultValues.lists.map(list => ({
          ...list,
          items: list.items || []
        })) : [];
        const defaultDrawings = defaultValues.drawings ? defaultValues.drawings.map(d => ({
          ...d,
          data: d.data || "[]"
        })) : [];
        reset({ title: defaultValues.title, description: defaultValues.description || '', lists: defaultLists, drawings: defaultDrawings });
      } else {
        reset({ title: '', description: '', lists: [], drawings: [] });
      }
    }
  }, [isOpen, defaultValues, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Note' : 'Create Note'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 pb-2">
        <Input 
          label="Title" 
          id="title" 
          placeholder="Note title"
          error={errors.title?.message}
          {...register('title')}
        />
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            className={cn(
              "flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-y dark:border-gray-700 dark:text-gray-50 dark:focus:ring-blue-500",
              errors.description && "border-red-500 focus:ring-red-500"
            )}
            placeholder="Write your note here..."
            {...register('description')}
          />
          <div className="flex justify-end items-center mt-1">
            <span className={cn("text-xs", charCount > 5000 ? "text-red-500" : "text-gray-500")}>
              {charCount} / 5000
            </span>
          </div>
        </div>

        {/* Content Blocks Section */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Blocks
            </label>
            <div className="flex flex-wrap gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => appendList({ title: '', type: 'checklist', items: [] })}
                className="text-xs py-1 h-auto"
              >
                <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                Checklist
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => appendList({ title: '', type: 'bullet', items: [] })}
                className="text-xs py-1 h-auto"
              >
                <ListIcon className="h-3.5 w-3.5 mr-1.5" />
                Bullets
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => appendDrawing({ title: '', data: '[]' })}
                className="text-xs py-1 h-auto"
              >
                <PenTool className="h-3.5 w-3.5 mr-1.5" />
                Whiteboard
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {listFields.map((listField, index) => (
              <ListEditor
                key={listField.id}
                listIndex={index}
                control={control}
                register={register}
                removeList={removeList}
                watch={watch}
                setValue={setValue}
              />
            ))}
            
            {drawingFields.map((drawingField, index) => (
              <DrawingEditor
                key={drawingField.id}
                drawingIndex={index}
                initialData={drawingField.data}
                register={register}
                removeDrawing={removeDrawing}
                setValue={setValue}
              />
            ))}
            
            {listFields.length === 0 && drawingFields.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 text-sm">
                No blocks added yet. Use the buttons above to add lists or whiteboards.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-3 mt-4">
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
