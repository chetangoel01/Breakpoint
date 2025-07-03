declare global {
  interface Window {
    electronAPI: {
      toggleMiniMode: (isMinimized: boolean) => Promise<void>;
      restoreFromMini: () => Promise<void>;
    };
  }
}

export {}; 