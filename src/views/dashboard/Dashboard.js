import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
import { CBadge } from '@coreui/react-pro'
import { format } from 'date-fns'
import DashboardTrainingList from './dashboardTrainingList'
import AllSrmList from './allSrmList'
import TodayTrainingList from './todayTrainingList'
import './passwordReset.css'

const getStatusBadgeColor = (status) => {
  if (!status) return 'secondary'
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'ongoing':
      return 'primary'
    case 'scheduled':
      return 'info'
    case 'cancelled':
      return 'danger'
    default:
      return 'secondary'
  }
}
const Dashboard = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const userId = sessionStorage.getItem('id')
  const role = sessionStorage.getItem('role')
  const stateId = sessionStorage.getItem('stateId')
  const [statisticData, setStatisticData] = useState([])
  const [todayTraining, setTodayTraining] = useState([])
  const [upComingTraining, setUpComingTraining] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [srmListModalVisible, setSrmListModalVisible] = useState(null)
  const [showSrmListModal, setShowSrmListModal] = useState(null)
  useEffect(() => {
    const getCount = async () => {
      try {
        const response = await axios.get(`${endpoint}/get-allcounts/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 200) {
          setStatisticData(response.data)
        }
      } catch (error) {
        SweetAlert.fire('Error', 'Failed to fetch data', 'error')
      }
    }
    const getTodayTraining = async () => {
      try {
        let url = `${endpoint}/get-today-trainings`
        console.log(role, url)
        if (role === 'SRM' || role === 'DRM') {
          url += `?id=${userId}`
        }
        console.log(url)
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 200) {
          setTodayTraining(response.data.todayTrainings)
          setUpComingTraining(response.data.upcomingTrainings)
        }
      } catch (error) {
        SweetAlert.fire('Error', 'Failed to fetch data', 'error')
      }
    }
    const getEmployeeData = async () => {
      try {
        const response = await axios.get(`${endpoint}/employees/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 200) {
          const employeeData = response.data

          if (employeeData.isPasswordReset !== true) {
            let resetSuccessful = false

            while (!resetSuccessful) {
              const { value: formValues, dismiss } = await SweetAlert.fire({
                title: 'Password Reset Required',
                html: `
              <div class="password-reset-form">
                <div class="form-group">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input type="password" id="newPassword" class="form-control" placeholder="Enter new password">
                  <div class="invalid-feedback" id="newPasswordError"></div>
                  <small class="form-text text-muted">
                    Password must contain: 8+ characters, uppercase, lowercase, number, and special character
                  </small>
                </div>
                <div class="form-group mt-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input type="password" id="confirmPassword" class="form-control" placeholder="Confirm new password">
                  <div class="invalid-feedback" id="confirmPasswordError"></div>
                </div>
              </div>
            `,
                icon: 'warning',
                focusConfirm: false,
                showCancelButton: false,
                confirmButtonText: 'Reset Password',
                allowOutsideClick: false,
                allowEscapeKey: false,
                preConfirm: () => {
                  const newPassword = document.getElementById('newPassword').value
                  const confirmPassword = document.getElementById('confirmPassword').value

                  const passwordRegex =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                  let isValid = true

                  document.getElementById('newPassword').classList.remove('is-invalid')
                  document.getElementById('confirmPassword').classList.remove('is-invalid')

                  if (!newPassword) {
                    document.getElementById('newPassword').classList.add('is-invalid')
                    document.getElementById('newPasswordError').textContent = 'Password is required'
                    isValid = false
                  } else if (newPassword.length < 8) {
                    document.getElementById('newPassword').classList.add('is-invalid')
                    document.getElementById('newPasswordError').textContent =
                      'Password must be at least 8 characters'
                    isValid = false
                  } else if (!passwordRegex.test(newPassword)) {
                    document.getElementById('newPassword').classList.add('is-invalid')
                    document.getElementById('newPasswordError').textContent =
                      'Must include uppercase, lowercase, number, and special character'
                    isValid = false
                  }

                  if (!confirmPassword) {
                    document.getElementById('confirmPassword').classList.add('is-invalid')
                    document.getElementById('confirmPasswordError').textContent =
                      'Please confirm your password'
                    isValid = false
                  } else if (confirmPassword !== newPassword) {
                    document.getElementById('confirmPassword').classList.add('is-invalid')
                    document.getElementById('confirmPasswordError').textContent =
                      'Passwords do not match'
                    isValid = false
                  }

                  return isValid ? { newPassword, confirmPassword } : false
                },
              })

              if (dismiss) {
                break // Exit if user dismissed the dialog
              }

              if (formValues) {
                try {
                  const resetResponse = await axios.post(
                    `${endpoint}/employees/${userId}/reset-password`,
                    { newPassword: formValues.newPassword },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    },
                  )

                  if (resetResponse.status === 200) {
                    resetSuccessful = true
                    await SweetAlert.fire(
                      'Success!',
                      'Your password has been changed successfully.',
                      'success',
                    )
                    window.location.reload()
                  }
                } catch (error) {
                  // Show error but keep the reset dialog open
                  await SweetAlert.fire({
                    title: 'Error',
                    text: 'Failed to reset password. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                  })
                  // The while loop will continue, showing the reset dialog again
                }
              }
            }
          }
        }
      } catch (error) {
        SweetAlert.fire('Error', 'Failed to fetch employee data', 'error')
      }
    }
    if (role !== 'SUPERADMIN') {
      getEmployeeData()
    }
    getCount()
    getTodayTraining()
  }, [token])
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'dd MMM yyyy')
    } catch {
      return 'Invalid Date'
    }
  }
  const handleSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const requestSort = (key) => {
    handleSort(key)
  }
  const [designation, setDesignation] = useState(null)
  const handleShowSRMList = async (type) => {
    setDesignation(type)
    setSrmListModalVisible(true)
    setShowSrmListModal(true)
  }
  return (
    <CCol xs>
      <CCard className="mb-4">
        <CCardHeader>Statistics</CCardHeader>
        <CCardBody>
          {role === 'SUPERADMIN' ? (
            <CRow>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-info py-1 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-body-secondary small">Total SRM's</div>
                        <button
                          className="btn btn-link p-0 text-nowrap"
                          onClick={() => handleShowSRMList('SRM')}
                        >
                          View
                        </button>
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.srmCount}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-info py-1 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-body-secondary small">Total DRM's</div>
                        <button
                          className="btn btn-link p-0 text-nowrap"
                          onClick={() => handleShowSRMList('DRM')}
                        >
                          View
                        </button>
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.drmCount}</div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Total Training's
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.trainingCount}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Training Scheduled
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.trainingCountScheduled}</div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Training Completed
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.trainingCountCompleted}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Training Cancelled
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.trainingCountCancelled}</div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Total Feedback Requested
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.feedbackRequestCount}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Total Feedback Given
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.feedbackGivenCount}</div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          ) : (
            ''
          )}
          {role === 'SRM' ? (
            <CRow>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Self Total Training's
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.selfTrainingCount}</div>
                    </div>
                  </CCol>

                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Self Training Scheduled
                      </div>
                      <div className="fs-5 fw-semibold">
                        {statisticData.selfTrainingCountScheduled}
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Self Training Completed
                      </div>
                      <div className="fs-5 fw-semibold">
                        {statisticData.selfTrainingCountCompleted}
                      </div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Self Training Cancelled
                      </div>
                      <div className="fs-5 fw-semibold">
                        {statisticData.selfTrainingCountCancelled}
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6} onClick={() => handleShowSRMList('DRM')}>
                    <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">Total DRM's</div>
                      <div className="fs-5 fw-semibold">{statisticData.drmCount}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Total Training's
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.trainingCount}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Training Scheduled
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.trainingCountScheduled}</div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Training Completed
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.trainingCountCompleted}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Training Cancelled
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.trainingCountCancelled}</div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          ) : (
            ''
          )}
          {role === 'DRM' ? (
            <CRow>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Self Total Training's
                      </div>
                      <div className="fs-5 fw-semibold">{statisticData.selfTrainingCount}</div>
                    </div>
                  </CCol>

                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Self Training Scheduled
                      </div>
                      <div className="fs-5 fw-semibold">
                        {statisticData.selfTrainingCountScheduled}
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
              <CCol xs={12} md={6} xl={6}>
                <CRow>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Self Training Completed
                      </div>
                      <div className="fs-5 fw-semibold">
                        {statisticData.selfTrainingCountCompleted}
                      </div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">
                        Self Training Cancelled
                      </div>
                      <div className="fs-5 fw-semibold">
                        {statisticData.selfTrainingCountCancelled}
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          ) : (
            ''
          )}
        </CCardBody>
      </CCard>
      {role === 'SUPERADMIN' && (
        <CCard className="mb-4">
          <CCardHeader>Today Trainings</CCardHeader>
          <CCardBody>
            <DashboardTrainingList trainings={todayTraining} />
          </CCardBody>
        </CCard>
      )}
      {(role === 'SRM' || role === 'DRM') && (
        <CCard className="mb-4">
          <CCardHeader>Today Trainings</CCardHeader>
          <CCardBody>
            <TodayTrainingList />
          </CCardBody>
        </CCard>
      )}

      {showSrmListModal && (
        <CModal
          visible={srmListModalVisible}
          onClose={() => setSrmListModalVisible(false)}
          size="xl"
        >
          <CModalHeader></CModalHeader>
          <CModalBody>
            <AllSrmList designation={designation} stateId={stateId} />
          </CModalBody>
        </CModal>
      )}
    </CCol>
  )
}

export default Dashboard
