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
  width?: number
  height?: number
}

interface TextWidgetProps {
  widget: TextLabel
  isSelected: boolean
  onMouseDown: (e: ReactMouseEvent<HTMLDivElement>, widget: TextLabel) => void
  onDoubleClick: (id: string) => void
  onTextChange: (id: string, newText: string) => void
  onTextBlur: (id: string) => void
  onResize?: (id: string, width: number, height: number) => void
}

export function TextWidget({
  widget,
  isSelected,
  onMouseDown,
  onDoubleClick,
  onTextChange,
  onTextBlur,
  onResize
}: TextWidgetProps) {
  const spanRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const handleResizeMouseDown = (e: ReactMouseEvent<HTMLDivElement>, direction: 'se' | 'ne' | 'sw' | 'nw') => {
    e.stopPropagation()
    e.preventDefault()

    const startX = e.clientX
    const startY = e.clientY
    const startWidth = widget.width || containerRef.current?.offsetWidth || 200
    const startHeight = widget.height || containerRef.current?.offsetHeight || 60

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight

      if (direction === 'se') {
        newWidth = Math.max(50, startWidth + deltaX)
        newHeight = Math.max(30, startHeight + deltaY)
      } else if (direction === 'ne') {
        newWidth = Math.max(50, startWidth + deltaX)
        newHeight = Math.max(30, startHeight - deltaY)
      } else if (direction === 'sw') {
        newWidth = Math.max(50, startWidth - deltaX)
        newHeight = Math.max(30, startHeight + deltaY)
      } else if (direction === 'nw') {
        newWidth = Math.max(50, startWidth - deltaX)
        newHeight = Math.max(30, startHeight - deltaY)
      }

      if (onResize) {
        onResize(widget.id, newWidth, newHeight)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={containerRef}
      key={widget.id}
      data-widget-id={widget.id}
      className={`text-label ${widget.fontFamily === 'Great Vibes' ? 'font-great-vibes' : ''} ${isSelected ? 'selected' : ''}`}
      style={{
        left: widget.x,
        top: widget.y,
        transform: 'translate(-50%, -50%)',
        fontFamily: widget.fontFamily,
        width: widget.width ? `${widget.width}px` : 'fit-content',
        height: widget.height ? `${widget.height}px` : 'auto',
        overflow: 'hidden'
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
          whiteSpace: widget.width ? 'pre-wrap' : 'pre',
          outline: 'none',
          wordWrap: 'break-word',
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      {isSelected && !widget.isEditing && (
        <>
          <div 
            className="resize-handle resize-handle-se"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div 
            className="resize-handle resize-handle-ne"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div 
            className="resize-handle resize-handle-sw"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div 
            className="resize-handle resize-handle-nw"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
        </>
      )}
    </div>
  )
}
