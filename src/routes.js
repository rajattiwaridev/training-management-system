import React from 'react'

const Login = React.lazy(() => import('./views/pages/login/Login'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const AddHeaderOne = React.lazy(() => import('./views/Headers/addHeaderOne'))
const AddDivision = React.lazy(() => import('./views/division/addDivision'))
const AddEmployee = React.lazy(() => import('./views/employee/addEmployee'))
const EmployeeList = React.lazy(() => import('./views/employee/employeesList'))
const AddTraining = React.lazy(() => import('./views/training/addTraining'))
const TrainingList = React.lazy(() => import('./views/training/trainingList'))
const FeedbackList = React.lazy(() => import('./views/feedback/feedbackList'))
const MasterReport = React.lazy(() => import('./views/reports/MasterReport'))
const AddDepartment = React.lazy(() => import('./views/department/addDepartment'))
const MonthlyReport = React.lazy(() => import('./views/reports/MonthlyReport'))

const routes = [
  { path: '/', exact: true, name: Login },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  // { path: '/add-header-one', name: 'Add Header One', element: AddHeaderOne },
  { path: '/division', name: 'Divisions & Districts', element: AddDivision },
  { path: '/add-employee', name: 'Add Employee Details', element: AddEmployee },
  { path: '/employee-list', name: 'Employee List', element: EmployeeList },
  { path: '/add-training', name: 'Add Training', element: AddTraining },
  { path: '/training-list', name: 'Training List', element: TrainingList },
  { path: '/feedback-list', name: 'Feedback List', element: FeedbackList },
  { path: '/master-report', name: 'Master Report', element: MasterReport },
  { path: '/department', name: 'Department', element: AddDepartment },
  { path: '/monthly-report', name: 'Monthly Report', element: MonthlyReport },
]

export default routes
