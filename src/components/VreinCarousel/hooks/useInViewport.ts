'use client'

import { useState, useRef, useCallback } from 'react'

/**
 * Hook que observa si un elemento está al menos `threshold` visible en el viewport.
 * Usa callback ref para capturar el nodo correctamente incluso si monta después de
 * un estado de carga (evita el problema de useRef + useEffect donde ref.current es null).
 * Se desconecta automáticamente al primer disparo (triggerOnce).
 */
export function useInViewport(threshold = 0.5) {
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node || typeof IntersectionObserver === 'undefined') return

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observerRef.current?.disconnect()
          }
        },
        { threshold }
      )

      observerRef.current.observe(node)
    },
    [threshold]
  )

  return { ref, isVisible }
}
