import { useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react'
import stampEmpty from './assets/stamp-empty.svg'
import iconToolbarSticker from './assets/icon-toolbar-sticker.svg'
import iconToolbarStamp from './assets/icon-toolbar-stamp.svg'
import iconToolbarText from './assets/icon-toolbar-text.svg'
import stampChoco from './assets/stamps/stamp-choco.svg'
import stampCloud from './assets/stamps/stamp-cloud.svg'
import stampForest from './assets/stamps/stamp-forest.svg'
import stampItaly from './assets/stamps/stamp-italy.svg'
import stampMountain from './assets/stamps/stamp-mountain.svg'
import stampPiggy from './assets/stamps/stamp-piggy.svg'
import './PostcardEditor.css'

interface TextLabel {
  id: string
  x: number
  y: number
  text: string
  isEditing: boolean
  fontFamily: string
}

interface Mark {
  id: string
  x: number
  y: number
  type: 'sticker' | 'stamp'
}

const markIconMeta: Record<Mark['type'], { src: string; label: string }> = {
  sticker: { src: iconToolbarSticker, label: 'Sticker' },
  stamp: { src: iconToolbarStamp, label: 'Stamp' }
}

interface DragState {
  itemId: string
  itemType: 'text' | 'mark'
  startX: number
  startY: number
  initialX: number
  initialY: number
}

interface SelectedWidget {
  id: string
  type: 'text' | 'mark'
}

interface FontOption {
  id: string
  label: string
  family: string
  sampleText: string
}

const fontOptions: FontOption[] = [
  { id: 'playwrite', label: 'Playwrite US Modern', family: 'Playwrite US Modern', sampleText: 'Warm hello' },
  { id: 'poppins', label: 'Poppins', family: 'Poppins', sampleText: 'Little note' },
  { id: 'great-vibes', label: 'Great Vibes', family: 'Great Vibes', sampleText: 'Sending love' }
];

interface StampOption {
  id: string
  label: string
  src: string
}

const stampOptions: StampOption[] = [
  { id: 'piggy', label: 'Piggy', src: stampPiggy },
  { id: 'cloud', label: 'Cloud', src: stampCloud },
  { id: 'choco', label: 'Chocolate', src: stampChoco },
  { id: 'forest', label: 'Forest', src: stampForest },
  { id: 'italy', label: 'Italy', src: stampItaly },
  { id: 'mountain', label: 'Mountain', src: stampMountain }
];

function PostcardEditor() {
  const [textLabels, setTextLabels] = useState<TextLabel[]>([])
  const [marks, setMarks] = useState<Mark[]>([])
  const [selectedMarkType, setSelectedMarkType] = useState<'sticker' | 'stamp'>('sticker')
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [selectedWidget, setSelectedWidget] = useState<SelectedWidget | null>(null)
  const [isFontMenuOpen, setFontMenuOpen] = useState(false)
  const [stampDropdownOpen, setStampDropdownOpen] = useState(false)
  const [stampPlaceholderSrc, setStampPlaceholderSrc] = useState(stampEmpty)
  const [isStampAnimating, setStampAnimating] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fontPickerRef = useRef<HTMLDivElement>(null)
  const stampButtonRef = useRef<HTMLButtonElement>(null)
  const stampDropdownRef = useRef<HTMLDivElement>(null)

  const addTextLabel = (
    fontFamily = 'Unbounded',
    text = 'Double click to edit',
    position?: { x: number; y: number }
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const newLabel: TextLabel = {
      id: `text-${Date.now()}`,
      x: position?.x ?? rect.width / 2,
      y: position?.y ?? rect.height / 2,
      text,
      isEditing: false,
      fontFamily
    }
    setTextLabels(labels => [...labels, newLabel])
  }

  const addMark = (type?: Mark['type']) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const newMark: Mark = {
      id: `mark-${Date.now()}`,
      x: rect.width / 2,
      y: rect.height / 2,
      type: type ?? selectedMarkType
    }
    setMarks([...marks, newMark])
  }

  const handleFontOptionSelect = (option: FontOption) => {
    addTextLabel(option.family, option.sampleText)
    setFontMenuOpen(false)
  }

  const handleFontDragStart = (option: FontOption, event: ReactDragEvent<HTMLButtonElement>) => {
    event.dataTransfer?.setData('application/json', JSON.stringify({
      family: option.family,
      text: option.sampleText
    }))
    event.dataTransfer?.setData('text/plain', option.sampleText)
    event.dataTransfer.effectAllowed = 'copy'
    setFontMenuOpen(false)
  }

  const handleStampSelect = (option: StampOption) => {
    setStampPlaceholderSrc(option.src)
    setStampDropdownOpen(false)
    setSelectedMarkType('sticker')
  }

  useEffect(() => {
    const animationDuration = 400
    setStampAnimating(true)
    const timeoutId = window.setTimeout(() => setStampAnimating(false), animationDuration)
    return () => window.clearTimeout(timeoutId)
  }, [stampPlaceholderSrc])

  const handleCanvasDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleCanvasDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const data = event.dataTransfer.getData('application/json')
    if (!data) return
    let payload: { family: string; text: string }
    try {
      payload = JSON.parse(data)
    } catch {
      return
    }

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    addTextLabel(payload.family, payload.text, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontPickerRef.current && !fontPickerRef.current.contains(event.target as Node)) {
        setFontMenuOpen(false)
      }
      if (
        stampDropdownOpen &&
        stampDropdownRef.current &&
        !stampDropdownRef.current.contains(event.target as Node) &&
        stampButtonRef.current &&
        !stampButtonRef.current.contains(event.target as Node)
      ) {
        setStampDropdownOpen(false)
        setSelectedMarkType('sticker')
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [stampDropdownOpen])

  const handleTextMouseDown = (e: ReactMouseEvent<HTMLDivElement>, label: TextLabel) => {
    if (label.isEditing) return

    e.stopPropagation()
    setSelectedWidget({ id: label.id, type: 'text' })
    setDragState({
      itemId: label.id,
      itemType: 'text',
      startX: e.clientX,
      startY: e.clientY,
      initialX: label.x,
      initialY: label.y
    })
  }

  const handleMarkMouseDown = (e: ReactMouseEvent<HTMLDivElement>, mark: Mark) => {
    e.stopPropagation()
    setSelectedWidget({ id: mark.id, type: 'mark' })
    setDragState({
      itemId: mark.id,
      itemType: 'mark',
      startX: e.clientX,
      startY: e.clientY,
      initialX: mark.x,
      initialY: mark.y
    })
  }

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragState) return

    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY

    if (dragState.itemType === 'text') {
      setTextLabels(labels =>
        labels.map(label =>
          label.id === dragState.itemId
            ? { ...label, x: dragState.initialX + deltaX, y: dragState.initialY + deltaY }
            : label
        )
      )
    } else if (dragState.itemType === 'mark') {
      setMarks(currentMarks =>
        currentMarks.map(mark =>
          mark.id === dragState.itemId
            ? { ...mark, x: dragState.initialX + deltaX, y: dragState.initialY + deltaY }
            : mark
        )
      )
    }
  }

  const handleMouseUp = () => {
    setDragState(null)
  }

  const handleTextDoubleClick = (labelId: string) => {
    setTextLabels(labels =>
      labels.map(label =>
        label.id === labelId ? { ...label, isEditing: true } : label
      )
    )
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleTextChange = (labelId: string, newText: string) => {
    setTextLabels(labels =>
      labels.map(label =>
        label.id === labelId ? { ...label, text: newText } : label
      )
    )
  }

  const handleTextBlur = (labelId: string) => {
    setTextLabels(labels =>
      labels.map(label =>
        label.id === labelId ? { ...label, isEditing: false } : label
      )
    )
  }

  const handleCanvasClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    setFontMenuOpen(false)
    // Only deselect if clicking directly on the canvas, not on widgets
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.postcard-border')) {
      setSelectedWidget(null)
    }
  }

  const handleDeleteWidget = () => {
    if (!selectedWidget) return

    if (selectedWidget.type === 'text') {
      setTextLabels(labels => labels.filter(label => label.id !== selectedWidget.id))
    } else if (selectedWidget.type === 'mark') {
      setMarks(currentMarks => currentMarks.filter(mark => mark.id !== selectedWidget.id))
    }
    setSelectedWidget(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Delete (Windows/Linux) or Backspace (Mac Delete key)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if we're editing text
        const isEditingText = textLabels.some(label => label.isEditing)
        if (!isEditingText) {
          e.preventDefault()
          handleDeleteWidget()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedWidget, textLabels])

  /** WTF IS HERE?? */
  const renderMark = (mark: Mark) => {
    const size = 52
    const icon = markIconMeta[mark.type]
    if (!icon) return null

    return (
      <img
        src={icon.src}
        alt={`${icon.label} mark`}
        className="mark-icon"
        style={{ width: size, height: size }}
        draggable={false}
      />
    )
  }

  return (
    <div className="postcard-editor">
      <div className="header">
        <h1>Postcard Builder</h1>
        <p>Create a beautiful postcard, add your message, and share it with someone special</p>
      </div>

      <div
        ref={canvasRef}
        className="canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onDragOver={handleCanvasDragOver}
        onDrop={handleCanvasDrop}
      >
        <div className="postcard-border">
          <div className="postcard-content">
            <div className="postcard-left" />
            <div className="postcard-divider" />
            <div className="postcard-right">
              <img
                src={stampPlaceholderSrc}
                alt="Stamp placeholder"
                className={`stamp-placeholder ${isStampAnimating ? 'animate' : ''}`}
                draggable="false"
              />
              <div className="address-lines">
                <div className="address-line" />
                <div className="address-line" />
                <div className="address-line" />
                <div className="address-line" />
              </div>
            </div>
          </div>
        </div>

        {textLabels.map(label => (
          <div
            key={label.id}
            className={`text-label ${selectedWidget?.id === label.id && selectedWidget?.type === 'text' ? 'selected' : ''}`}
            style={{
              left: label.x,
              top: label.y,
              transform: 'translate(-50%, -50%)',
              fontFamily: label.fontFamily
            }}
            onMouseDown={(e) => handleTextMouseDown(e, label)}
            onDoubleClick={() => handleTextDoubleClick(label.id)}
          >
            {label.isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={label.text}
                onChange={(e) => handleTextChange(label.id, e.target.value)}
                onBlur={() => handleTextBlur(label.id)}
                className="text-input"
                style={{ fontFamily: label.fontFamily }}
                size={Math.max(label.text.length || 1, 1)}
              />
            ) : (
              <span>{label.text}</span>
            )}
          </div>
        ))}

        {marks.map(mark => (
          <div
            key={mark.id}
            className={`mark-wrapper ${selectedWidget?.id === mark.id && selectedWidget?.type === 'mark' ? 'selected' : ''}`}
            style={{
              left: mark.x,
              top: mark.y,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={(e) => handleMarkMouseDown(e, mark)}
          >
            {renderMark(mark)}
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div className="font-picker" ref={fontPickerRef}>
          <button
            type="button"
            className={`toolbar-button ${isFontMenuOpen ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setFontMenuOpen(open => !open)
            }}
            title="Add text"
            aria-label="Add text"
          >
            <img src={iconToolbarText} alt="" className="toolbar-icon" />
          </button>
          {isFontMenuOpen && (
            <div className="font-dropdown">
              {fontOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className="font-dropdown-item"
                  onClick={() => handleFontOptionSelect(option)}
                  draggable
                  onDragStart={(event) => handleFontDragStart(option, event)}
                >
                  <span className="font-option-name" style={{ fontFamily: option.family }}>
                    {option.sampleText}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mark-picker">
          <button
            ref={stampButtonRef}
            className={`toolbar-button ${selectedMarkType === 'stamp' ? 'active' : ''}`}
            onClick={(event) => {
              event.stopPropagation()
              setStampDropdownOpen(prev => {
                const next = !prev
                setSelectedMarkType(next ? 'stamp' : 'sticker')
                return next
              })
            }}
            title="Select stamp"
            aria-label="Select stamp"
          >
            <img src={iconToolbarStamp} alt="" className="toolbar-icon" />
          </button>
          {stampDropdownOpen && (
            <div className="stamp-dropdown" ref={stampDropdownRef} aria-hidden="true">
              {stampOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className="stamp-option"
                  onClick={() => handleStampSelect(option)}
                  aria-label={option.label}
                >
                  <img src={option.src} alt={option.label} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mark-picker">
          <button
            className={`toolbar-button ${selectedMarkType === 'sticker' ? 'active' : ''}`}
            onClick={(event) => {
              event.stopPropagation()
              setSelectedMarkType('sticker')
              addMark('sticker')
            }}
            title="Add sticker"
            aria-label="Add sticker"
          >
            <img src={iconToolbarSticker} alt="" className="toolbar-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostcardEditor
