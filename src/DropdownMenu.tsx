import { useState, useRef, useEffect, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react'
import './DropdownMenu.css'

interface DropdownTriggerProps {
  isOpen: boolean
  toggleOpen: () => void
  iconSrc: string
  title: string
  ariaLabel: string
}

export function DropdownTrigger({ isOpen, toggleOpen, iconSrc, title, ariaLabel }: DropdownTriggerProps) {
  return (
    <button
      type="button"
      className={`toolbar-button ${isOpen ? 'active' : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        toggleOpen()
      }}
      title={title}
      aria-label={ariaLabel}
    >
      <img src={iconSrc} alt="" className="toolbar-icon" />
    </button>
  )
}

interface DropdownMenuProps<T> {
  trigger: (isOpen: boolean, toggleOpen: () => void) => ReactNode
  items: T[]
  onItemSelect: (item: T) => void
  renderItem: (item: T) => ReactNode
  gridColumns: number
  gap?: string
  className?: string
}

export function DropdownMenu<T>({
  trigger,
  items,
  onItemSelect,
  renderItem,
  gridColumns,
  gap = '0.5rem',
  className
}: DropdownMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleOpen = () => setIsOpen(prev => !prev)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleItemClick = (event: ReactMouseEvent, item: T) => {
    event.stopPropagation()
    onItemSelect(item)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={className}>
      {trigger(isOpen, toggleOpen)}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="dropdown-menu-container"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, auto)`,
            gap
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="dropdown-menu-item"
              onClick={(e) => handleItemClick(e, item)}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
