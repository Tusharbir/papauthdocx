import { create } from 'zustand';

const getPreferredMode = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const defaultMode = getPreferredMode();

const useUIStore = create((set) => ({
  sidebarOpen: true,
  mode: defaultMode,
  breadcrumbs: ['PapDocAuthX+'],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (value) => set({ sidebarOpen: value }),
  toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
  setMode: (mode) => set({ mode }),
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
}));

export default useUIStore;
