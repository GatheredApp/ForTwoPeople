import { describe, expect, it } from 'vitest'
import {
  INSTALL_PROMPT_DISMISSAL_MS,
  hasActiveInstallDismissal,
  isIOS,
  isStandalone,
  shouldShowInstallPrompt,
} from './install'

describe('install prompt utilities', () => {
  it('detects standard and iOS standalone modes', () => {
    expect(isStandalone({ displayModeStandalone: true })).toBe(true)
    expect(isStandalone({ displayModeStandalone: false, navigatorStandalone: true })).toBe(true)
    expect(isStandalone({ displayModeStandalone: false, navigatorStandalone: false })).toBe(false)
  })

  it('detects iOS and touch-based iPadOS devices', () => {
    expect(isIOS({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', platform: 'iPhone', maxTouchPoints: 5 })).toBe(true)
    expect(isIOS({ userAgent: 'Mozilla/5.0 (Macintosh)', platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true)
    expect(isIOS({ userAgent: 'Mozilla/5.0 (Linux; Android 15)', platform: 'Linux armv8l', maxTouchPoints: 5 })).toBe(false)
  })

  it('keeps a dismissal active for 14 days and then expires it', () => {
    const now = 2_000_000_000_000
    expect(hasActiveInstallDismissal(String(now - INSTALL_PROMPT_DISMISSAL_MS + 1), now)).toBe(true)
    expect(hasActiveInstallDismissal(String(now - INSTALL_PROMPT_DISMISSAL_MS), now)).toBe(false)
    expect(hasActiveInstallDismissal('not-a-timestamp', now)).toBe(false)
  })

  it('suppresses UI in standalone mode and during an active dismissal', () => {
    expect(shouldShowInstallPrompt({ isStandalone: true, isDismissed: false, hasDeferredPrompt: true, isIOS: false })).toBe(false)
    expect(shouldShowInstallPrompt({ isStandalone: false, isDismissed: true, hasDeferredPrompt: true, isIOS: false })).toBe(false)
  })

  it('shows UI only when Chromium prompting or iOS instructions are useful', () => {
    expect(shouldShowInstallPrompt({ isStandalone: false, isDismissed: false, hasDeferredPrompt: true, isIOS: false })).toBe(true)
    expect(shouldShowInstallPrompt({ isStandalone: false, isDismissed: false, hasDeferredPrompt: false, isIOS: true })).toBe(true)
    expect(shouldShowInstallPrompt({ isStandalone: false, isDismissed: false, hasDeferredPrompt: false, isIOS: false })).toBe(false)
  })
})
