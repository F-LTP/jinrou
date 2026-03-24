import * as React from 'react';
import { createPortal } from 'react-dom';
import styled from '../../../util/styled';
import { PlayerInfo } from '../defs';

export interface AutocompleteItem {
  /**
   * Display text shown in the dropdown.
   */
  label: string;
  /**
   * Value to be inserted into the input.
   */
  value: string;
  /**
   * Type of the item (player or shortcut).
   */
  type: 'player' | 'shortcut';
  /**
   * Search key - what to match against (for shortcuts, this is the trigger word like "黑")
   */
  searchKey: string;
}

export interface AutocompleteProps {
  /**
   * Filtered items to display.
   */
  items: AutocompleteItem[];
  /**
   * Current search term (for highlighting).
   */
  searchTerm: string;
  /**
   * Position of the dropdown.
   */
  position: { top: number; left: number };
  /**
   * Currently selected index.
   */
  selectedIndex: number;
  /**
   * Callback when an item is selected.
   */
  onSelect: (item: AutocompleteItem) => void;
  /**
   * Callback to close the dropdown.
   */
  onClose: () => void;
}

/**
 * Autocomplete dropdown for chat input.
 */
export const AutocompleteDropdown: React.FC<AutocompleteProps> = ({
  items,
  searchTerm,
  position,
  selectedIndex,
  onSelect,
  onClose,
}) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to selected item when selectedIndex changes
  React.useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      const selectedItem = itemRefs.current[selectedIndex];
      if (selectedItem && dropdownRef.current) {
        selectedItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex, items.length]);

  // Scroll to selected item when selectedIndex changes
  React.useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      const selectedItem = itemRefs.current[selectedIndex];
      if (selectedItem && dropdownRef.current) {
        selectedItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex, items.length]);

  if (items.length === 0) {
    return null;
  }

  const content = (
    <DropdownStyle
      ref={dropdownRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="listbox"
    >
      {items.map((item, index) => (
        <ItemStyle
          key={`${item.type}-${item.value}`}
          ref={el => {
            itemRefs.current[index] = el;
          }}
          role="option"
          aria-selected={index === selectedIndex}
          selected={index === selectedIndex}
          onClick={() => onSelect(item)}
        >
          <ItemLabel>{highlightMatch(item.label, searchTerm)}</ItemLabel>
        </ItemStyle>
      ))}
    </DropdownStyle>
  );

  return createPortal(content, document.body);
};

/**
 * Highlight matching characters in the label.
 */
function highlightMatch(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm) {
    return text;
  }
  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (index === -1) {
    return text;
  }
  return (
    <>
      {text.substring(0, index)}
      <Highlight>{text.substring(index, index + searchTerm.length)}</Highlight>
      {text.substring(index + searchTerm.length)}
    </>
  );
}

const DropdownStyle = styled.div`
  position: fixed;
  z-index: 9999;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow-y: auto;
  min-width: 200px;
  font-size: 14px;
`;

const ItemStyle = styled.div<{ selected: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  ${({ selected }) =>
    selected
      ? `
    background-color: #e6f7ff;
  `
      : `
    background-color: white;

    &:hover {
      background-color: #f5f5f5;
    }
  `}
`;

const ItemLabel = styled.span`
  flex: 1;
`;

const Highlight = styled.span`
  font-weight: bold;
  background-color: #ffeb3b;
  border-radius: 2px;
  padding: 0 2px;
`;
