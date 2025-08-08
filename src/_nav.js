import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilList,
  cilUser,
  cilPlus,
  cilText,
  cilTablet,
  cilFastfood,
  cilColorBorder,
  cilFilter,
  cilFile,
  cilNoteAdd,
  cilListFilter,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
const role = sessionStorage.getItem('role')
const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  ...(role === 'SUPERADMIN'
    ? [
        {
          component: CNavItem,
          name: 'Divisions / Districts',
          to: '/division',
          icon: <CIcon icon={cilList} customClassName="nav-icon" />,
        },
      ]
    : []),
  ...(role === 'SUPERADMIN' || role === 'SRM'
    ? [
        {
          component: CNavGroup,
          name: 'Employee',
          to: '/base',
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Add Employee',
              to: '/add-employee',
              icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Employee List',
              to: '/employee-list',
              icon: <CIcon icon={cilList} customClassName="nav-icon" />,
            },
          ],
        },
      ]
    : []),
  ...(role === 'SRM' || role === 'DRM'
    ? [
        {
          component: CNavGroup,
          name: 'Training Calendar',
          to: '/base',
          icon: <CIcon icon={cilTablet} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Add Training',
              to: '/add-training',
              icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
            },
            {
              component: CNavItem,
              name: 'Training List',
              to: '/training-list',
              icon: <CIcon icon={cilList} customClassName="nav-icon" />,
            },
          ],
        },
      ]
    : []),
  // {
  //   component: CNavTitle,
  //   name: 'Header Section',
  // },
]

export default _nav
