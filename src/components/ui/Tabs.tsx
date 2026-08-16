import React, { createContext, useContext, useState, useRef, KeyboardEvent } from 'react';

interface TabsContextType {
  activeTab: number;
  setActiveTab: (index: number) => void;
  tabCount: number;
  registerTab: () => number;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabGroup: React.FC<{ children: React.ReactNode; defaultIndex?: number; onChange?: (index: number) => void; className?: string }> = ({
  children,
  defaultIndex = 0,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTabState] = useState(defaultIndex);
  const tabCountRef = useRef(0);

  const setActiveTab = (index: number) => {
    setActiveTabState(index);
    onChange?.(index);
  };

  const registerTab = () => {
    const index = tabCountRef.current;
    tabCountRef.current += 1;
    return index;
  };

  // Reset tab count on each render so we can dynamically add/remove tabs if needed (simple implementation)
  tabCountRef.current = 0;

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, tabCount: 0, registerTab }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-4 border-b border-gray-200 ${className}`} role="tablist" aria-orientation="horizontal">
      {children}
    </div>
  );
};

export const Tab: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within a TabGroup');

  const { activeTab, setActiveTab, registerTab } = context;
  
  // Use a ref to store the index so it doesn't change on re-renders if we were doing dynamic tabs,
  // but for a simple implementation, registerTab during render is okay if children are stable.
  const [index] = useState(() => registerTab());
  const isActive = activeTab === index;
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const tabList = buttonRef.current?.parentElement;
    if (!tabList) return;
    
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
    const currentIndex = tabs.indexOf(buttonRef.current as HTMLButtonElement);
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      tabs[nextIndex]?.focus();
      tabs[nextIndex]?.click();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      tabs[prevIndex]?.focus();
      tabs[prevIndex]?.click();
    }
  };

  return (
    <button
      ref={buttonRef}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setActiveTab(index)}
      onKeyDown={handleKeyDown}
      className={`
        px-3 py-2.5 text-sm font-medium transition-all duration-200 relative whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t-lg
        ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
        ${className}
      `}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-600 rounded-t-full layout-indicator" />
      )}
    </button>
  );
};

export const TabPanels: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`pt-4 ${className}`}>{children}</div>;
};

export const TabPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within a TabGroup');
  
  // We need a separate way to index panels.
  // For simplicity in this implementation, we map based on position in children if they are an array.
  // A better way is using Context for panels too, but since React.Children.map is common here:
  return <div className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg ${className}`} role="tabpanel" tabIndex={0}>{children}</div>;
};

// To make TabPanel work seamlessly with just children mapping, we'll override TabPanels to clone children with active state
export const TabPanelsContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanels must be used within a TabGroup');

  const { activeTab } = context;

  return (
    <div className={`pt-4 ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (index === activeTab) {
          return child;
        }
        return null;
      })}
    </div>
  );
};

// Replace TabPanels with the container that handles indexing
export { TabPanelsContainer as TabPanelsGroup };
