import React, { useState } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormFeedback,
  CButton,
  CAlert,
} from '@coreui/react'
import { cilExitToApp, cilLockLocked } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import avatar5 from './../../assets/images/avatar5.png'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const userId = sessionStorage.getItem('id')

  // State for modal visibility and form data
  const [visible, setVisible] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState({ type: '', text: '' })

  const handleLogout = async () => {
    await axios.get(`${endpoint}/logout/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    sessionStorage.clear()
    navigate('/')
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long'
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)
    ) {
      newErrors.newPassword =
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle password change submission
  const handlePasswordChange = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setApiMessage({ type: '', text: '' })

    try {
      const response = await axios.post(
        `${endpoint}/employees/change-password/${userId}`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      
      setApiMessage({
        type: 'success',
        text: response.data.message || 'Password changed successfully!',
      })

      // Reset form and close modal after success
      setTimeout(() => {
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setVisible(false)
      }, 2000)
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to change password. Please try again.'
      setApiMessage({ type: 'danger', text: message })
    } finally {
      setIsLoading(false)
    }
  }

  // Close modal and reset form
  const handleModalClose = () => {
    setVisible(false)
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setErrors({})
    setApiMessage({ type: '', text: '' })
  }

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar src={avatar5} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownItem onClick={() => setVisible(true)}>
            <CIcon icon={cilLockLocked} className="me-2" />
            Change Password
          </CDropdownItem>
          <CDropdownItem onClick={handleLogout}>
            <CIcon icon={cilExitToApp} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      {/* Change Password Modal */}
      <CModal visible={visible} onClose={handleModalClose} backdrop="static">
        <CModalHeader>
          <CModalTitle>Change Password</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {apiMessage.text && <CAlert color={apiMessage.type}>{apiMessage.text}</CAlert>}

          <CForm>
            <div className="mb-3">
              <CFormInput
                type="password"
                name="currentPassword"
                label="Current Password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                invalid={!!errors.currentPassword}
                placeholder="Enter your current password"
              />
              <CFormFeedback invalid>{errors.currentPassword}</CFormFeedback>
            </div>

            <div className="mb-3">
              <CFormInput
                type="password"
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                onChange={handleInputChange}
                invalid={!!errors.newPassword}
                placeholder="Enter your new password"
              />
              <CFormFeedback invalid>{errors.newPassword}</CFormFeedback>
              <div className="form-text">
                Password must be at least 8 characters and include uppercase, lowercase, number, and
                special character.
              </div>
            </div>

            <div className="mb-3">
              <CFormInput
                type="password"
                name="confirmPassword"
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                invalid={!!errors.confirmPassword}
                placeholder="Confirm your new password"
              />
              <CFormFeedback invalid>{errors.confirmPassword}</CFormFeedback>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleModalClose} disabled={isLoading}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handlePasswordChange} disabled={isLoading}>
            {isLoading ? 'Changing...' : 'Change Password'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AppHeaderDropdown
