import type { MouseEvent as ReactMouseEvent } from 'react'

export interface Sticker {
  id: string
  x: number
  y: number
  widgetType: 'sticker'
  stickerSrc: string
}

interface StickerWidgetProps {
  widget: Sticker
  isSelected: boolean
  onMouseDown: (e: ReactMouseEvent<HTMLDivElement>, widget: Sticker) => void
}

export function StickerWidget({ widget, isSelected, onMouseDown }: StickerWidgetProps) {
  const size = 52

  return (
    <div
      key={widget.id}
      className={`sticker-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        left: widget.x,
        top: widget.y,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseDown={(e) => onMouseDown(e, widget)}
    >
      <img
        src={widget.stickerSrc}
        alt="Sticker"
        className="sticker-icon"
        style={{ width: size, height: size }}
        draggable={false}
      />
    </div>
  )
}
