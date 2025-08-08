import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilExitToApp } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar5 from './../../assets/images/avatar5.png'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AppHeaderDropdown = () => {
  const navigate = useNavigate();
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken');
  const userId = sessionStorage.getItem('id')
  const handleLogout = async () => {
    await axios.get(`${endpoint}/logout/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    sessionStorage.clear()
    navigate('/');
  }
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar5} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem onClick={handleLogout}>
          <CIcon icon={cilExitToApp} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
