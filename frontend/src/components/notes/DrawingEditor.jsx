import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { 
  Pen, Eraser, Trash2, Undo2, Redo2, X, Palette, Maximize, Minimize
} from 'lucide-react';
import { cn } from '../../utils/cn';

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
];

const BRUSH_SIZES = [2, 4, 8, 12, 20];

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
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const autoSaveTimer = useRef(null);
  
  const handleStroke = useCallback(() => {
    setSaveStatus('saving');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    
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
    }, 1000);
  }, [drawingIndex, setValue]);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear this drawing? (You can undo this)')) {
      canvasRef.current?.clearCanvas();
      handleStroke();
    }
  };

  const handleUndo = () => { canvasRef.current?.undo(); handleStroke(); };
  const handleRedo = () => { canvasRef.current?.redo(); handleStroke(); };

  // When fullscreen, prevent body scroll
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isFullscreen]);

  return (
    <div className={cn(
      "flex flex-col transition-all duration-200",
      isFullscreen 
        ? "fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 p-4 sm:p-6" 
        : "border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-4 bg-gray-50 dark:bg-gray-800/50"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <input
          {...register(`drawings.${drawingIndex}.title`)}
          placeholder="Whiteboard Title (optional)"
          className={cn(
            "bg-transparent font-semibold focus:outline-none focus:border-b border-blue-500 w-full max-w-[300px]",
            isFullscreen ? "text-xl" : "text-sm"
          )}
        />
        <div className="flex gap-3 items-center">
          <span className="text-xs text-gray-400 font-medium">
            {saveStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
          </span>
          {!isFullscreen && (
            <button 
              type="button" 
              onClick={() => removeDrawing(drawingIndex)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Delete Whiteboard"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
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

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block"></div>

          {/* Colors */}
          <div className="flex gap-1.5 items-center">
            <Palette className="h-3 w-3 text-gray-400 mr-0.5 hidden sm:block" />
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

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block"></div>

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
                  style={{ width: size > 10 ? 12 : size + 2, height: size > 10 ? 12 : size + 2 }}
                />
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block"></div>

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
        
        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded flex items-center gap-1 font-medium text-xs transition-colors"
        >
          {isFullscreen ? (
            <><Minimize className="h-4 w-4" /> Exit Fullscreen</>
          ) : (
            <><Maximize className="h-4 w-4" /> Expand</>
          )}
        </button>
      </div>

      {/* Canvas Area with internal scrolling */}
      <div className={cn(
        "relative w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white overflow-auto",
        isFullscreen ? "flex-1 h-full" : "h-[350px]"
      )}>
        {/* We make the canvas explicitly larger than its container so you can scroll */}
        <div style={{ width: '2000px', height: '2000px', cursor: 'crosshair', touchAction: 'none' }}>
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            eraserWidth={strokeWidth * 2}
            onStroke={handleStroke}
            canvasColor="transparent"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        {/* Hidden inputs to bind react-hook-form */}
        <input type="hidden" {...register(`drawings.${drawingIndex}.data`)} />
      </div>
      
      {/* Scroll Hint */}
      <p className="text-xs text-gray-400 mt-2 text-center">
        💡 Use two fingers to pan/scroll on touch devices, or the scrollbar on desktop.
      </p>
    </div>
  );
};

export default DrawingEditor;
