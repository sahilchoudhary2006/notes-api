import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { 
  Pen, Eraser, Trash2, Undo2, Redo2, X, Palette
} from 'lucide-react';
import { cn } from '../../utils/cn';

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
];

const BRUSH_SIZES = [2, 4, 8, 12];

const DrawingEditor = ({ 
  drawingIndex, 
  initialData, 
  register, 
  removeDrawing, 
  setValue 
}) => {
  const canvasRef = useRef(null);
  
  const [isEraser, setIsEraser] = useState(false);
  const [strokeColor, setStrokeColor] = useState(COLORS[0].value);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving'
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial data once when component mounts
  useEffect(() => {
    if (!isLoaded && canvasRef.current && initialData && initialData !== "[]") {
      try {
        const parsed = JSON.parse(initialData);
        if (parsed && parsed.length > 0) {
          canvasRef.current.loadPaths(parsed);
        }
      } catch (err) {
        console.error("Failed to load drawing paths:", err);
      }
      setIsLoaded(true);
    }
  }, [initialData, isLoaded]);

  // Autosave function (debounced)
  const autoSaveTimer = useRef(null);
  
  const handleStroke = useCallback(() => {
    setSaveStatus('saving');
    
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setTimeout(async () => {
      if (canvasRef.current) {
        try {
          const paths = await canvasRef.current.exportPaths();
          const pathsString = JSON.stringify(paths);
          setValue(`drawings.${drawingIndex}.data`, pathsString, { shouldDirty: true });
          setSaveStatus('saved');
        } catch (error) {
          console.error("Failed to export paths", error);
        }
      }
    }, 1000); // 1 second debounce
  }, [drawingIndex, setValue]);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear this drawing? (You can undo this)')) {
      canvasRef.current?.clearCanvas();
      handleStroke(); // trigger autosave
    }
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
    handleStroke();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
    handleStroke();
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4 bg-gray-50 dark:bg-gray-800/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <input
          {...register(`drawings.${drawingIndex}.title`)}
          placeholder="Whiteboard Title (optional)"
          className="bg-transparent text-sm font-semibold focus:outline-none focus:border-b border-blue-500 w-full max-w-[200px]"
        />
        <div className="flex gap-3 items-center">
          <span className="text-xs text-gray-400 font-medium">
            {saveStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
          </span>
          <button 
            type="button" 
            onClick={() => removeDrawing(drawingIndex)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Delete Whiteboard"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded p-1">
          <button
            type="button"
            onClick={() => { canvasRef.current?.eraseMode(false); setIsEraser(false); }}
            className={cn("p-1.5 rounded transition-colors", !isEraser ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600")}
            title="Pen"
          >
            <Pen className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { canvasRef.current?.eraseMode(true); setIsEraser(true); }}
            className={cn("p-1.5 rounded transition-colors", isEraser ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600")}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Colors */}
        <div className="flex gap-1 items-center">
          <Palette className="h-3 w-3 text-gray-400 mr-1" />
          {COLORS.map(c => (
            <button
              key={c.name}
              type="button"
              onClick={() => { setStrokeColor(c.value); canvasRef.current?.eraseMode(false); setIsEraser(false); }}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all",
                strokeColor === c.value && !isEraser ? "border-blue-500 scale-110" : "border-transparent opacity-80 hover:opacity-100"
              )}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Brush Sizes */}
        <div className="flex gap-1 items-center">
          {BRUSH_SIZES.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => setStrokeWidth(size)}
              className={cn(
                "w-7 h-7 rounded flex items-center justify-center transition-colors",
                strokeWidth === size ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              title={`${size}px`}
            >
              <div 
                className="bg-gray-800 dark:bg-gray-200 rounded-full" 
                style={{ width: size + 2, height: size + 2 }}
              />
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* History / Actions */}
        <div className="flex gap-1">
          <button type="button" onClick={handleUndo} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="Undo">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleRedo} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="Redo">
            <Redo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleClear} className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 ml-1" title="Clear Canvas">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[300px] border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white touch-none cursor-crosshair">
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          eraserWidth={strokeWidth * 2}
          onStroke={handleStroke}
          canvasColor="transparent"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Hidden inputs to bind react-hook-form */}
        <input type="hidden" {...register(`drawings.${drawingIndex}.data`)} />
      </div>
    </div>
  );
};

export default DrawingEditor;
