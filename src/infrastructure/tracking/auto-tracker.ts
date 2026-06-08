/**
 * Auto Tracker
 * @description Single responsibility: SPA navigation tracking
 */

export type PageviewListener = (path: string) => void;

interface HistoryWithOriginal extends History {
  __wtOriginalPushState?: typeof history.pushState;
  __wtOriginalReplaceState?: typeof history.replaceState;
}

export class AutoTracker {
  private wrappedPushState: ((...args: Parameters<typeof history.pushState>) => void) | null = null;
  private wrappedReplaceState: ((...args: Parameters<typeof history.replaceState>) => void) | null = null;
  private popStateHandler: (() => void) | null = null;
  private active = false;

  constructor(private readonly listener: PageviewListener) {}

  start(): void {
    if (this.active || typeof window === 'undefined') {
      return;
    }
    this.active = true;

    const historyRef = history as HistoryWithOriginal;

    const originalPush = historyRef.__wtOriginalPushState ?? history.pushState.bind(history);
    const originalReplace = historyRef.__wtOriginalReplaceState ?? history.replaceState.bind(history);

    historyRef.__wtOriginalPushState = originalPush;
    historyRef.__wtOriginalReplaceState = originalReplace;

    this.wrappedPushState = (...args) => {
      originalPush(...args);
      this.listener(window.location.pathname);
    };

    this.wrappedReplaceState = (...args) => {
      originalReplace(...args);
      this.listener(window.location.pathname);
    };

    history.pushState = this.wrappedPushState;
    history.replaceState = this.wrappedReplaceState;

    this.popStateHandler = () => {
      this.listener(window.location.pathname);
    };
    window.addEventListener('popstate', this.popStateHandler);
  }

  stop(): void {
    if (!this.active) {
      return;
    }
    this.active = false;

    const historyRef = history as HistoryWithOriginal;

    if (this.wrappedPushState) {
      if (historyRef.__wtOriginalPushState) {
        history.pushState = historyRef.__wtOriginalPushState;
      }
      this.wrappedPushState = null;
    }

    if (this.wrappedReplaceState) {
      if (historyRef.__wtOriginalReplaceState) {
        history.replaceState = historyRef.__wtOriginalReplaceState;
      }
      this.wrappedReplaceState = null;
    }

    if (this.popStateHandler && typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.popStateHandler);
      this.popStateHandler = null;
    }
  }

  triggerInitial(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.listener(window.location.pathname);
  }
}
