import { create } from "zustand";

const useVideoStore = create((set) => ({
  video: null,
  setVideo: (video) => set({ video }),

  videoId: null,
  setVideoId: (videoId) => set({ videoId }),

  summaryData: null,
  setSummaryData: (summaryData) => set({ summaryData }),

  reset: () =>
    set({
      video: null,
      videoId: null,
      summaryData: null,
    }),
}));

export default useVideoStore;
