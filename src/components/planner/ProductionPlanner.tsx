import React from 'react';
import { Clapperboard, X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { ProductionSection } from '../../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Input, Textarea } from '../ui';
import { generateId } from '../../lib/utils';

interface ProductionPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ProductionSection[];
  onChange: (sections: ProductionSection[]) => void;
}

const SortableSection = ({ 
  section, 
  index, 
  onUpdate, 
  onDelete 
}: { 
  section: ProductionSection; 
  index: number; 
  onUpdate: (id: string, field: keyof ProductionSection, value: any) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white rounded-lg border ${isDragging ? 'border-blue-400 shadow-lg ring-1 ring-blue-400' : 'border-gray-200'} mb-3 overflow-hidden`}
    >
      <div className="flex bg-gray-50 border-b border-gray-100 p-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-gray-200 rounded text-gray-400">
            <GripVertical size={16} />
          </div>
          <span className="text-xs font-semibold text-gray-500 uppercase">Scene {index + 1}</span>
        </div>
        <button 
          onClick={() => onDelete(section.id)}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="p-3 flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Visual / B-Roll</label>
          <Textarea 
            value={section.visual}
            onChange={(e) => onUpdate(section.id, 'visual', e.target.value)}
            placeholder="What should be shown on screen?"
            className="text-sm min-h-[60px]"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Voiceover</label>
          <Textarea 
            value={section.voiceover}
            onChange={(e) => onUpdate(section.id, 'voiceover', e.target.value)}
            placeholder="What the creator says..."
            className="text-sm min-h-[60px]"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">On-Screen Text</label>
            <Input 
              value={section.onScreenText || ''}
              onChange={(e) => onUpdate(section.id, 'onScreenText', e.target.value)}
              placeholder="Text shown..."
              className="text-sm h-8"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Duration (s)</label>
            <Input 
              type="number"
              min={0}
              value={section.duration || ''}
              onChange={(e) => onUpdate(section.id, 'duration', Number(e.target.value) || 0)}
              className="text-sm h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductionPlanner: React.FC<ProductionPlannerProps> = ({
  isOpen,
  onClose,
  sections,
  onChange,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!isOpen) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      
      const newSections = arrayMove(sections, oldIndex, newIndex).map((s, index) => ({
        ...s,
        order: index
      }));
      
      onChange(newSections);
    }
  };

  const addSection = () => {
    onChange([
      ...sections,
      {
        id: generateId(),
        order: sections.length,
        visual: '',
        voiceover: '',
        onScreenText: '',
        duration: 3,
      }
    ]);
  };

  const updateSection = (id: string, field: keyof ProductionSection, value: any) => {
    onChange(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSection = (id: string) => {
    const filtered = sections.filter(s => s.id !== id);
    onChange(filtered.map((s, idx) => ({ ...s, order: idx })));
  };

  const totalDuration = sections.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col w-full bg-gray-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Clapperboard className="text-purple-500 w-4 h-4" />
          <h2 className="text-sm font-bold">Production Plan (B-Roll)</h2>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white p-3 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Est. Duration</span>
          <span className="text-lg font-bold text-gray-900">{formatTime(totalDuration)}</span>
        </div>
        <Button size="sm" onClick={addSection} className="gap-1">
          <Plus size={16} />
          Add Scene
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
              {sections.map((section, index) => (
                <SortableSection 
                  key={section.id}
                  section={section}
                  index={index}
                  onUpdate={updateSection}
                  onDelete={deleteSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {sections.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            No scenes added yet. Click "Add Scene" to start planning your visuals.
          </div>
        )}
      </div>
    </div>
  );
};
