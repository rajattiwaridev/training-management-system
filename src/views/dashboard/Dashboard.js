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
  const stateId = sessionStorage.getItem('stateId');
  console.log(stateId);
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
        const response = await axios.get(`${endpoint}/get-today-trainings`, {
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
  const [designation, setDesignation] = useState(null);
  const handleShowSRMList = async (type) => {
    setDesignation(type);
    setSrmListModalVisible(true);
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
                  <CCol xs={6} onClick={() => handleShowSRMList('SRM')}>
                    <div className="border-start border-start-4 border-start-info py-1 px-3">
                      <div className="text-body-secondary text-truncate small">Total SRM's</div>
                      <div className="fs-5 fw-semibold">{statisticData.srmCount}</div>
                    </div>
                  </CCol>
                  <CCol xs={6} onClick={() => handleShowSRMList('DRM')}>
                    <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                      <div className="text-body-secondary text-truncate small">Total DRM's</div>
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
      <CCard className="mb-4">
        <CCardHeader>Today Trainings</CCardHeader>
        <CCardBody>
          <DashboardTrainingList trainings={todayTraining} />
        </CCardBody>
      </CCard>

      {showSrmListModal && (
        <CModal
          visible={srmListModalVisible}
          onClose={() => setSrmListModalVisible(false)}
          size="xl"
        >
          <CModalHeader></CModalHeader>
          <CModalBody>
            <AllSrmList designation={designation} stateId={stateId}/>
          </CModalBody>
        </CModal>
      )}
    </CCol>
  )
}

export default Dashboard
