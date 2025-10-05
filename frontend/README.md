# Axpect Technologies - React Frontend

A standalone React frontend for the Axpect Technologies Workforce Productivity Suite, built with modern React technologies and designed to replicate the original Django AdminLTE interface.

## 🚀 Features

- **Role-Based Access Control**: CEO, Manager, and Employee dashboards
- **Real-Time GPS Tracking**: Interactive maps with React-Leaflet
- **Responsive Design**: Mobile-first approach with Bootstrap 4
- **Modern State Management**: Zustand for lightweight state management
- **Form Validation**: React-Hook-Form with comprehensive validation
- **Interactive Charts**: Recharts for analytics and reporting
- **Mock Data**: Complete mock data system for development
- **AdminLTE 3 Styling**: Pixel-perfect recreation of original interface

## 🛠 Technology Stack

- **Build Tool**: Vite (fast development and building)
- **UI Framework**: React 18 with React-Bootstrap
- **Styling**: Bootstrap 4 + AdminLTE 3 + CSS Modules
- **Routing**: React Router v6 with hash-based navigation
- **State Management**: Zustand (lightweight alternative to Redux)
- **Maps**: React-Leaflet for GPS tracking features
- **Charts**: Recharts for analytics and dashboards
- **Forms**: React-Hook-Form with validation
- **Notifications**: React-Toastify for user feedback
- **Icons**: FontAwesome 6

## 📦 Installation

1. **Clone or extract the frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Demo Credentials

The application includes mock authentication with the following test accounts:

### CEO/Admin Account
- **Email**: admin@axpecttech.com
- **Password**: password123
- **Access**: Full system access, employee management, GPS tracking, analytics

### Manager Account
- **Email**: manager@axpecttech.com
- **Password**: password123
- **Access**: Team management, attendance tracking, salary management

### Employee Account
- **Email**: employee@axpecttech.com
- **Password**: password123
- **Access**: Personal dashboard, GPS check-in/out, job cards, leave requests

## 📱 Available Pages & Features

### CEO Dashboard (`/ceo/*`)
- **Dashboard**: Overview with statistics and charts
- **Employee Management**: Add, edit, manage employees
- **Manager Management**: Add, edit, manage managers
- **Organization**: Manage divisions and departments
- **Customer Management**: CRM functionality
- **Job Card Management**: Task assignment and tracking
- **GPS Dashboard**: Real-time employee location tracking
- **Location Analytics**: GPS data analysis and reporting
- **Geofence Management**: Location-based attendance zones
- **Attendance Management**: View and manage attendance
- **Communication**: Feedback and notification systems
- **Leave Management**: Approve/reject leave requests

### Manager Dashboard (`/manager/*`)
- **Dashboard**: Team overview and statistics
- **Salary Management**: Add and edit employee salaries
- **Job Card Management**: Create and assign tasks
- **GPS Tracking**: Monitor team member locations
- **Attendance Management**: Take and update attendance
- **Communication**: Team notifications and feedback
- **Leave Management**: Apply for leave

### Employee Dashboard (`/employee/*`)
- **Dashboard**: Personal statistics and charts
- **Profile Management**: View and edit personal information
- **Salary View**: View salary information
- **Job Cards**: View assigned tasks and updates
- **GPS Features**: Check-in/out, location tracking, history
- **Attendance**: View personal attendance records
- **Communication**: Notifications and feedback
- **Leave Management**: Apply for leave requests

### Social Features (`/social/*`)
- **Chat System**: Real-time messaging (mock WebSocket)
- **Google Drive**: File sharing integration (mock)
- **Notifications**: Message notifications and settings

## 🎨 UI Components

### Layout Components
- **BaseLayout**: Main application wrapper with sidebar and header
- **Sidebar**: Role-based navigation menu
- **Header**: Top navigation with user menu
- **Footer**: Application footer

### Feature Components
- **Charts**: Recharts integration for analytics
- **Maps**: React-Leaflet for GPS tracking
- **Forms**: React-Hook-Form with validation
- **Tables**: Responsive data tables
- **Modals**: Popup dialogs and forms
- **Notifications**: Toast notifications

## 📊 Mock Data

The application includes comprehensive mock data for:

- **Users**: Employees, managers, and admin accounts
- **Organizations**: Divisions, departments, and hierarchy
- **Job Cards**: Tasks, assignments, and progress tracking
- **Customers**: CRM data and order management
- **Attendance**: GPS tracking and attendance records
- **Leave Requests**: Leave applications and approvals
- **Notifications**: System notifications and messages
- **Chat Messages**: Social messaging data
- **GPS Tracks**: Location tracking and geofencing

## 🔧 Development

### Project Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Top-level pages
│   ├── templates/           # Role-specific templates
│   │   ├── ceo_template/   # CEO dashboard components
│   │   ├── manager_template/ # Manager dashboard components
│   │   ├── employee_template/ # Employee dashboard components
│   │   ├── social/         # Social messaging components
│   │   └── registration/   # Login/registration components
│   ├── store/              # Zustand state management
│   ├── styles/             # CSS modules and global styles
│   ├── utils/              # Utility functions
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### State Management
The application uses Zustand for state management with two main stores:

- **userStore**: Authentication, user data, and role management
- **mockDataStore**: All application data (employees, job cards, etc.)

### Styling
- **Bootstrap 4**: Base responsive framework
- **AdminLTE 3**: Professional admin interface styling
- **CSS Modules**: Scoped component styles
- **FontAwesome**: Icon library
- **Custom CSS**: Additional responsive and component styles

## 🧪 Testing Checklist

### Authentication & Navigation
- [ ] Login with CEO credentials redirects to `/ceo/dashboard`
- [ ] Login with Manager credentials redirects to `/manager/dashboard`
- [ ] Login with Employee credentials redirects to `/employee/dashboard`
- [ ] Sidebar shows correct navigation items for each role
- [ ] Logout functionality works correctly

### CEO Features
- [ ] Dashboard displays statistics and charts
- [ ] Employee management (add, edit, view, delete)
- [ ] Manager management interface
- [ ] GPS dashboard shows map with employee locations
- [ ] Job card management system
- [ ] Customer management interface
- [ ] Attendance viewing and management
- [ ] Leave request management
- [ ] Feedback and notification systems

### Manager Features
- [ ] Manager dashboard with team statistics
- [ ] Salary management for team members
- [ ] Job card assignment and tracking
- [ ] GPS tracking of team members
- [ ] Attendance taking and management
- [ ] Team communication features
- [ ] Leave application system

### Employee Features
- [ ] Employee dashboard with personal statistics
- [ ] Profile viewing and editing
- [ ] Salary information display
- [ ] Job card viewing and updates
- [ ] GPS check-in/check-out functionality
- [ ] Attendance history viewing
- [ ] Leave application system
- [ ] Notification management

### Social Features
- [ ] Chat interface (mock WebSocket)
- [ ] Google Drive integration (mock)
- [ ] Message notifications
- [ ] File sharing capabilities

### Responsive Design
- [ ] Mobile navigation works correctly
- [ ] Tables are responsive on mobile devices
- [ ] Forms are mobile-friendly
- [ ] Charts and maps are responsive
- [ ] Sidebar collapses properly on mobile

### Performance
- [ ] Application loads quickly
- [ ] Charts render smoothly
- [ ] Maps load without issues
- [ ] No console errors
- [ ] Smooth navigation between pages

## 🚀 Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory and can be served by any static file server.

## 📝 Notes

- This is a **standalone frontend** with no backend dependencies
- All data is **mock data** stored in Zustand stores
- **No real API calls** are made - all interactions are simulated
- The application uses **hash-based routing** for static hosting compatibility
- **Pixel-perfect recreation** of the original AdminLTE interface
- **Mobile-responsive** design matching the original templates

## 🤝 Contributing

This frontend is designed to be a complete, standalone application. When making changes:

1. Follow the existing component structure
2. Use CSS Modules for styling
3. Maintain the AdminLTE 3 design system
4. Keep mock data comprehensive and realistic
5. Ensure responsive design works on all devices

## 📄 License

This project is part of the Axpect Technologies Workforce Productivity Suite.
