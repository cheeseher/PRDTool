import { create } from 'zustand'
import type { Project, Tab } from '../lib/supabase'
import { getProjects, getProject, getProjectTabs } from '../lib/projects'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  currentTabs: Tab[]
  isLoading: boolean
  
  // Actions
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  setCurrentTabs: (tabs: Tab[]) => void
  setLoading: (loading: boolean) => void
  
  // Async actions
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  fetchProjectTabs: (projectId: string) => Promise<void>
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  removeProject: (projectId: string) => void
  addTab: (tab: Tab) => void
  updateTab: (tab: Tab) => void
  removeTab: (tabId: string) => void
  reorderTabs: (tabs: Tab[]) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  currentTabs: [],
  isLoading: false,
  
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setCurrentTabs: (tabs) => set({ currentTabs: tabs }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  fetchProjects: async () => {
    set({ isLoading: true })
    try {
      const projects = await getProjects()
      set({ projects, isLoading: false })
    } catch (error) {
      console.error('Error fetching projects:', error)
      set({ isLoading: false })
    }
  },
  
  fetchProject: async (id: string) => {
    set({ isLoading: true })
    try {
      const project = await getProject(id)
      set({ currentProject: project, isLoading: false })
    } catch (error) {
      console.error('Error fetching project:', error)
      set({ currentProject: null, isLoading: false })
    }
  },
  
  fetchProjectTabs: async (projectId: string) => {
    try {
      const tabs = await getProjectTabs(projectId)
      set({ currentTabs: tabs })
    } catch (error) {
      console.error('Error fetching project tabs:', error)
      set({ currentTabs: [] })
    }
  },
  
  addProject: (project) => {
    const { projects } = get()
    set({ projects: [project, ...projects] })
  },
  
  updateProject: (updatedProject) => {
    const { projects, currentProject } = get()
    const newProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    )
    set({ 
      projects: newProjects,
      currentProject: currentProject?.id === updatedProject.id ? updatedProject : currentProject
    })
  },
  
  removeProject: (projectId) => {
    const { projects, currentProject } = get()
    const newProjects = projects.filter(p => p.id !== projectId)
    set({ 
      projects: newProjects,
      currentProject: currentProject?.id === projectId ? null : currentProject
    })
  },
  
  addTab: (tab) => {
    const { currentTabs } = get()
    set({ currentTabs: [...currentTabs, tab] })
  },
  
  updateTab: (updatedTab) => {
    const { currentTabs } = get()
    const newTabs = currentTabs.map(t => 
      t.id === updatedTab.id ? updatedTab : t
    )
    set({ currentTabs: newTabs })
  },
  
  removeTab: (tabId) => {
    const { currentTabs } = get()
    const newTabs = currentTabs.filter(t => t.id !== tabId)
    set({ currentTabs: newTabs })
  },
  
  reorderTabs: (tabs) => {
    set({ currentTabs: tabs })
  }
}))