import { create } from 'zustand'

// Mock data store containing all the data for the application
export const useMockDataStore = create((set, get) => ({
  // Employee data
  employees: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@axpecttech.com',
      phone: '+1-555-0123',
      department: 'Engineering',
      division: 'Technology',
      position: 'Senior Developer',
      salary: 75000,
      hire_date: '2022-01-15',
      profile_pic: '/images/employee1.jpg',
      status: 'active',
      manager_id: 2,
      user_type: '3' // Employee
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@axpecttech.com',
      phone: '+1-555-0124',
      department: 'Engineering',
      division: 'Technology',
      position: 'Team Lead',
      salary: 85000,
      hire_date: '2021-06-10',
      profile_pic: '/images/employee2.jpg',
      status: 'active',
      manager_id: null,
      user_type: '2' // Manager
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@axpecttech.com',
      phone: '+1-555-0125',
      department: 'Sales',
      division: 'Business',
      position: 'Sales Representative',
      salary: 60000,
      hire_date: '2022-03-20',
      profile_pic: '/images/employee3.jpg',
      status: 'active',
      manager_id: 4,
      user_type: '3' // Employee
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@axpecttech.com',
      phone: '+1-555-0126',
      department: 'Sales',
      division: 'Business',
      position: 'Sales Manager',
      salary: 90000,
      hire_date: '2020-11-05',
      profile_pic: '/images/employee4.jpg',
      status: 'active',
      manager_id: null,
      user_type: '2' // Manager
    }
  ],

  // Manager data
  managers: [
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@axpecttech.com',
      phone: '+1-555-0124',
      department: 'Engineering',
      division: 'Technology',
      position: 'Team Lead',
      salary: 85000,
      hire_date: '2021-06-10',
      profile_pic: '/images/manager1.jpg',
      status: 'active',
      employees_count: 5
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@axpecttech.com',
      phone: '+1-555-0126',
      department: 'Sales',
      division: 'Business',
      position: 'Sales Manager',
      salary: 90000,
      hire_date: '2020-11-05',
      profile_pic: '/images/manager2.jpg',
      status: 'active',
      employees_count: 8
    }
  ],

  // Department data
  departments: [
    { id: 1, name: 'Engineering', division: 'Technology', manager: 'Jane Smith', employees_count: 12 },
    { id: 2, name: 'Sales', division: 'Business', manager: 'Sarah Wilson', employees_count: 8 },
    { id: 3, name: 'Marketing', division: 'Business', manager: 'Tom Brown', employees_count: 6 },
    { id: 4, name: 'HR', division: 'Support', manager: 'Lisa Davis', employees_count: 4 },
    { id: 5, name: 'Finance', division: 'Support', manager: 'Robert Lee', employees_count: 5 }
  ],

  // Division data
  divisions: [
    { id: 1, name: 'Technology', departments_count: 2, employees_count: 18 },
    { id: 2, name: 'Business', departments_count: 2, employees_count: 14 },
    { id: 3, name: 'Support', departments_count: 2, employees_count: 9 }
  ],

  // Job cards data
  jobCards: [
    {
      id: 1,
      title: 'Website Redesign Project',
      description: 'Complete redesign of company website with modern UI/UX',
      priority: 'high',
      status: 'in_progress',
      assigned_to: 'John Doe',
      assigned_by: 'Jane Smith',
      due_date: '2024-02-15',
      created_date: '2024-01-15',
      progress: 65,
      estimated_hours: 40,
      actual_hours: 26,
      tags: ['frontend', 'design', 'urgent']
    },
    {
      id: 2,
      title: 'Database Optimization',
      description: 'Optimize database queries for better performance',
      priority: 'medium',
      status: 'pending',
      assigned_to: 'Mike Johnson',
      assigned_by: 'Sarah Wilson',
      due_date: '2024-02-20',
      created_date: '2024-01-20',
      progress: 0,
      estimated_hours: 20,
      actual_hours: 0,
      tags: ['backend', 'database', 'performance']
    },
    {
      id: 3,
      title: 'Client Meeting Preparation',
      description: 'Prepare presentation and materials for client meeting',
      priority: 'high',
      status: 'completed',
      assigned_to: 'Sarah Wilson',
      assigned_by: 'Admin',
      due_date: '2024-01-30',
      created_date: '2024-01-25',
      progress: 100,
      estimated_hours: 8,
      actual_hours: 8,
      tags: ['sales', 'presentation', 'client']
    }
  ],

  // Customer data
  customers: [
    {
      id: 1,
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1-555-1000',
      company: 'Acme Corp',
      address: '123 Business St, City, State 12345',
      industry: 'Technology',
      status: 'active',
      created_date: '2023-06-15',
      last_contact: '2024-01-20',
      total_orders: 5,
      total_value: 125000
    },
    {
      id: 2,
      name: 'Global Solutions Inc',
      email: 'info@globalsolutions.com',
      phone: '+1-555-2000',
      company: 'Global Solutions Inc',
      address: '456 Corporate Ave, City, State 12346',
      industry: 'Manufacturing',
      status: 'active',
      created_date: '2023-08-10',
      last_contact: '2024-01-18',
      total_orders: 3,
      total_value: 85000
    }
  ],

  // Orders data
  orders: [
    {
      id: 1,
      customer_id: 1,
      customer_name: 'Acme Corporation',
      order_date: '2024-01-15',
      status: 'completed',
      total_amount: 25000,
      items: [
        { name: 'Software License', quantity: 10, price: 2000 },
        { name: 'Support Package', quantity: 1, price: 5000 }
      ]
    },
    {
      id: 2,
      customer_id: 2,
      customer_name: 'Global Solutions Inc',
      order_date: '2024-01-20',
      status: 'pending',
      total_amount: 15000,
      items: [
        { name: 'Custom Development', quantity: 1, price: 15000 }
      ]
    }
  ],

  // Attendance data
  attendance: [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'John Doe',
      date: '2024-01-20',
      check_in: '09:00:00',
      check_out: '17:30:00',
      status: 'present',
      hours_worked: 8.5,
      location: { lat: 37.7749, lng: -122.4194 }
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: 'Jane Smith',
      date: '2024-01-20',
      check_in: '08:45:00',
      check_out: '18:00:00',
      status: 'present',
      hours_worked: 9.25,
      location: { lat: 37.7849, lng: -122.4094 }
    }
  ],

  // GPS tracking data
  gpsTracks: [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'John Doe',
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: '2024-01-20T09:00:00Z',
      status: 'checked_in',
      accuracy: 5
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: 'Jane Smith',
      latitude: 37.7849,
      longitude: -122.4094,
      timestamp: '2024-01-20T08:45:00Z',
      status: 'checked_in',
      accuracy: 3
    }
  ],

  // Leave requests data
  leaveRequests: [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'John Doe',
      leave_type: 'vacation',
      start_date: '2024-02-01',
      end_date: '2024-02-05',
      days: 5,
      reason: 'Family vacation',
      status: 'pending',
      applied_date: '2024-01-15',
      approved_by: null
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: 'Jane Smith',
      leave_type: 'sick',
      start_date: '2024-01-25',
      end_date: '2024-01-25',
      days: 1,
      reason: 'Medical appointment',
      status: 'approved',
      applied_date: '2024-01-20',
      approved_by: 'Admin'
    }
  ],

  // Notifications data
  notifications: [
    {
      id: 1,
      title: 'New Job Card Assigned',
      message: 'You have been assigned a new job card: Website Redesign Project',
      type: 'info',
      read: false,
      created_date: '2024-01-20T10:00:00Z',
      recipient_id: 1
    },
    {
      id: 2,
      title: 'Leave Request Approved',
      message: 'Your leave request for Feb 1-5 has been approved',
      type: 'success',
      read: false,
      created_date: '2024-01-20T11:00:00Z',
      recipient_id: 1
    }
  ],

  // Enhanced Messages data (for social/chat)
  messages: [
    {
      id: 1,
      chat_id: 'group_1',
      sender_id: 1,
      content: 'Good morning team! Ready for the standup?',
      timestamp: '2024-01-20T09:00:00Z',
      status: 'sent',
      type: 'text',
      read_by: [1, 2]
    },
    {
      id: 2,
      chat_id: 'group_1',
      sender_id: 2,
      content: 'Morning! Yes, let\'s start in 5 minutes',
      timestamp: '2024-01-20T09:02:00Z',
      status: 'sent',
      type: 'text',
      read_by: [1, 2]
    },
    {
      id: 3,
      chat_id: 'dm_1_2',
      sender_id: 1,
      content: 'Can you review the project proposal?',
      timestamp: '2024-01-20T10:15:00Z',
      status: 'sent',
      type: 'text',
      read_by: [1]
    },
    {
      id: 4,
      chat_id: 'dm_1_2',
      sender_id: 2,
      content: 'Sure! I\'ll review it by end of day',
      timestamp: '2024-01-20T10:18:00Z',
      status: 'sent',
      type: 'text',
      read_by: [1, 2]
    },
    {
      id: 5,
      chat_id: 'group_2',
      sender_id: 3,
      content: 'Client meeting went well today',
      timestamp: '2024-01-20T14:30:00Z',
      status: 'sent',
      type: 'text',
      read_by: [3]
    }
  ],

  // Chat rooms/groups data
  chats: [
    {
      id: 'group_1',
      name: 'Engineering Team',
      type: 'group',
      description: 'Main engineering team chat',
      created_by: 1,
      members: [1, 2, 3],
      avatar: '/images/group-engineering.png',
      is_private: false,
      created_at: '2024-01-15T08:00:00Z',
      last_message: 'Morning! Yes, let\'s start in 5 minutes',
      last_message_time: '2024-01-20T09:02:00Z',
      unread_count: 0
    },
    {
      id: 'group_2',
      name: 'Project Alpha',
      type: 'group',
      description: 'Project Alpha team discussions',
      created_by: 2,
      members: [2, 3, 4],
      avatar: '/images/group-project.png',
      is_private: true,
      created_at: '2024-01-18T10:00:00Z',
      last_message: 'Client meeting went well today',
      last_message_time: '2024-01-20T14:30:00Z',
      unread_count: 1
    },
    {
      id: 'dm_1_2',
      name: 'John CEO & Jane Manager',
      type: 'dm',
      description: 'Direct message between CEO and Manager',
      created_by: 1,
      members: [1, 2],
      avatar: null,
      is_private: true,
      created_at: '2024-01-20T10:00:00Z',
      last_message: 'Sure! I\'ll review it by end of day',
      last_message_time: '2024-01-20T10:18:00Z',
      unread_count: 0
    }
  ],

  // Locations data (for GPS tracking)
  locations: [
    {
      id: 1,
      employee_id: 1,
      lat: 37.7749,
      lng: -122.4194,
      timestamp: '2024-01-20T09:00:00Z',
      status: 'active',
      speed: 0
    },
    {
      id: 2,
      employee_id: 2,
      lat: 37.7849,
      lng: -122.4094,
      timestamp: '2024-01-20T08:45:00Z',
      status: 'active',
      speed: 0
    },
    {
      id: 3,
      employee_id: 3,
      lat: 37.7949,
      lng: -122.3994,
      timestamp: '2024-01-20T10:15:00Z',
      status: 'active',
      speed: 25
    }
  ],

  // Feedback data
  feedback: [
    {
      id: 1,
      employee_id: 1,
      type: 'performance',
      priority: 'medium',
      subject: 'Code Review Feedback',
      message: 'Great work on the recent project. Consider improving code documentation.',
      status: 'read',
      timestamp: '2024-01-20T10:00:00Z'
    },
    {
      id: 2,
      employee_id: 2,
      type: 'improvement',
      priority: 'low',
      subject: 'Team Leadership',
      message: 'Excellent leadership skills demonstrated in the last sprint.',
      status: 'unread',
      timestamp: '2024-01-20T11:00:00Z'
    }
  ],

  // Chat groups data
  chatGroups: [
    {
      id: 1,
      name: 'Engineering Team',
      type: 'department',
      members: [1, 2],
      last_message: '2024-01-20T09:02:00Z',
      unread_count: 2
    },
    {
      id: 2,
      name: 'Sales Team',
      type: 'department',
      members: [3, 4],
      last_message: '2024-01-20T08:30:00Z',
      unread_count: 0
    }
  ],

  // Actions for updating data
  addEmployee: (employee) => set((state) => ({
    employees: [...state.employees, { ...employee, id: Date.now() }]
  })),

  updateEmployee: (id, updates) => set((state) => ({
    employees: state.employees.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    )
  })),

  deleteEmployee: (id) => set((state) => ({
    employees: state.employees.filter(emp => emp.id !== id)
  })),

  addJobCard: (jobCard) => set((state) => ({
    jobCards: [...state.jobCards, { ...jobCard, id: Date.now() }]
  })),

  updateJobCard: (id, updates) => set((state) => ({
    jobCards: state.jobCards.map(card => 
      card.id === id ? { ...card, ...updates } : card
    )
  })),

  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, { ...customer, id: Date.now() }]
  })),

  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    )
  })),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now() }]
  })),

  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    )
  })),

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, { ...message, id: Date.now() }]
  })),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: Date.now() }]
  })),

  addChat: (chat) => set((state) => ({
    chats: [...state.chats, { ...chat, id: `chat_${Date.now()}` }]
  })),

  updateChat: (chatId, updates) => set((state) => ({
    chats: state.chats.map(chat => 
      chat.id === chatId ? { ...chat, ...updates } : chat
    )
  })),

  deleteChat: (chatId) => set((state) => ({
    chats: state.chats.filter(chat => chat.id !== chatId)
  })),

  addChatMember: (chatId, memberId) => set((state) => ({
    chats: state.chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, members: [...chat.members, memberId] }
        : chat
    )
  })),

  removeChatMember: (chatId, memberId) => set((state) => ({
    chats: state.chats.map(chat => 
      chat.id === chatId 
        ? { ...chat, members: chat.members.filter(id => id !== memberId) }
        : chat
    )
  })),

  markMessageAsRead: (messageId, userId) => set((state) => ({
    messages: state.messages.map(message => 
      message.id === messageId 
        ? { ...message, read_by: [...new Set([...message.read_by, userId])] }
        : message
    )
  })),

  addFeedback: (feedback) => set((state) => ({
    feedback: [...state.feedback, { ...feedback, id: Date.now() }]
  })),

  updateFeedback: (id, updates) => set((state) => ({
    feedback: state.feedback.map(fb => 
      fb.id === id ? { ...fb, ...updates } : fb
    )
  }))
}))
