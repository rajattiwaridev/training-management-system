import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilInfo, cilSearch } from '@coreui/icons'
import axios from 'axios'
import dayjs from 'dayjs'
import SweetAlert from 'sweetalert2'

const FeedbackList = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const userId = sessionStorage.getItem('user')
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [currentTraining, setCurrentTraining] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')

  const fetchCompletedTrainings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${endpoint}/trainings/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'completed' },
      })
      setTrainings(response.data)
      setLoading(false)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load trainings', 'error')
      setLoading(false)
    }
  }

  const fetchFeedbacks = async (trainingId) => {
    try {
      setFeedbackLoading(true)
      const response = await axios.get(`${endpoint}/feedbacks/training/${trainingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFeedbacks(response.data.filter(feedback => feedback.status === true)) // Only show received feedback
      setFeedbackLoading(false)
      setFeedbackModalVisible(true)
    } catch (error) {
      SweetAlert.fire('Error', 'No feedbacks', 'error')
      setFeedbackLoading(false)
    }
  }

  useEffect(() => {
    fetchCompletedTrainings()
  }, [])

  const handleViewFeedback = (training) => {
    setCurrentTraining(training)
    fetchFeedbacks(training._id)
  }

  // Filter feedbacks based on search criteria
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
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Completed Training Sessions</h5>
                <p className="text-medium-emphasis small">
                  View user feedback for completed trainings
                </p>
              </div>
              <CButton color="primary" onClick={fetchCompletedTrainings}>
                Refresh
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
                <p>Loading completed trainings...</p>
              </div>
            ) : trainings.length === 0 ? (
              <div className="text-center text-muted p-4">No completed training sessions found</div>
            ) : (
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                    <CTableHeaderCell>Trainer</CTableHeaderCell>
                    <CTableHeaderCell>Department</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Attendance</CTableHeaderCell>
                    <CTableHeaderCell>Feedback Count</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {trainings.map((training) => (
                    <CTableRow key={training._id}>
                      <CTableDataCell>{training.title}</CTableDataCell>
                      <CTableDataCell>{training.trainerName}</CTableDataCell>
                      <CTableDataCell>{training.departments?.departmentName}</CTableDataCell>
                      <CTableDataCell>{dayjs(training.date).format('MMM D, YYYY')}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info">{training.attendanceCount || 0} attendees</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="info">{training.feedbackCount || 0} feedbacks</CBadge>
                      </CTableDataCell>
                      {training.feedbackCount > 0 ? (
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleViewFeedback(training)}
                          >
                            <CIcon icon={cilInfo} className="me-1" />
                            View Feedback
                          </CButton>
                        </CTableDataCell>
                      ) : (
                        <CTableDataCell>
                          <CButton color="danger" size="sm">
                            <CIcon icon={cilInfo} className="me-1" />
                            No Feedback
                          </CButton>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

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
              <div className="col-md-4">
                <strong>Attendance:</strong> {currentTraining?.attendanceCount || 0} participants
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <div className="input-group" style={{ width: '300px' }}>
              <CFormInput
                placeholder="Search by name, mobile, or feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CButton color="primary" type="button">
                <CIcon icon={cilSearch} />
              </CButton>
            </div>

            <div>
              <CFormInput
                type="date"
                placeholder="Filter by date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div>
              <CFormSelect value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="">All Ratings</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </CFormSelect>
            </div>
          </div>

          <hr />

          {feedbackLoading ? (
            <div className="text-center">
              <CSpinner color="primary" />
              <p>Loading feedback...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center text-muted p-4">
              {feedbacks.length === 0
                ? 'No feedback submitted for this training yet'
                : 'No feedback matches your filters'}
            </div>
          ) : (
            <div className="feedback-container">
              <div className="row row-cols-1 row-cols-md-2 g-4">
                {filteredFeedbacks.map((feedback) => (
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

export default FeedbackList
