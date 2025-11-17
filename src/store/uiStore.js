import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  mode: 'light',
  breadcrumbs: ['PapDocAuthX+'],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (value) => set({ sidebarOpen: value }),
  toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
  setMode: (mode) => set({ mode }),
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
}));

export default useUIStore;
