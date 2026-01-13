import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import html2canvas from 'html2canvas'
import { TextWidget, type TextLabel } from './TextWidget'
import { StickerWidget, type Sticker } from './StickerWidget'
import { DropdownMenu, DropdownTrigger } from './DropdownMenu'
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
import borderTile from './assets/border-tile.svg'
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
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [selectedWidget, setSelectedWidget] = useState<SelectedWidget | null>(null)

  const [stampPlaceholderSrc, setStampPlaceholderSrc] = useState(stampEmpty)

  const canvasRef = useRef<HTMLDivElement>(null)
  const screenshotContainerRef = useRef<HTMLDivElement>(null)

  // Get the postcard border element to get canvas bounds
  const getCanvasBounds = () => {
    const postcardBorder = document.querySelector('.postcard-border') as HTMLElement
    if (!postcardBorder) return null
    const rect = postcardBorder.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }

  // Constrain a position to stay within canvas bounds
  const constrainPosition = (x: number, y: number, widgetType: Widget['widgetType'], widgetId?: string): { x: number; y: number } => {
    const bounds = getCanvasBounds()
    if (!bounds) return { x, y }

    let widgetWidth = 52 // Default for stickers
    let widgetHeight = 52

    // Try to get actual widget dimensions from DOM
    if (widgetId) {
      const widgetElement = document.querySelector(`[data-widget-id="${widgetId}"]`) as HTMLElement
      if (widgetElement) {
        const rect = widgetElement.getBoundingClientRect()
        widgetWidth = rect.width
        widgetHeight = rect.height
      } else {
        // Fallback: use estimates based on widget type
        if (widgetType === 'text') {
          widgetWidth = 200 // Conservative estimate for text width
          widgetHeight = 60 // Conservative estimate for text height
        }
      }
    } else {
      // Fallback when widget doesn't exist yet (e.g., when adding)
      if (widgetType === 'text') {
        widgetWidth = 200
        widgetHeight = 60
      }
    }

    const padding = 10 // Padding from edges
    const minX = padding + widgetWidth / 2
    const maxX = bounds.width - padding - widgetWidth / 2
    const minY = padding + widgetHeight / 2
    const maxY = bounds.height - padding - widgetHeight / 2

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    }
  }

  const addWidget = (widget: Widget) => {
    setWidgets(widgets => ({ ...widgets, [widget.id]: widget }))
  }

  const handleStickerSelect = (option: StickerOption) => {
    const bounds = getCanvasBounds()
    if (!bounds) return

    const centerX = bounds.width / 2
    const centerY = bounds.height / 2
    const constrained = constrainPosition(centerX, centerY, 'sticker')

    addWidget({
      id: `sticker-${Date.now()}`,
      widgetType: 'sticker',
      x: constrained.x,
      y: constrained.y,
      stickerSrc: option.src
    })
  }

  const handleFontOptionSelect = (option: FontOption) => {
    const bounds = getCanvasBounds()
    if (!bounds) return

    const centerX = bounds.width / 2
    const centerY = bounds.height / 2
    const constrained = constrainPosition(centerX, centerY, 'text')

    addWidget({
      id: `text-${Date.now()}`,
      widgetType: 'text',
      x: constrained.x,
      y: constrained.y,
      text: option.sampleText,
      isEditing: false,
      fontFamily: option.family
    })
  }

  const handleStampSelect = (option: StampOption) => {
    setStampPlaceholderSrc(option.src)
  }

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

    const newX = dragState.initialX + deltaX
    const newY = dragState.initialY + deltaY
    const constrained = constrainPosition(newX, newY, dragState.itemType, dragState.itemId)

    setWidgets(widgets => ({
      ...widgets,
      [dragState.itemId]: {
        ...widgets[dragState.itemId],
        x: constrained.x,
        y: constrained.y
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

  const handleTextResize = (labelId: string, width: number, height: number) => {
    const widget = widgets[labelId]
    if (widget && widget.widgetType === 'text') {
      setWidgets(widgets => ({
        ...widgets,
        [labelId]: { ...widget, width, height }
      }))
    }
  }


  // Handle clicks outside the canvas to deselect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas || !selectedWidget) return
  
      const target = e.target as Node
      
      // Check if click is outside canvas
      const isOutsideCanvas = !canvas.contains(target)
      
      // Check if click is on canvas background (not on widgets)
      const isOnCanvasBackground = canvas.contains(target) && 
        (target === canvas || (target as HTMLElement).closest?.('.postcard-border'))
      
      if (isOutsideCanvas || isOnCanvasBackground) {
        // Don't deselect if we're editing text
        const isEditingText = Object.values(widgets).some(
          widget => widget.widgetType === 'text' && widget.isEditing
        )
        if (!isEditingText) {
          setSelectedWidget(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [selectedWidget, widgets])

  const handleDeleteWidget = () => {
    if (!selectedWidget) return

    setWidgets(widgets => {
      const { [selectedWidget.id]: _, ...rest } = widgets
      return rest
    })
    setSelectedWidget(null)
  }
  // Test SVG - bright and visible to verify it appears in the PNG
  const MADE_IN_MATTER_SVG = `
    <svg width="143" height="18" viewBox="0 0 143 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.4156 6.14C10.9756 6.14 11.4656 6.2675 11.8856 6.5225C12.3056 6.7725 12.6281 7.125 12.8531 7.58C13.0831 8.035 13.1981 8.56 13.1981 9.155V14H11.6231V9.3275C11.6231 8.7525 11.4831 8.305 11.2031 7.985C10.9231 7.665 10.5331 7.505 10.0331 7.505C9.65807 7.505 9.32807 7.595 9.04307 7.775C8.76307 7.955 8.54557 8.2125 8.39057 8.5475C8.24057 8.8775 8.16557 9.265 8.16557 9.71V14H6.61307V9.3275C6.61307 8.7525 6.47307 8.305 6.19307 7.985C5.91307 7.665 5.52307 7.505 5.02307 7.505C4.64807 7.505 4.31807 7.595 4.03307 7.775C3.75307 7.955 3.53557 8.2125 3.38057 8.5475C3.23057 8.8775 3.15557 9.265 3.15557 9.71V14H1.58057V6.32H3.11057V7.4075C3.36557 7.0025 3.69057 6.69 4.08557 6.47C4.48057 6.25 4.92807 6.14 5.42807 6.14C5.98807 6.14 6.47557 6.27 6.89057 6.53C7.31057 6.79 7.63057 7.155 7.85057 7.625C8.11557 7.155 8.46807 6.79 8.90807 6.53C9.34807 6.27 9.85057 6.14 10.4156 6.14ZM18.3365 6.14C18.9315 6.14 19.459 6.25 19.919 6.47C20.379 6.69 20.7365 6.9975 20.9915 7.3925C21.2515 7.7875 21.3815 8.24 21.3815 8.75V14H19.859V12.935C19.594 13.33 19.2465 13.6375 18.8165 13.8575C18.3865 14.0725 17.9015 14.18 17.3615 14.18C16.8615 14.18 16.414 14.0875 16.019 13.9025C15.624 13.7125 15.314 13.45 15.089 13.115C14.869 12.775 14.759 12.3925 14.759 11.9675C14.759 11.5575 14.8615 11.185 15.0665 10.85C15.2715 10.51 15.5565 10.2325 15.9215 10.0175C16.2915 9.7975 16.7115 9.665 17.1815 9.62L19.3265 9.4025C19.4815 9.3875 19.604 9.3225 19.694 9.2075C19.789 9.0875 19.8365 8.925 19.8365 8.72C19.8315 8.32 19.6865 8 19.4015 7.76C19.1215 7.515 18.7515 7.3925 18.2915 7.3925C17.8215 7.3925 17.4315 7.5125 17.1215 7.7525C16.8165 7.9875 16.644 8.3 16.604 8.69H15.0665C15.1115 8.195 15.279 7.755 15.569 7.37C15.864 6.98 16.2515 6.6775 16.7315 6.4625C17.2115 6.2475 17.7465 6.14 18.3365 6.14ZM17.834 12.9875C18.214 12.9875 18.5565 12.905 18.8615 12.74C19.1665 12.575 19.404 12.3475 19.574 12.0575C19.749 11.7675 19.8365 11.44 19.8365 11.075V10.3475L17.5115 10.595C17.1715 10.635 16.889 10.77 16.664 11C16.439 11.225 16.3265 11.495 16.3265 11.81C16.3265 12.04 16.389 12.245 16.514 12.425C16.644 12.605 16.8215 12.745 17.0465 12.845C17.2765 12.94 17.539 12.9875 17.834 12.9875ZM30.7996 6.32H30.8071V14H29.2771V12.8C28.9721 13.24 28.5896 13.58 28.1296 13.82C27.6746 14.06 27.1671 14.18 26.6071 14.18C25.9171 14.18 25.2971 14.01 24.7471 13.67C24.1971 13.325 23.7646 12.8475 23.4496 12.2375C23.1396 11.6275 22.9846 10.935 22.9846 10.16C22.9846 9.385 23.1396 8.6925 23.4496 8.0825C23.7646 7.4725 24.1971 6.9975 24.7471 6.6575C25.2971 6.3125 25.9171 6.14 26.6071 6.14C27.1671 6.14 27.6746 6.26 28.1296 6.5C28.5896 6.74 28.9721 7.08 29.2771 7.52V7.5125L29.2321 3.5H30.7996V6.32ZM26.8921 12.8C27.3321 12.8 27.7296 12.69 28.0846 12.47C28.4396 12.245 28.7196 11.9325 28.9246 11.5325C29.1296 11.1325 29.2321 10.675 29.2321 10.16C29.2321 9.645 29.1296 9.1875 28.9246 8.7875C28.7196 8.3875 28.4396 8.0775 28.0846 7.8575C27.7296 7.6325 27.3321 7.52 26.8921 7.52C26.4571 7.52 26.0671 7.6325 25.7221 7.8575C25.3771 8.0775 25.1071 8.3875 24.9121 8.7875C24.7171 9.1875 24.6196 9.645 24.6196 10.16C24.6196 10.675 24.7171 11.1325 24.9121 11.5325C25.1071 11.9325 25.3771 12.245 25.7221 12.47C26.0671 12.69 26.4571 12.8 26.8921 12.8ZM40.0511 10.5125H34.0586C34.0936 10.9875 34.2136 11.405 34.4186 11.765C34.6236 12.12 34.8936 12.395 35.2286 12.59C35.5686 12.785 35.9561 12.8825 36.3911 12.8825C36.6861 12.8825 36.9661 12.8375 37.2311 12.7475C37.4961 12.6525 37.7236 12.525 37.9136 12.365C38.1086 12.205 38.2411 12.025 38.3111 11.825H39.8786C39.7936 12.27 39.5811 12.6725 39.2411 13.0325C38.9061 13.3875 38.4811 13.6675 37.9661 13.8725C37.4561 14.0775 36.9061 14.18 36.3161 14.18C35.5861 14.18 34.9261 14.005 34.3361 13.655C33.7461 13.305 33.2836 12.825 32.9486 12.215C32.6136 11.6 32.4461 10.915 32.4461 10.16C32.4461 9.405 32.6136 8.7225 32.9486 8.1125C33.2836 7.4975 33.7461 7.015 34.3361 6.665C34.9261 6.315 35.5861 6.14 36.3161 6.14C37.0361 6.14 37.6786 6.3125 38.2436 6.6575C38.8136 6.9975 39.2561 7.4725 39.5711 8.0825C39.8911 8.6925 40.0511 9.385 40.0511 10.16V10.5125ZM36.3161 7.3925C35.7211 7.3925 35.2261 7.575 34.8311 7.94C34.4361 8.3 34.1886 8.795 34.0886 9.425H38.4461C38.3511 8.78 38.1186 8.28 37.7486 7.925C37.3786 7.57 36.9011 7.3925 36.3161 7.3925ZM46.5882 14H45.0132V6.32H46.5882V14ZM44.9757 5.0975V3.5H46.6182V5.0975H44.9757ZM52.7364 6.14C53.3114 6.14 53.8114 6.265 54.2364 6.515C54.6614 6.765 54.9889 7.1175 55.2189 7.5725C55.4489 8.0275 55.5639 8.555 55.5639 9.155V14H53.9889V9.32C53.9889 8.745 53.8439 8.2975 53.5539 7.9775C53.2639 7.6575 52.8589 7.4975 52.3389 7.4975C51.9489 7.4975 51.6089 7.5875 51.3189 7.7675C51.0289 7.9425 50.8039 8.195 50.6439 8.525C50.4889 8.85 50.4114 9.235 50.4114 9.68V14H48.8364V6.32H50.3664V7.3625C50.6214 6.9675 50.9489 6.665 51.3489 6.455C51.7539 6.245 52.2164 6.14 52.7364 6.14Z" fill="#AFAFCB"/>
      <path d="M72.0228 0.677734C73.3196 0.677734 74.4187 2.25795 74.8041 4.44733C75.2619 2.33082 76.3279 0.840842 77.6966 0.709796C79.7671 0.511693 81.7468 3.49828 82.1182 7.3804C82.4896 11.2625 81.1122 14.5702 79.0417 14.7683C77.0485 14.9589 75.1395 12.1979 74.6685 8.52792C74.1979 10.381 73.1904 11.6618 72.0228 11.6618C70.9003 11.6617 69.926 10.4777 69.4343 8.73953C68.9182 12.3037 67.0444 14.9555 65.0896 14.7683C63.0192 14.57 61.642 11.2622 62.0137 7.38011C62.3855 3.49802 64.3655 0.51182 66.4359 0.710088C67.7592 0.836894 68.7992 2.23386 69.2804 4.23922C69.6971 2.15854 70.7675 0.677818 72.0228 0.677734Z" fill="url(#paint0_linear_14515_15741)" fill-opacity="0.6"/>
      <path d="M87.6367 1.59082H89.9501L94.1718 11.2314L94.3968 11.8975L94.6129 11.2314L98.7445 1.59082H101.103V14.1929H99.2846V4.69633L99.2936 4.34527L95.0899 14.1929H93.6587L89.437 4.40828L89.446 4.69633V14.1929H87.6367V1.59082Z" fill="#AFAFCB"/>
      <path d="M107.49 4.75934C108.223 4.75934 108.859 4.89136 109.399 5.1554C109.939 5.41945 110.353 5.79751 110.641 6.28959C110.929 6.78167 111.073 7.36376 111.073 8.03587V14.1929H109.336V12.9237C109.048 13.3977 108.661 13.7638 108.175 14.0218C107.688 14.2799 107.13 14.4089 106.5 14.4089C105.912 14.4089 105.384 14.2949 104.916 14.0669C104.448 13.8328 104.082 13.5118 103.818 13.1037C103.554 12.6956 103.422 12.2366 103.422 11.7265C103.422 11.2284 103.548 10.7723 103.8 10.3583C104.052 9.93818 104.403 9.59313 104.853 9.32308C105.303 9.05304 105.813 8.88801 106.383 8.828L108.733 8.55796C109.039 8.52795 109.234 8.35993 109.318 8.05388V7.83784C109.318 7.34576 109.153 6.9557 108.823 6.66765C108.493 6.3796 108.046 6.23558 107.481 6.23558C107.103 6.23558 106.77 6.29559 106.482 6.41561C106.194 6.52963 105.966 6.68565 105.798 6.88368C105.63 7.07572 105.525 7.28575 105.483 7.51379H103.746C103.818 6.9977 104.019 6.52963 104.349 6.10956C104.679 5.68949 105.114 5.35944 105.654 5.1194C106.194 4.87936 106.806 4.75934 107.49 4.75934ZM105.222 11.5825C105.222 11.8585 105.297 12.1045 105.447 12.3206C105.597 12.5366 105.804 12.7046 106.068 12.8247C106.338 12.9447 106.647 13.0047 106.995 13.0047C107.451 13.0047 107.854 12.9117 108.202 12.7256C108.556 12.5336 108.829 12.2696 109.021 11.9335C109.219 11.5915 109.318 11.1954 109.318 10.7453V9.71015L106.734 10.0072C106.29 10.0552 105.927 10.2292 105.645 10.5293C105.363 10.8233 105.222 11.1744 105.222 11.5825Z" fill="#AFAFCB"/>
      <path d="M116.821 14.1929C116.353 14.1929 115.933 14.0939 115.561 13.8958C115.189 13.6978 114.898 13.4248 114.688 13.0767C114.478 12.7286 114.373 12.3356 114.373 11.8975L114.364 6.50562H112.744L112.753 4.97537H113.761C113.983 4.97537 114.163 4.90636 114.301 4.76834C114.445 4.62432 114.517 4.43829 114.517 4.21025V2.72501H116.119V4.97537H118.595L118.586 6.50562H116.11L116.119 11.7175C116.119 11.9875 116.209 12.2126 116.389 12.3926C116.569 12.5726 116.791 12.6626 117.055 12.6626H118.586V14.1929H116.821Z" fill="#AFAFCB"/>
      <path d="M123.854 14.1929C123.386 14.1929 122.966 14.0939 122.594 13.8958C122.221 13.6978 121.93 13.4248 121.72 13.0767C121.51 12.7286 121.405 12.3356 121.405 11.8975L121.396 6.50562H119.776L119.785 4.97537H120.793C121.015 4.97537 121.195 4.90636 121.333 4.76834C121.477 4.62432 121.549 4.43829 121.549 4.21025V2.72501H123.152V4.97537H125.627L125.618 6.50562H123.143L123.152 11.7175C123.152 11.9875 123.242 12.2126 123.422 12.3926C123.602 12.5726 123.824 12.6626 124.088 12.6626H125.618V14.1929H123.854Z" fill="#AFAFCB"/>
      <path d="M131.59 14.4089C130.708 14.4089 129.91 14.2019 129.196 13.7878C128.482 13.3737 127.921 12.7977 127.513 12.0595C127.105 11.3214 126.901 10.4903 126.901 9.56612C126.901 8.65997 127.105 7.84084 127.513 7.10872C127.927 6.3766 128.491 5.80351 129.205 5.38944C129.925 4.96937 130.72 4.75934 131.59 4.75934C132.478 4.75934 133.268 4.96337 133.958 5.37144C134.654 5.7735 135.194 6.3406 135.578 7.07272C135.962 7.80484 136.154 8.63897 136.154 9.57512V9.98919H128.683C128.737 10.5773 128.89 11.0934 129.142 11.5374C129.4 11.9755 129.736 12.3146 130.15 12.5546C130.57 12.7886 131.05 12.9057 131.59 12.9057C132.1 12.9057 132.556 12.8067 132.959 12.6086C133.361 12.4106 133.688 12.1285 133.94 11.7625H135.848C135.506 12.5846 134.96 13.2327 134.21 13.7068C133.466 14.1749 132.592 14.4089 131.59 14.4089ZM134.336 8.72899C134.198 7.96686 133.883 7.36376 133.391 6.91969C132.905 6.47562 132.304 6.25358 131.59 6.25358C130.834 6.25358 130.201 6.47562 129.691 6.91969C129.187 7.36376 128.866 7.96686 128.728 8.72899H134.336Z" fill="#AFAFCB"/>
      <path d="M138.239 4.97537H139.985V6.43361C140.273 5.93553 140.645 5.55447 141.101 5.29042C141.563 5.02638 142.085 4.89436 142.667 4.89436H143.001V6.69465L142.523 6.68565C142.007 6.68565 141.557 6.78467 141.173 6.9827C140.795 7.17473 140.501 7.45078 140.291 7.81084C140.087 8.17089 139.985 8.59396 139.985 9.08004V14.1929H138.239V4.97537Z" fill="#AFAFCB"/>
      <defs>
      <linearGradient id="paint0_linear_14515_15741" x1="61.9531" y1="0.677734" x2="61.9531" y2="14.7636" gradientUnits="userSpaceOnUse">
      <stop stop-color="#C3C3FF"/>
      <stop offset="1" stop-color="#1A1ABC"/>
      </linearGradient>
      </defs>
    </svg>
  `

  const handleDownload = async () => {
    const container = screenshotContainerRef.current
    if (!container) return

    try {
      const canvasElement = await html2canvas(container, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('.screenshot-container') as HTMLElement
          const clonedCanvas = clonedDoc.querySelector('.canvas') as HTMLElement
          const clonedPostcardBorder = clonedDoc.querySelector('.postcard-border') as HTMLElement

          if (clonedCanvas && clonedContainer) {
            const postcardRight = clonedDoc.querySelector('.postcard-right') as HTMLElement
            
            if (postcardRight) {
              const wrapper = clonedDoc.createElement('div')
              
              // Get the position of postcard-right relative to the canvas
              const canvasRect = clonedCanvas.getBoundingClientRect()
              const postcardRightRect = postcardRight.getBoundingClientRect()
              
              // Calculate center position
              const svgWidth = 143 // SVG width from viewBox
            
              const centerX = postcardRightRect.left - canvasRect.left + postcardRightRect.width / 2 - svgWidth / 2
              
              wrapper.style.position = 'absolute'
              wrapper.style.left = `${centerX}px`
              wrapper.style.bottom = `20px`
              
              wrapper.innerHTML = MADE_IN_MATTER_SVG
              clonedCanvas.appendChild(wrapper)
            }
            
            (clonedPostcardBorder as HTMLElement).style.border = '1px solid rgba(126, 126, 190, 0.20)';
          }
        }
      })
      const url = canvasElement.toDataURL('image/png')
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
      // ESC key to deselect
      if (e.key === 'Escape') {
          e.preventDefault()
          setSelectedWidget(null)
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
        ref={screenshotContainerRef}
        className="screenshot-container"
      >
        <div
          ref={canvasRef}
          className="canvas"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="postcard-border" style={{ backgroundImage: `url(${borderTile})` }}>
            <div className="postcard-content">
              <div className="postcard-left" />
              <div className="postcard-divider" />
              <div className="postcard-right">

                <img
                  src={stampPlaceholderSrc}
                  alt="Stamp placeholder"
                  className="stamp-placeholder"
                  draggable="false"
                />

                <div className="address-lines">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="address-line" />
                  ))}
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
                  onResize={handleTextResize}
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
      </div>
      <div className="toolbar-container">
        <div className="toolbar">
          <DropdownMenu
            className="font-picker"
            items={fontOptions}
            onItemSelect={handleFontOptionSelect}
            gridColumns={3}
            gap="0"
            renderItem={(option) => (
              <button type="button" className="font-dropdown-item">
                <span className="font-option-name" style={{ fontFamily: option.family }}>
                  {option.sampleText}
                </span>
              </button>
            )}
            trigger={(isOpen, toggleOpen) => (
              <DropdownTrigger
                isOpen={isOpen}
                toggleOpen={toggleOpen}
                iconSrc={iconToolbarText}
                title="Add text"
                ariaLabel="Add text"
              />
            )}
          />
          <DropdownMenu
            className="widget-picker"
            items={stampOptions}
            onItemSelect={handleStampSelect}
            gridColumns={3}
            gap="1rem"
            renderItem={(option) => (
              <button type="button" className="stamp-option" aria-label={option.label}>
                <img src={option.src} alt={option.label} />
              </button>
            )}
            trigger={(isOpen, toggleOpen) => (
              <DropdownTrigger
                isOpen={isOpen}
                toggleOpen={toggleOpen}
                iconSrc={iconToolbarStamp}
                title="Select stamp"
                ariaLabel="Select stamp"
              />
            )}
          />
          <DropdownMenu
            className="widget-picker"
            items={stickerOptions}
            onItemSelect={handleStickerSelect}
            gridColumns={6}
            renderItem={(option) => (
              <button type="button" className="sticker-option" aria-label={option.label}>
                <img src={option.src} alt={option.label} />
              </button>
            )}
            trigger={(isOpen, toggleOpen) => (
              <DropdownTrigger
                isOpen={isOpen}
                toggleOpen={toggleOpen}
                iconSrc={iconToolbarSticker}
                title="Add sticker"
                ariaLabel="Add sticker"
              />
            )}
          />
        </div>
        <div className="footer">
         <img src={madeInMatter} alt="Made in Matter" className="made-in-matter" />
        </div>  
      </div>

    </div>
  )
}

export default PostcardEditor
