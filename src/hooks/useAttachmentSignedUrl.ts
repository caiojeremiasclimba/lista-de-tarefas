import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getAttachmentSignedUrl,
  SIGNED_URL_EXPIRES_SECONDS,
  SIGNED_URL_REFRESH_MARGIN_SECONDS,
} from '../utils/attachmentStorage'

function getRefreshDelayMs(expiresAt: number): number {
  const refreshAt = expiresAt - SIGNED_URL_REFRESH_MARGIN_SECONDS * 1000
  return Math.max(refreshAt - Date.now(), 0)
}

export function useAttachmentSignedUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const pathRef = useRef(path)
  pathRef.current = path

  const expiresAtRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const scheduleRefreshRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    if (!path) {
      setUrl(null)
      setLoading(false)
      setError(false)
      expiresAtRef.current = null
      retryCountRef.current = 0
      scheduleRefreshRef.current = null
      clearTimer()
      return
    }

    let cancelled = false

    const scheduleRefresh = () => {
      clearTimer()
      const expiresAt = expiresAtRef.current
      if (!expiresAt) return

      timerRef.current = setTimeout(() => {
        if (!cancelled && pathRef.current === path) {
          void fetchUrl(true)
        }
      }, getRefreshDelayMs(expiresAt))
    }

    scheduleRefreshRef.current = scheduleRefresh

    const fetchUrl = async (silent: boolean) => {
      if (!silent) {
        setLoading(true)
        setError(false)
      }

      try {
        const signedUrl = await getAttachmentSignedUrl(path)
        if (cancelled || pathRef.current !== path) return

        setUrl(signedUrl)
        setError(false)
        retryCountRef.current = 0
        expiresAtRef.current = Date.now() + SIGNED_URL_EXPIRES_SECONDS * 1000
        scheduleRefresh()
      } catch {
        if (cancelled || pathRef.current !== path) return
        if (!silent) setError(true)
      } finally {
        if (!cancelled && pathRef.current === path && !silent) {
          setLoading(false)
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || pathRef.current !== path) return

      const expiresAt = expiresAtRef.current
      if (!expiresAt) return

      const refreshThreshold = expiresAt - SIGNED_URL_REFRESH_MARGIN_SECONDS * 1000
      if (Date.now() >= refreshThreshold) {
        void fetchUrl(true)
      }
    }

    void fetchUrl(false)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      scheduleRefreshRef.current = null
      clearTimer()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [path])

  const retry = useCallback(() => {
    const currentPath = pathRef.current
    if (!currentPath || retryCountRef.current >= 1) return

    retryCountRef.current += 1

    void (async () => {
      try {
        const signedUrl = await getAttachmentSignedUrl(currentPath)
        if (pathRef.current !== currentPath) return

        setUrl(signedUrl)
        setError(false)
        retryCountRef.current = 0
        expiresAtRef.current = Date.now() + SIGNED_URL_EXPIRES_SECONDS * 1000
        scheduleRefreshRef.current?.()
      } catch {
        if (pathRef.current !== currentPath) return
        setError(true)
      }
    })()
  }, [])

  const openInNewTab = useCallback(async () => {
    const currentPath = pathRef.current
    if (!currentPath) return

    try {
      const signedUrl = await getAttachmentSignedUrl(currentPath)
      if (pathRef.current !== currentPath) return
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setError(true)
    }
  }, [])

  return { url, loading, error, retry, openInNewTab }
}
