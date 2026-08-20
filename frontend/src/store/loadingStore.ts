import { create } from "zustand";

interface LoadingState {
  activeRequests: number;
  startRequest: () => void;
  finishRequest: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  activeRequests: 0,
  startRequest: () =>
    set((state) => ({ activeRequests: state.activeRequests + 1 })),
  finishRequest: () =>
    set((state) => ({
      activeRequests: Math.max(0, state.activeRequests - 1),
    })),
}));
