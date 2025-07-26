"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT) // Tailwind's 'md' breakpoint is 768px
    }

    const onChange = () => {
      checkIsMobile()
    }
    mql.addEventListener("change", onChange)
    checkIsMobile()

    // Clean up event listener on component unmount
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return { isMobile }
}
