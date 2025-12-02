import { useRef, useEffect } from 'react'
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
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (widget.isEditing && spanRef.current) {
      // Focus the contenteditable span
      spanRef.current.focus()

      // Move cursor to the end
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(spanRef.current)
      range.collapse(false) // false = collapse to end
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [widget.isEditing])

  // Update the span content only when not editing
  useEffect(() => {
    const isEditing = widget.isEditing
    if (spanRef.current && !isEditing) {
      spanRef.current.textContent = widget.text || ' '
    }
  }, [widget.text, widget.isEditing])

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const newText = e.currentTarget.textContent || ''
    onTextChange(widget.id, newText)
  }

  const handleBlur = () => {
    onTextBlur(widget.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onTextBlur(widget.id)
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onTextBlur(widget.id)
    }
  }

  return (
    <div
      key={widget.id}
      data-widget-id={widget.id}
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
      <span
        ref={spanRef}
        contentEditable={widget.isEditing}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          whiteSpace: 'pre',
          outline: 'none'
        }}
      />
    </div>
  )
}
