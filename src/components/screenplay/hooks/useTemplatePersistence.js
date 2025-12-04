import { useState, useEffect } from 'react';

export function useTemplatePersistence(defaultTemplate) {
  const [activeTemplate, setActiveTemplate] = useState(defaultTemplate);

  // 1. Load preferences on mount or when template ID changes
  useEffect(() => {
    if (!defaultTemplate) return;

    const storageKey = `typewriter_prefs_${defaultTemplate.id}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const { shortcuts, flow } = JSON.parse(savedData);

        // MERGE LOGIC:
        // We take the static default template and inject the saved values
        const mergedTemplate = {
          ...defaultTemplate,
          // 1. Override Shortcuts in the elements array
          elements: defaultTemplate.elements.map(el => ({
            ...el,
            // If a saved shortcut exists for this node, use it. Otherwise, keep default.
            shortcut: shortcuts[el.node] || el.shortcut
          })),
          // 2. Override Flow logic
          flow: flow || defaultTemplate.flow
        };

        setActiveTemplate(mergedTemplate);
      } catch (e) {
        console.error("Failed to parse saved preferences", e);
        setActiveTemplate(defaultTemplate);
      }
    } else {
      // No saved prefs? Use the default.
      setActiveTemplate(defaultTemplate);
    }
  }, [defaultTemplate]);

  // 2. Function to save new preferences
  const savePreferences = (updates) => {
    const storageKey = `typewriter_prefs_${activeTemplate.id}`;
    
    // A. Extract simple maps to save to JSON (Don't save the whole object)
    const shortcutMap = {};
    updates.elements.forEach(el => {
      shortcutMap[el.node] = el.shortcut;
    });

    const dataToSave = {
      shortcuts: shortcutMap,
      flow: updates.flow
    };

    // B. Save to Browser Storage
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));

    // C. Update State immediately so UI reflects changes
    setActiveTemplate(prev => ({
      ...prev,
      elements: updates.elements,
      flow: updates.flow
    }));
  };

  // 3. Reset to Defaults (Optional utility)
  const resetPreferences = () => {
    const storageKey = `typewriter_prefs_${activeTemplate.id}`;
    localStorage.removeItem(storageKey);
    setActiveTemplate(defaultTemplate);
  };

  return { activeTemplate, savePreferences, resetPreferences };
}