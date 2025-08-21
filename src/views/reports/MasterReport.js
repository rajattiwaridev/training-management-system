import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormFeedback,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CPaginationItem,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilSearch } from '@coreui/icons'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
import { Tag } from 'antd'
import dayjs from 'dayjs'
import AttendanceList from '../attendance/attendanceList'

const MasterReport = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')

  // State management
  const [states, setStates] = useState([])
  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [reportData, setReportData] = useState([])

  // Selected values
  const [selectedState, setSelectedState] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  // Loading states
  const [loadingStates, setLoadingStates] = useState(true)
  const [loadingDivisions, setLoadingDivisions] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)

  // Validation states
  const [stateValid, setStateValid] = useState(true)
  const [divisionValid, setDivisionValid] = useState(true)
  const [districtValid, setDistrictValid] = useState(true)

  const [trainingModal, setTrainingModal] = useState(false)
  const [trainingData, setTrainingData] = useState([])
  // Load states on component mount
  useEffect(() => {
    loadLocationData()
  }, [])

  const loadLocationData = async () => {
    try {
      setLoadingStates(true)
      const response = await axios.get(`${endpoint}/states`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStates(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch location data', 'error')
    } finally {
      setLoadingStates(false)
    }
  }

  const fetchDivisions = async (stateId) => {
    try {
      setLoadingDivisions(true)
      setSelectedDivision('')
      setSelectedDistrict('')
      setDivisions([])
      setDistricts([])

      const response = await axios.get(`${endpoint}/state/${stateId}/divisions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDivisions(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load divisions', 'error')
    } finally {
      setLoadingDivisions(false)
    }
  }

  const fetchDistricts = async (divisionId) => {
    try {
      setLoadingDistricts(true)
      setSelectedDistrict('')
      setDistricts([])

      const response = await axios.get(`${endpoint}/division/${divisionId}/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDistricts(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load districts', 'error')
    } finally {
      setLoadingDistricts(false)
    }
  }

  const handleStateChange = async (e) => {
    const stateId = e.target.value
    setSelectedState(stateId)
    setStateValid(!!stateId)

    if (stateId) {
      await fetchDivisions(stateId)
    } else {
      setDivisions([])
      setDistricts([])
      setSelectedDivision('')
      setSelectedDistrict('')
    }
  }

  const handleDivisionChange = async (e) => {
    const divisionId = e.target.value
    setSelectedDivision(divisionId)
    setDivisionValid(!!divisionId)

    if (divisionId) {
      await fetchDistricts(divisionId)
    } else {
      setDistricts([])
      setSelectedDistrict('')
    }
  }

  const handleDistrictChange = (e) => {
    const districtId = e.target.value
    setSelectedDistrict(districtId)
    setDistrictValid(!!districtId)
  }

  const getReportData = async () => {
    try {
      setLoadingReport(true)
      const response = await axios.get(
        `${endpoint}/reports?state=${selectedState}&division=${selectedDivision}&district=${selectedDistrict}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setReportData(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch report data', 'error')
      setReportData([])
    } finally {
      setLoadingReport(false)
    }
  }
  const [name, setName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const handleShowTrainings = async (name, districtName, id, type) => {
    try {
      setName(name)
      setDistrictName(districtName)
      const response = await axios.get(`${endpoint}/trainings-reports/${id}?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.length > 0) {
        setTrainingModal(true)
        setTrainingData(response.data)
      } else {
        SweetAlert.fire('No Trainings', 'No training data available for this selection', 'info')
      }
    } catch (error) {
      SweetAlert.fire('Error', 'No trainings found for this employee', 'error')
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)

    if (hour === 0) {
      return `12:${minutes} AM`
    } else if (hour === 12) {
      return `12:${minutes} PM`
    } else if (hour > 12) {
      return `${hour - 12}:${minutes} PM`
    } else {
      return `${hour}:${minutes} AM`
    }
  }

  //Employee Report Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(reportData.length / itemsPerPage)
  const renderPaginationItems = () => {
    const items = []
    items.push(
      <CPaginationItem
        key="prev"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </CPaginationItem>,
    )
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <CPaginationItem key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
          {i}
        </CPaginationItem>,
      )
    }
    items.push(
      <CPaginationItem
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </CPaginationItem>,
    )
    return items
  }

  //Training Report Pagination
  const [currentPageTraining, setCurrentPageTraining] = useState(1)
  const itemsPerPageTraining = 10
  const indexOfLastItemTraining = currentPageTraining * itemsPerPageTraining
  const indexOfFirstItemTraining = indexOfLastItemTraining - itemsPerPageTraining
  const currentItemsTraining = trainingData.slice(indexOfFirstItemTraining, indexOfLastItemTraining)
  const totalPagesTraining = Math.ceil(trainingData.length / itemsPerPageTraining)
  const renderPaginationItemsTraining = () => {
    const items = []
    items.push(
      <CPaginationItem
        key="prev"
        disabled={currentPageTraining === 1}
        onClick={() => setCurrentPageTraining(currentPageTraining - 1)}
      >
        Previous
      </CPaginationItem>,
    )
    for (let i = 1; i <= totalPagesTraining; i++) {
      items.push(
        <CPaginationItem
          key={i}
          active={i === currentPageTraining}
          onClick={() => setCurrentPageTraining(i)}
        >
          {i}
        </CPaginationItem>,
      )
    }
    items.push(
      <CPaginationItem
        key="next"
        disabled={currentPageTraining === totalPagesTraining}
        onClick={() => setCurrentPageTraining(currentPageTraining + 1)}
      >
        Next
      </CPaginationItem>,
    )
    return items
  }
  const [trainingAttendanceModal, setTrainingAttendanceModal] = useState(false)
  const [training, setTraining] = useState([])
  const handleShowTrainingAttendance = async (trainingData) => {
    setTraining(trainingData)
    setTrainingAttendanceModal(true)
  }

  //Feedback
  const [currentTraining, setCurrentTraining] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const handleViewFeedback = (training, type) => {
    setCurrentTraining(training)
    fetchFeedbacks(training._id, type)
  }
  const fetchFeedbacks = async (trainingId, type) => {
    try {
      setFeedbackLoading(true)
      const response = await axios.get(`${endpoint}/feedbacks/training/${trainingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.status === 200) {
        let data = []
        if (type === 'requested') {
          data = response.data.filter((item) => item.status === false)
        } else if (type === 'received') {
          data = response.data.filter((item) => item.status === true)
        } else {
          data = response.data
        }
        setFeedbacks(data)
        setFeedbackLoading(false)
        setFeedbackModalVisible(true)
      } else {
        SweetAlert.fire('No Feedbacks', 'No feedbacks available for this training', 'info')
        setFeedbackLoading(false)
        setFeedbackModalVisible(false)
      }
    } catch (error) {
      SweetAlert.fire('Error', 'No feedbacks', 'error')
      setFeedbackLoading(false)
    }
  }
  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      searchTerm === '' ||
      (feedback.name && feedback.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (feedback.mobile && feedback.mobile.includes(searchTerm)) ||
      (feedback.suggestions &&
        feedback.suggestions.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDate =
      dateFilter === '' ||
      (feedback.submittedAt && dayjs(feedback.submittedAt).format('YYYY-MM-DD') === dateFilter)

    const matchesRating =
      ratingFilter === '' ||
      feedback.trainerRating == ratingFilter ||
      feedback.contentRating == ratingFilter

    return matchesSearch && matchesDate && matchesRating
  })
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Report</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="g-3">
              <CCol md={4}>
                <CFormLabel>
                  State <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="state"
                  value={selectedState}
                  onChange={handleStateChange}
                  required
                  invalid={!stateValid}
                  disabled={loadingStates}
                >
                  <option value="">{loadingStates ? 'Loading states...' : 'Select State'}</option>
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.stateName}
                    </option>
                  ))}
                </CFormSelect>
                <CFormFeedback invalid>Please select state</CFormFeedback>
              </CCol>

              <CCol md={4}>
                <CFormLabel>
                  Division <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="division"
                  value={selectedDivision}
                  onChange={handleDivisionChange}
                  required
                  invalid={!divisionValid}
                  disabled={loadingDivisions || !selectedState}
                >
                  <option value="">
                    {loadingDivisions ? 'Loading divisions...' : 'Select Division'}
                  </option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div._id}>
                      {div.name}
                    </option>
                  ))}
                </CFormSelect>
                <CFormFeedback invalid>Select a division</CFormFeedback>
              </CCol>

              <CCol md={4}>
                <CFormLabel>
                  District <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="district"
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  required
                  invalid={!districtValid}
                  disabled={loadingDistricts || !selectedDivision}
                >
                  <option value="">
                    {loadingDistricts ? 'Loading districts...' : 'Select District'}
                  </option>
                  {districts.map((dist) => (
                    <option key={dist._id} value={dist._id}>
                      {dist.districtName} ({dist.districtNameEng})
                    </option>
                  ))}
                </CFormSelect>
                <CFormFeedback invalid>Select a district</CFormFeedback>
              </CCol>

              <CCol xs={12} className="text-center mt-3">
                <button
                  className="btn btn-primary"
                  onClick={getReportData}
                  disabled={loadingReport}
                >
                  {loadingReport ? <CSpinner size="sm" /> : 'Generate Report'}
                </button>
              </CCol>
            </CRow>

            {/* Report Display */}
            {reportData.length > 0 && (
              <div className="mt-4">
                <CTable striped responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>State / Division / District</CTableHeaderCell>
                      <CTableHeaderCell>Total Training</CTableHeaderCell>
                      <CTableHeaderCell>Total Scheduled Training</CTableHeaderCell>
                      <CTableHeaderCell>Total Completed Training</CTableHeaderCell>
                      <CTableHeaderCell>Total Cancelled Training</CTableHeaderCell>
                      {/* Add more headers based on your API response structure */}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentItems.map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{item.name}</CTableDataCell>
                        <CTableDataCell>
                          {item.state.stateName} / {item.division.name} /{' '}
                          {item.district.districtNameEng}
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          <Tag
                            color="blue"
                            style={{ color: 'black' }}
                            onClick={() =>
                              handleShowTrainings(
                                item.name,
                                item.district.districtNameEng,
                                item._id,
                                'all',
                              )
                            }
                          >
                            {item.totalTraining}
                          </Tag>
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          <Tag
                            color="orange"
                            style={{ color: 'black' }}
                            onClick={() =>
                              handleShowTrainings(
                                item.name,
                                item.district.districtNameEng,
                                item._id,
                                'scheduled',
                              )
                            }
                          >
                            {item.scheduledTraining}
                          </Tag>
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          <Tag
                            color="green"
                            style={{ color: 'black' }}
                            onClick={() =>
                              handleShowTrainings(
                                item.name,
                                item.district.districtNameEng,
                                item._id,
                                'completed',
                              )
                            }
                          >
                            {item.completedTraining}
                          </Tag>
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          <Tag
                            color="red"
                            style={{ color: 'black' }}
                            onClick={() =>
                              handleShowTrainings(
                                item.name,
                                item.district.districtNameEng,
                                item._id,
                                'cancelled',
                              )
                            }
                          >
                            {item.cancelledTraining}
                          </Tag>
                        </CTableDataCell>
                        {/* Add more cells based on your API response structure */}
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                {/* Pagination */}
                {totalPages > 1 && (
                  <CPagination className="mt-3" aria-label="Page navigation">
                    {renderPaginationItems()}
                  </CPagination>
                )}

                {/* Results count */}
                <div className="mt-2 text-muted">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, reportData.length)}{' '}
                  of {reportData.length} entries
                </div>
              </div>
            )}

            {reportData.length === 0 && !loadingReport && selectedDistrict && (
              <div className="text-center mt-4">
                <p>No report data available for the selected criteria</p>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      <CModal visible={trainingModal} onClose={() => setTrainingModal(false)} size="xl" fullscreen>
        <CModalHeader>
          <b>
            Employee Name : {name} , District : {districtName}
            <br />
            Training List
          </b>
        </CModalHeader>
        <CModalBody>
          {trainingData.length > 0 && (
            <div className="mt-4">
              <CTable striped responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                    <CTableHeaderCell>Trainer Name</CTableHeaderCell>
                    <CTableHeaderCell>Department</CTableHeaderCell>
                    <CTableHeaderCell>Training Type</CTableHeaderCell>
                    <CTableHeaderCell>Date & Time</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                    <CTableHeaderCell>Total Attendance</CTableHeaderCell>
                    <CTableHeaderCell>Requested Feedback</CTableHeaderCell>
                    <CTableHeaderCell>Received Feedback</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentItemsTraining.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{item.title}</CTableDataCell>
                      <CTableDataCell>{item.trainerName}</CTableDataCell>
                      <CTableDataCell>{item.departments?.departmentName}</CTableDataCell>
                      <CTableDataCell>{item.trainingType}</CTableDataCell>
                      <CTableDataCell>
                        Date : {new Date(item.date).toLocaleDateString()} <br /> Time :{' '}
                        {formatTime(item.startTime)} to {formatTime(item.endTime)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell style={{ textAlign: 'center' }}>
                        <Tag
                          color="blue"
                          style={{ color: 'black' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShowTrainingAttendance(item)
                          }}
                        >
                          {item.totalAttendance}
                        </Tag>
                      </CTableDataCell>
                      <CTableDataCell style={{ textAlign: 'center' }}>
                        <Tag
                          color="orange"
                          style={{ color: 'black' }}
                          onClick={() => handleViewFeedback(item, 'requested')}
                        >
                          {item.requestedFeedback}
                        </Tag>
                      </CTableDataCell>
                      <CTableDataCell style={{ textAlign: 'center' }}>
                        <Tag
                          color="green"
                          style={{ color: 'black' }}
                          onClick={() => handleViewFeedback(item, 'received')}
                        >
                          {item.receivedFeedback}
                        </Tag>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {/* Pagination */}
              {totalPagesTraining > 1 && (
                <CPagination className="mt-3" aria-label="Page navigation">
                  {renderPaginationItemsTraining()}
                </CPagination>
              )}

              {/* Results count */}
              <div className="mt-2 text-muted">
                Showing {indexOfFirstItemTraining + 1} to{' '}
                {Math.min(indexOfLastItemTraining, trainingData.length)} of {trainingData.length}{' '}
                entries
              </div>
            </div>
          )}
          {trainingData.length === 0 && (
            <div className="text-center mt-4">
              <p>No report data available</p>
            </div>
          )}
        </CModalBody>
      </CModal>
      {trainingAttendanceModal && (
        <CModal
          visible={trainingAttendanceModal}
          onClose={() => setTrainingAttendanceModal(false)}
          size="xl"
          fullscreen
        >
          <CModalHeader>Attendance List</CModalHeader>
          <CModalBody>
            <AttendanceList training={training} onClose={() => setTrainingAttendanceModal(null)} />
          </CModalBody>
        </CModal>
      )}
      {/* Feedback Modal */}
      <CModal
        visible={feedbackModalVisible}
        onClose={() => {
          setFeedbackModalVisible(false)
          setSearchTerm('')
          setDateFilter('')
          setRatingFilter('')
          setFeedbacks([])
        }}
        size="xl"
        scrollable
        fullscreen
      >
        <CModalHeader closeButton>
          <CModalTitle>Feedback for: {currentTraining?.title}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-4">
            <div className="row">
              <div className="col-md-4">
                <strong>Date:</strong> {dayjs(currentTraining?.date).format('MMMM D, YYYY')}
              </div>
              <div className="col-md-4">
                <strong>Trainer:</strong> {currentTraining?.trainerName}
              </div>
            </div>
          </div>

          <hr />

          {feedbackLoading ? (
            <div className="text-center">
              <CSpinner color="primary" />
              <p>Loading feedback...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center text-muted p-4">
              {feedbacks.length === 0
                ? 'No feedback submitted for this training yet'
                : 'No feedback matches your filters'}
            </div>
          ) : (
            <div className="feedback-container">
              <div className="row row-cols-1 row-cols-md-2 g-4">
                {feedbacks.map((feedback) => (
                  <div className="col" key={feedback._id}>
                    <div className="card h-100">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{feedback.name || 'Anonymous'}</strong>
                          {feedback.mobile && <div className="small">{feedback.mobile}</div>}
                        </div>
                        <div className="text-muted small">
                          {feedback.submittedAt
                            ? dayjs(feedback.submittedAt).format('MMM D, YYYY h:mm A')
                            : 'No date'}
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row mb-3">
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <span className="me-2">Trainer:</span>
                              <span className="text-warning">
                                {'★'.repeat(feedback.trainerRating)}
                                {'☆'.repeat(5 - feedback.trainerRating)}
                              </span>
                              <span className="ms-2">({feedback.trainerRating}/5)</span>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="d-flex align-items-center">
                              <span className="me-2">Content:</span>
                              <span className="text-warning">
                                {'★'.repeat(feedback.contentRating)}
                                {'☆'.repeat(5 - feedback.contentRating)}
                              </span>
                              <span className="ms-2">({feedback.contentRating}/5)</span>
                            </div>
                          </div>
                        </div>

                        {feedback.suggestions && (
                          <div className="mt-3">
                            <strong>Suggestions:</strong>
                            <div className="border p-2 mt-1 rounded bg-light">
                              {feedback.suggestions}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setFeedbackModalVisible(false)
              setSearchTerm('')
              setDateFilter('')
              setRatingFilter('')
              setFeedbacks([])
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default MasterReport
