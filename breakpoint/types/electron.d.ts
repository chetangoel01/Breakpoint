declare global {
  interface Window {
    electronAPI: {
      toggleMiniMode: (isMinimized: boolean) => Promise<void>;
      restoreFromMini: () => Promise<void>;
      updateFatigueDetection: (enabled: boolean) => Promise<void>;
      clearCache: () => Promise<{ success: boolean; message: string }>;
    };
  }
}

export {};
