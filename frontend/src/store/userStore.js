import { create } from 'zustand'

// User store for authentication and role management
export const useUserStore = create((set, get) => ({
  // User state
  user: null,
  role: null,
  isAuthenticated: false,
  
  // Actions
  setUser: (user) => set({ 
    user, 
    role: user?.user_type === '1' ? 'ceo' : user?.user_type === '2' ? 'manager' : 'employee',
    isAuthenticated: !!user 
  }),
  
  setRole: (role) => set({ role }),
  
  logout: () => set({ 
    user: null, 
    role: null, 
    isAuthenticated: false 
  }),
  
  updateUserProfile: (updates) => set((state) => ({
    user: { ...state.user, ...updates }
  })),
  
  // Mock login for demo purposes
  mockLogin: (email, password) => {
    const mockUsers = {
      'admin@axpecttech.com': { 
        id: 1, 
        email: 'admin@axpecttech.com', 
        name: 'John CEO',
        user_type: '1',
        profile_pic: '/images/default-avatar.png',
        department: 'Executive',
        division: 'Leadership',
        position: 'Chief Executive Officer',
        hire_date: '2020-01-15',
        phone: '+1-555-0100'
      },
      'manager@axpecttech.com': { 
        id: 2, 
        email: 'manager@axpecttech.com', 
        name: 'Jane Manager',
        user_type: '2',
        profile_pic: '/images/default-avatar.png',
        department: 'Engineering',
        division: 'Technology',
        position: 'Engineering Manager',
        hire_date: '2021-03-10',
        phone: '+1-555-0101'
      },
      'employee@axpecttech.com': { 
        id: 3, 
        email: 'employee@axpecttech.com', 
        name: 'Mike Employee',
        user_type: '3',
        profile_pic: '/images/default-avatar.png',
        department: 'Engineering',
        division: 'Technology',
        position: 'Software Developer',
        hire_date: '2022-06-01',
        phone: '+1-555-0102'
      }
    }
    
    const user = mockUsers[email]
    if (user && password === 'password123') {
      get().setUser(user)
      return { success: true, user }
    }
    return { success: false, error: 'Invalid credentials' }
  }
}))
