import React, { useState } from 'react';
import { Layout, X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { ScriptSection } from '../../types';
import { frameworks } from '../../data/frameworks';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Input, Textarea, Select } from '../ui';
import { generateId } from '../../lib/utils';

interface ScriptStructureProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ScriptSection[];
  onChange: (sections: ScriptSection[]) => void;
}

const SortableScriptSection = ({ 
  section, 
  onUpdate, 
  onDelete 
}: { 
  section: ScriptSection; 
  onUpdate: (id: string, field: keyof ScriptSection, value: any) => void;
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
      className={`bg-white rounded-lg border ${isDragging ? 'border-indigo-400 shadow-lg ring-1 ring-indigo-400' : 'border-gray-200'} mb-3 overflow-hidden group`}
    >
      <div className="flex bg-gray-50 border-b border-gray-100 p-2 items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-gray-200 rounded text-gray-400">
          <GripVertical size={16} />
        </div>
        <Input 
          value={section.title}
          onChange={(e) => onUpdate(section.id, 'title', e.target.value)}
          placeholder="Section Title"
          className="text-sm font-semibold border-transparent bg-transparent hover:border-gray-200 focus:bg-white h-8 flex-1"
        />
        <button 
          onClick={() => onDelete(section.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="p-3">
        <Textarea 
          value={section.content}
          onChange={(e) => onUpdate(section.id, 'content', e.target.value)}
          placeholder="Write section content here..."
          className="text-sm min-h-[80px] border-transparent hover:border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-none"
          rows={3}
        />
      </div>
    </div>
  );
};

export const ScriptStructure: React.FC<ScriptStructureProps> = ({
  isOpen,
  onClose,
  sections,
  onChange,
}) => {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('custom');

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
        title: 'New Section',
        content: '',
      }
    ]);
  };

  const updateSection = (id: string, field: keyof ScriptSection, value: any) => {
    onChange(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSection = (id: string) => {
    const filtered = sections.filter(s => s.id !== id);
    onChange(filtered.map((s, idx) => ({ ...s, order: idx })));
  };

  const applyFramework = (frameworkId: string) => {
    setSelectedFrameworkId(frameworkId);
    if (frameworkId === 'custom') return;
    
    const fw = frameworks.find(f => f.id === frameworkId);
    if (!fw) return;

    if (sections.length > 0 && sections.some(s => s.content.trim() !== '')) {
      if (!window.confirm("Applying a framework will overwrite your existing structure. Continue?")) {
        setSelectedFrameworkId('custom');
        return;
      }
    }

    const newSections = fw.sections.map((s, idx) => ({
      id: generateId(),
      title: s.title,
      content: '',
      order: idx
    }));

    onChange(newSections);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-50 border-l border-gray-200 shadow-xl flex flex-col z-40 transform transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Layout className="text-indigo-500" size={20} />
          <h2>Script Structure</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="bg-white p-4 border-b border-gray-200 z-10 flex flex-col gap-2 shadow-sm">
        <label className="text-xs font-semibold text-gray-500 uppercase">Framework</label>
        <Select 
          value={selectedFrameworkId}
          onChange={(e) => applyFramework(e.target.value)}
          className="w-full text-sm"
        >
          <option value="custom">Custom (Free-form)</option>
          {frameworks.map(fw => (
            <option key={fw.id} value={fw.id}>{fw.name}</option>
          ))}
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
              {sections.map((section) => (
                <SortableScriptSection 
                  key={section.id}
                  section={section}
                  onUpdate={updateSection}
                  onDelete={deleteSection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        <Button variant="secondary" className="w-full border-dashed border-gray-300 text-gray-600 mt-2 gap-2" onClick={addSection}>
          <Plus size={16} />
          Add Section
        </Button>
      </div>
    </div>
  );
};
