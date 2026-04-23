'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

const DISMISS_KEY = 'pwa-install-dismissed';

function isStandaloneDisplayMode() {
  if (typeof window === 'undefined') return false;

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isLikelyMobileDevice() {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia('(max-width: 1024px)').matches) {
    return true;
  }

  return /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    setIsInstalled(isStandaloneDisplayMode());
    setIsMobileDevice(isLikelyMobileDevice());
    setIsDismissed(window.localStorage.getItem(DISMISS_KEY) === 'true');

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.localStorage.removeItem(DISMISS_KEY);
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsInstalled(true);
      setShowManualHelp(false);
      window.localStorage.removeItem(DISMISS_KEY);
      toast.success('App installed successfully.');
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      if (mediaQuery.matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, 'true');
    setIsDismissed(true);
    setShowManualHelp(false);
  };

  const handleInstallClick = async () => {
    if (installEvent) {
      setIsInstalling(true);

      try {
        await installEvent.prompt();
        const choice = await installEvent.userChoice;

        if (choice.outcome === 'dismissed') {
          toast('You can install the app any time from Chrome.');
        }
      } finally {
        setInstallEvent(null);
        setIsInstalling(false);
      }

      return;
    }

    setShowManualHelp(true);
  };

  if (process.env.NODE_ENV !== 'production' || isInstalled || !isMobileDevice || isDismissed) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-slate-950/5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
            <Download className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Install on your phone</p>
            <p className="mt-1 text-sm text-slate-600">
              Open the Drug Information System from your home screen with a full-screen app experience.
            </p>

            {showManualHelp && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                In Chrome, tap the three-dot menu, then choose <span className="font-semibold text-slate-800">Install app</span> or <span className="font-semibold text-slate-800">Add to Home screen</span>.
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" className="gap-2" onClick={() => void handleInstallClick()} loading={isInstalling}>
                <Download className="h-4 w-4" />
                Install App
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
