export const hasQueryParam = (name: string): boolean => {
  return new URLSearchParams(window.location.search).has(name);
};

export const isFullscreenMode = (): boolean => hasQueryParam("fullscreen");
