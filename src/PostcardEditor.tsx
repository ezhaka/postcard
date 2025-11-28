import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import html2canvas from 'html2canvas'
import { TextWidget, type TextLabel } from './TextWidget'
import { StickerWidget, type Sticker } from './StickerWidget'
import stampEmpty from './assets/stamp-empty.svg'
import iconToolbarSticker from './assets/icon-toolbar-sticker.svg'
import iconToolbarStamp from './assets/icon-toolbar-stamp.svg'
import iconToolbarText from './assets/icon-toolbar-text.svg'
import iconDownload from './assets/icon-download.svg'
import stampChoco from './assets/stamps/stamp-choco.svg'
import stampChristmas from './assets/stamps/stamp-christmas.svg'
import stampCloud from './assets/stamps/stamp-cloud.svg'
import stampItaly from './assets/stamps/stamp-italy.svg'
import stampMountain from './assets/stamps/stamp-mountain.svg'
import stampPiggy from './assets/stamps/stamp-piggy.svg'
import madeInMatter from './assets/made-in-matter.svg'
import stickerFire from './assets/stickers/fire.svg'
import stickerFireworks from './assets/stickers/fireworks.svg'
import stickerFlash from './assets/stickers/flash.svg'
import stickerHeart from './assets/stickers/heart.svg'
import stickerKiss from './assets/stickers/kiss.svg'
import stickerMail from './assets/stickers/mail.svg'
import stickerSend from './assets/stickers/send.svg'
import stickerShine from './assets/stickers/shine.svg'
import stickerSmile from './assets/stickers/smile.svg'
import stickerSmileyBlessed from './assets/stickers/smiley-blessed--Streamline-Freehand.svg'
import stickerSun from './assets/stickers/sun.svg'
import stickerThumbsup from './assets/stickers/thumbsup.svg'
import './PostcardEditor.css'

type Widget = TextLabel | Sticker

interface DragState {
  itemId: string
  itemType: Widget['widgetType']
  // TODO?: What's the difference between startX and initialX?
  startX: number
  startY: number
  initialX: number
  initialY: number
}

interface SelectedWidget {
  id: string
  type: Widget['widgetType']
}

interface FontOption {
  id: string
  label: string
  family: string
  sampleText: string
}

const fontOptions: FontOption[] = [
  { id: 'playwrite', label: 'Playwrite US Modern', family: 'Playwrite US Modern, Playpen Sans', sampleText: 'Warm hello' },
  { id: 'poppins', label: 'Poppins', family: 'Poppins, Noto Sans', sampleText: 'Little note' },
  { id: 'great-vibes', label: 'Great Vibes', family: 'Great Vibes', sampleText: 'Sending love' }
];

// TODO: rename to StampType
interface StampOption {
  id: string
  label: string
  src: string
}

const stampOptions: StampOption[] = [
  { id: 'piggy', label: 'Piggy', src: stampPiggy },
  { id: 'cloud', label: 'Cloud', src: stampCloud },
  { id: 'choco', label: 'Chocolate', src: stampChoco },
  { id: 'italy', label: 'Italy', src: stampItaly },
  { id: 'mountain', label: 'Mountain', src: stampMountain },
  { id: 'christmas', label: 'Christmas', src: stampChristmas }
];

// TODO: rename to StickerType
interface StickerOption {
  id: string
  label: string
  src: string
}

const stickerOptions: StickerOption[] = [
  { id: 'fire', label: 'Fire', src: stickerFire },
  { id: 'heart', label: 'Heart', src: stickerHeart },

  { id: 'flash', label: 'Flash', src: stickerFlash },
  { id: 'fireworks', label: 'Fireworks', src: stickerFireworks },
  { id: 'sun', label: 'Sun', src: stickerSun },

  { id: 'mail', label: 'Mail', src: stickerMail },
  { id: 'send', label: 'Send', src: stickerSend },
  { id: 'shine', label: 'Shine', src: stickerShine },
  { id: 'smile', label: 'Smile', src: stickerSmile },
  { id: 'smiley-blessed', label: 'Smiley Blessed', src: stickerSmileyBlessed },
  { id: 'kiss', label: 'Kiss', src: stickerKiss },
  { id: 'thumbsup', label: 'Thumbs Up', src: stickerThumbsup }
];

function PostcardEditor() {
  const [widgets, setWidgets] = useState<Record<string, Widget>>({})
  // TODO?: if we have drag state as a state (you know), why do we need to pass the same info inside the drag event, unpack it and parse it? Can we store it as a react state instead?
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [selectedWidget, setSelectedWidget] = useState<SelectedWidget | null>(null)

  // TODO: introduce a component for menu, manage open state inside it; incapsulate the logic about outside clicks in this common component too
  const [isFontMenuOpen, setFontMenuOpen] = useState(false)
  const [stampDropdownOpen, setStampDropdownOpen] = useState(false)
  const [stickerDropdownOpen, setStickerDropdownOpen] = useState(false)

  const [stampPlaceholderSrc, setStampPlaceholderSrc] = useState(stampEmpty)
  const [isStampAnimating, setStampAnimating] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const fontPickerRef = useRef<HTMLDivElement>(null)
  const stampButtonRef = useRef<HTMLButtonElement>(null)
  const stampDropdownRef = useRef<HTMLDivElement>(null)
  const stickerDropdownRef = useRef<HTMLDivElement>(null)

  const addWidget = (widget: Widget) => {
    setWidgets(widgets => ({ ...widgets, [widget.id]: widget }))
  }

  const handleStickerSelect = (option: StickerOption) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    addWidget({
      id: `sticker-${Date.now()}`,
      widgetType: 'sticker',
      x: rect.width / 2,
      y: rect.height / 2,
      stickerSrc: option.src
    })

    setStickerDropdownOpen(false)
  }

  const handleFontOptionSelect = (option: FontOption) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()

    addWidget({
      id: `text-${Date.now()}`,
      widgetType: 'text',
      x: rect.width / 2,
      y: rect.height / 2,
      text: option.sampleText,
      isEditing: false,
      fontFamily: option.family
    })

    setFontMenuOpen(false)
  }

  const handleStampSelect = (option: StampOption) => {
    setStampPlaceholderSrc(option.src)
    setStampDropdownOpen(false)
  }

  useEffect(() => {
    const animationDuration = 400
    setStampAnimating(true)
    const timeoutId = window.setTimeout(() => setStampAnimating(false), animationDuration)
    return () => window.clearTimeout(timeoutId)
  }, [stampPlaceholderSrc])


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
      }
      if (
        stickerDropdownOpen &&
        stickerDropdownRef.current &&
        !stickerDropdownRef.current.contains(event.target as Node)
      ) {
        setStickerDropdownOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [stampDropdownOpen, stickerDropdownOpen])

  const handleWidgetMouseDown = (e: ReactMouseEvent<HTMLDivElement>, widget: Widget) => {
    // Don't start drag if editing text
    if (widget.widgetType === 'text' && widget.isEditing) return

    e.stopPropagation()
    setSelectedWidget({ id: widget.id, type: widget.widgetType })
    setDragState({
      itemId: widget.id,
      itemType: widget.widgetType,
      startX: e.clientX,
      startY: e.clientY,
      initialX: widget.x,
      initialY: widget.y
    })
  }

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragState) return

    const deltaX = e.clientX - dragState.startX
    const deltaY = e.clientY - dragState.startY

    setWidgets(widgets => ({
      ...widgets,
      [dragState.itemId]: {
        ...widgets[dragState.itemId],
        x: dragState.initialX + deltaX,
        y: dragState.initialY + deltaY
      }
    }))
  }

  const handleMouseUp = () => {
    setDragState(null)
  }

  const handleTextDoubleClick = (labelId: string) => {
    const widget = widgets[labelId]
    if (widget && widget.widgetType === 'text') {
      setWidgets(widgets => ({
        ...widgets,
        [labelId]: { ...widget, isEditing: true }
      }))
    }
  }

  const handleTextChange = (labelId: string, newText: string) => {
    const widget = widgets[labelId]
    if (widget && widget.widgetType === 'text') {
      setWidgets(widgets => ({
        ...widgets,
        [labelId]: { ...widget, text: newText }
      }))
    }
  }

  const handleTextBlur = (labelId: string) => {
    const widget = widgets[labelId]
    if (widget && widget.widgetType === 'text') {
      setWidgets(widgets => ({
        ...widgets,
        [labelId]: { ...widget, isEditing: false }
      }))
    }
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

    setWidgets(widgets => {
      const { [selectedWidget.id]: _, ...rest } = widgets
      return rest
    })
    setSelectedWidget(null)
  }

  const handleDownload = async () => {
    const postcardBorder = document.querySelector('.postcard-border') as HTMLElement
    if (!postcardBorder) return

    try {
      const canvas = await html2canvas(postcardBorder, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure the border is visible in the cloned document
          const clonedBorder = clonedDoc.querySelector('.postcard-border') as HTMLElement
          if (clonedBorder) {
            // Force the border to be visible
            clonedBorder.style.boxShadow = '2px 2px 8px rgba(126, 126, 190, 0.15)'
          }
        }
      })
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'postcard.png'
      link.href = url
      link.click()
    } catch (error) {
      console.error('Failed to download postcard:', error)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Delete (Windows/Linux) or Backspace (Mac Delete key)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Don't delete if we're editing text
        const isEditingText = Object.values(widgets).some(
          widget => widget.widgetType === 'text' && widget.isEditing
        )
        if (!isEditingText) {
          e.preventDefault()
          handleDeleteWidget()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedWidget, widgets])

  return (
    <div className="postcard-editor">
      <div className="header">
        <h1>Postcard Builder</h1>
        <p>Create a beautiful postcard, add your message, and share it with someone special</p>
        <button
          type="button"
          className="download-button"
          onClick={handleDownload}
          title="Download postcard"
          aria-label="Download postcard"
        >
          <img src={iconDownload} alt="" className="download-icon" />
          <span>Download</span>
        </button>
      </div>

      <div
        ref={canvasRef}
        className="canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <div className="postcard-border">
          <div className="postcard-content">
            <div className="postcard-left" />
            <div className="postcard-divider" />
            <div className="postcard-right">

              {/* TODO: extract stamp into a component together with isStampAnimating logic */}
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

        {Object.values(widgets).map(widget => {
          if (widget.widgetType === 'text') {
            return (
              <TextWidget
                key={widget.id}
                widget={widget}
                isSelected={selectedWidget?.id === widget.id && selectedWidget?.type === 'text'}
                onMouseDown={handleWidgetMouseDown}
                onDoubleClick={handleTextDoubleClick}
                onTextChange={handleTextChange}
                onTextBlur={handleTextBlur}
              />
            )
          } else {
            return (
              <StickerWidget
                key={widget.id}
                widget={widget}
                isSelected={selectedWidget?.id === widget.id && selectedWidget?.type === 'sticker'}
                onMouseDown={handleWidgetMouseDown}
              />
            )
          }
        })}
      </div>
      <div className="toolbar-container">
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
                  >
                    <span className="font-option-name" style={{ fontFamily: option.family }}>
                      {option.sampleText}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="widget-picker">
            <button
              ref={stampButtonRef}
              className={`toolbar-button ${stampDropdownOpen ? 'active' : ''}`}
              onClick={(event) => {
                event.stopPropagation()
                setStampDropdownOpen(prev => !prev)
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
          <div className="widget-picker">
            <button
              className={`toolbar-button ${stickerDropdownOpen ? 'active' : ''}`}
              onClick={(event) => {
                event.stopPropagation()
                setStickerDropdownOpen(prev => !prev)
              }}
              title="Add sticker"
              aria-label="Add sticker"
            >
              <img src={iconToolbarSticker} alt="" className="toolbar-icon" />
            </button>
            {stickerDropdownOpen && (
              <div className="sticker-dropdown" ref={stickerDropdownRef} aria-hidden="true">
                {stickerOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className="sticker-option"
                    onClick={() => handleStickerSelect(option)}
                    aria-label={option.label}
                  >
                    <img src={option.src} alt={option.label} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="footer">
         <img src={madeInMatter} alt="Made in Matter" className="made-in-matter" />
        </div>  
      </div>

    </div>
  )
}

export default PostcardEditor
