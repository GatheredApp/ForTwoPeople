export const INSTALL_PROMPT_DISMISSED_KEY = 'fortwopeople-install-prompt-dismissed-v1'
export const INSTALL_PROMPT_DISMISSAL_MS = 14 * 24 * 60 * 60 * 1000

export interface StandaloneEnvironment {
  displayModeStandalone: boolean
  navigatorStandalone?: boolean
}

export interface IOSDetectionEnvironment {
  userAgent: string
  platform: string
  maxTouchPoints: number
}

export interface InstallPromptVisibility {
  isStandalone: boolean
  isDismissed: boolean
  hasDeferredPrompt: boolean
  isIOS: boolean
}

export function isStandalone({ displayModeStandalone, navigatorStandalone }: StandaloneEnvironment) {
  return displayModeStandalone || navigatorStandalone === true
}

export function isIOS({ userAgent, platform, maxTouchPoints }: IOSDetectionEnvironment) {
  return /iPad|iPhone|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
}

export function hasActiveInstallDismissal(value: string | null, now = Date.now()) {
  if (!value) return false
  const dismissedAt = Number(value)
  return Number.isFinite(dismissedAt) && dismissedAt <= now && now - dismissedAt < INSTALL_PROMPT_DISMISSAL_MS
}

export function shouldShowInstallPrompt({
  isStandalone: standalone,
  isDismissed,
  hasDeferredPrompt,
  isIOS: ios,
}: InstallPromptVisibility) {
  return !standalone && !isDismissed && (hasDeferredPrompt || ios)
}
