import type { MouseEvent as ReactMouseEvent } from 'react'
import { useEffect, useRef } from 'react'
import twemoji from '@twemoji/api'

export interface EmojiSticker {
  id: string
  x: number
  y: number
  widgetType: 'emoji'
  emoji: string
}

interface EmojiStickerWidgetProps {
  widget: EmojiSticker
  isSelected: boolean
  onMouseDown: (e: ReactMouseEvent<HTMLDivElement>, widget: EmojiSticker) => void
}

export function EmojiStickerWidget({ widget, isSelected, onMouseDown }: EmojiStickerWidgetProps) {
  const emojiRef = useRef<HTMLDivElement>(null)
  const size = 52

  useEffect(() => {
    if (emojiRef.current) {
      twemoji.parse(emojiRef.current, {
        folder: 'svg',
        ext: '.svg'
      })
    }
  }, [widget.emoji])

  return (
    <div
      key={widget.id}
      data-widget-id={widget.id}
      className={`sticker-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        left: widget.x,
        top: widget.y,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseDown={(e) => onMouseDown(e, widget)}
    >
      <div
        ref={emojiRef}
        className="emoji-sticker"
        style={{ 
          width: size, 
          height: size,
          fontSize: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {widget.emoji}
      </div>
    </div>
  )
}