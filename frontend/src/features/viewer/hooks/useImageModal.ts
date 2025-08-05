import { useState, useEffect, useCallback } from 'react'

interface UseImageModalParams {
  isOpen: boolean
  onClose: () => void
}

interface ImageState {
  isLoaded: boolean
  hasError: boolean
}

interface ZoomState {
  scale: number
  position: { x: number; y: number }
}

interface DragState {
  isDragging: boolean
  dragStart: { x: number; y: number }
}

interface UseImageModalReturn {
  // Image state
  imageState: ImageState
  setImageLoaded: () => void
  setImageError: () => void
  
  // Zoom functionality
  zoomState: ZoomState
  handleZoomIn: () => void
  handleZoomOut: () => void
  handleResetZoom: () => void
  handleWheel: (event: React.WheelEvent) => void
  
  // Drag functionality
  dragState: DragState
  handleMouseDown: (event: React.MouseEvent) => void
  handleMouseMove: (event: React.MouseEvent) => void
  handleMouseUp: () => void
  
  // Utility
  getZoomPercentage: () => number
  getCursorClass: () => string
}

const ZOOM_FACTOR = 1.2
const MIN_SCALE = 0.5
const MAX_SCALE = 5

export const useImageModal = ({ isOpen, onClose }: UseImageModalParams): UseImageModalReturn => {
  // Image loading state
  const [imageState, setImageState] = useState<ImageState>({
    isLoaded: false,
    hasError: false
  })

  // Zoom state
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    position: { x: 0, y: 0 }
  })

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStart: { x: 0, y: 0 }
  })

  // Reset all state when modal opens
  useEffect(() => {
    if (isOpen) {
      setImageState({ isLoaded: false, hasError: false })
      setZoomState({ scale: 1, position: { x: 0, y: 0 } })
      setDragState({ isDragging: false, dragStart: { x: 0, y: 0 } })
    }
  }, [isOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          event.preventDefault()
          handleZoomIn()
          break
        case '-':
          event.preventDefault()
          handleZoomOut()
          break
        case '0':
          event.preventDefault()
          handleResetZoom()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose])

  // Image state handlers
  const setImageLoaded = useCallback(() => {
    setImageState(prev => ({ ...prev, isLoaded: true }))
  }, [])

  const setImageError = useCallback(() => {
    setImageState(prev => ({ ...prev, hasError: true }))
  }, [])

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.min(prev.scale * ZOOM_FACTOR, MAX_SCALE)
    }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.max(prev.scale / ZOOM_FACTOR, MIN_SCALE)
    }))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoomState({ scale: 1, position: { x: 0, y: 0 } })
  }, [])

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1

    setZoomState(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * delta))
    }))
  }, [])

  // Drag handlers
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (zoomState.scale > 1) {
      setDragState({
        isDragging: true,
        dragStart: {
          x: event.clientX - zoomState.position.x,
          y: event.clientY - zoomState.position.y
        }
      })
    }
  }, [zoomState.scale, zoomState.position])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (dragState.isDragging && zoomState.scale > 1) {
      setZoomState(prev => ({
        ...prev,
        position: {
          x: event.clientX - dragState.dragStart.x,
          y: event.clientY - dragState.dragStart.y
        }
      }))
    }
  }, [dragState.isDragging, dragState.dragStart, zoomState.scale])

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }))
  }, [])

  // Utility functions
  const getZoomPercentage = useCallback(() => {
    return Math.round(zoomState.scale * 100)
  }, [zoomState.scale])

  const getCursorClass = useCallback(() => {
    if (zoomState.scale > 1 && !dragState.isDragging) return 'cursor-grab'
    if (dragState.isDragging) return 'cursor-grabbing'
    if (zoomState.scale === 1) return 'cursor-zoom-in'

    return ''
  }, [zoomState.scale, dragState.isDragging])

  return {
    // Image state
    imageState,
    setImageLoaded,
    setImageError,
    
    // Zoom functionality
    zoomState,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleWheel,
    
    // Drag functionality
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    
    // Utility
    getZoomPercentage,
    getCursorClass
  }
}