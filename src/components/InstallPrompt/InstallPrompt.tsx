import { useEffect, useState } from 'react'
import goonImage from '../../assets/goon.png'
import {
  INSTALL_PROMPT_DISMISSED_KEY,
  hasActiveInstallDismissal,
  isIOS,
  isStandalone,
  shouldShowInstallPrompt,
} from '../../utilities/install'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

interface InstallPromptProps {
  hidden?: boolean
}

function currentStandaloneState() {
  return isStandalone({
    displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
    navigatorStandalone: (navigator as NavigatorWithStandalone).standalone,
  })
}

function dismissalIsActive() {
  try {
    return hasActiveInstallDismissal(localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY))
  } catch {
    return false
  }
}

export function InstallPrompt({ hidden = false }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(dismissalIsActive)
  const [installed, setInstalled] = useState(currentStandaloneState)
  const ios = isIOS({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  })

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => setInstalled(currentStandaloneState())
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setDeferredPrompt(null)
      setInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    displayMode.addEventListener('change', handleDisplayModeChange)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      displayMode.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  const visible = !hidden && shouldShowInstallPrompt({
    isStandalone: installed,
    isDismissed: dismissed,
    hasDeferredPrompt: deferredPrompt !== null,
    isIOS: ios,
  })

  if (!visible) return null

  const dismiss = () => {
    try {
      localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, String(Date.now()))
    } catch {
      // A storage-restricted browser can still dismiss the prompt for this session.
    }
    setDismissed(true)
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    setDeferredPrompt(null)
    await deferredPrompt.userChoice
  }

  return (
    <aside className="install-prompt" aria-label="Install Mullet Review">
      <img className="install-prompt-icon" src={goonImage} alt="" aria-hidden="true" />
      <div className="install-prompt-copy">
        <strong>Add Mullet Review to your Home Screen</strong>
        {ios ? (
          <p>
            Tap the Share button <span className="share-symbol" aria-hidden="true">⇧</span>, then choose &ldquo;Add to Home Screen.&rdquo;
          </p>
        ) : (
          <p>Get one-tap access to the buffet map from your device.</p>
        )}
      </div>
      <div className="install-prompt-actions">
        {!ios && deferredPrompt && (
          <button type="button" className="install-action" onClick={install}>Add to Home Screen</button>
        )}
        <button type="button" className="install-dismiss" onClick={dismiss}>{ios ? 'Got it' : 'Not now'}</button>
      </div>
    </aside>
  )
}
