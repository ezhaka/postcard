import { useRef } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

export interface TextLabel {
  id: string
  x: number
  y: number
  widgetType: 'text'
  text: string
  isEditing: boolean
  fontFamily: string
}

interface TextWidgetProps {
  widget: TextLabel
  isSelected: boolean
  onMouseDown: (e: ReactMouseEvent<HTMLDivElement>, widget: TextLabel) => void
  onDoubleClick: (id: string) => void
  onTextChange: (id: string, newText: string) => void
  onTextBlur: (id: string) => void
}

export function TextWidget({
  widget,
  isSelected,
  onMouseDown,
  onDoubleClick,
  onTextChange,
  onTextBlur
}: TextWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      key={widget.id}
      className={`text-label ${widget.fontFamily === 'Great Vibes' ? 'font-great-vibes' : ''} ${isSelected ? 'selected' : ''}`}
      style={{
        left: widget.x,
        top: widget.y,
        transform: 'translate(-50%, -50%)',
        fontFamily: widget.fontFamily
      }}
      onMouseDown={(e) => onMouseDown(e, widget)}
      onDoubleClick={() => onDoubleClick(widget.id)}
    >
      {widget.isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={widget.text}
          onChange={(e) => {
            onTextChange(widget.id, e.target.value)
            // Dynamically adjust size to prevent cropping
            if (inputRef.current) {
              inputRef.current.size = Math.max(e.target.value.length || 1, 1)
            }
          }}
          onBlur={() => onTextBlur(widget.id)}
          className="text-input"
          style={{ fontFamily: widget.fontFamily }}
          size={Math.max(widget.text.length || 1, 1)}
          autoFocus
        />
      ) : (
        <span>{widget.text}</span>
      )}
    </div>
  )
}
