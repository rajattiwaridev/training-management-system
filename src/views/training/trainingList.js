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
  CFormSelect,
  CBadge,  
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSync } from '@coreui/icons'
import SweetAlert from 'sweetalert2'
import axios from 'axios'
import dayjs from 'dayjs'
import { Image } from 'antd'
import AttendanceList from '../attendance/attendanceList'

const TrainingList = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const userId = sessionStorage.getItem('user')
  const [trainings, setTrainings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('scheduled')
  const [refresh, setRefresh] = useState(false)
  const [titleFilter, setTitleFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [attendanceListModalVisible, setAttendanceListModalVisible] = useState(false)
  
  // New state for completion modal
  const [completionModalVisible, setCompletionModalVisible] = useState(false)
  const [currentTraining, setCurrentTraining] = useState(null)
  const [attendanceCount, setAttendanceCount] = useState('')
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)

  const statusColors = {
    scheduled: 'info',
    completed: 'success',
    cancelled: 'danger',
  }

  const fetchTrainings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${endpoint}/trainings/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTrainings(response.data)
      setLoading(false)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load trainings', 'error')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainings()
  }, [refresh])

  const handleDelete = async (id) => {
    const result = await SweetAlert.fire({
      title: 'Are you sure?',
      text: 'This training will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`${endpoint}/trainings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        SweetAlert.fire('Deleted!', 'Training has been deleted.', 'success')
        setRefresh(!refresh)
      } catch (error) {
        SweetAlert.fire('Error', 'Failed to delete training', 'error')
      }
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      // If changing to completed, open modal instead of updating immediately
      if (newStatus === 'completed') {
        const training = trainings.find(t => t._id === id)
        if (training) {
          setCurrentTraining(training)
          setCompletionModalVisible(true)
        }
        return
      }
      
      // For other statuses, update immediately
      await axios.patch(
        `${endpoint}/trainings/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setRefresh(!refresh)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to update status', 'error')
    }
  }

  const handleCompleteTraining = async () => {
    if (!attendanceCount) {
      SweetAlert.fire('Error', 'Please enter attendance count', 'error')
      return
    }
    
    if (photos.length < 2) {
      SweetAlert.fire('Error', 'Please upload at least 2 photos', 'error')
      return
    }
    
    try {
      setUploading(true)
      
      // Prepare form data
      const formData = new FormData()
      formData.append('status', 'completed')
      formData.append('attendanceCount', attendanceCount)
      photos.forEach(photo => {
        formData.append('photos', photo)
      })
      
      // Send update request
      await axios.patch(
       `${endpoint}/trainings/${currentTraining._id}/status`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      // Reset and close
      setCompletionModalVisible(false)
      setAttendanceCount('')
      setPhotos([])
      setRefresh(!refresh)
      SweetAlert.fire('Success', 'Training marked as completed', 'success')
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to complete training', 'error')
    } finally {
      setUploading(false)
    }
  }

  const filteredTrainings = trainings.filter((training) => {
    const matchesStatus = filter === 'all' || training.status === filter
    const matchesTitle =
      titleFilter === '' || training.title.toLowerCase().includes(titleFilter.toLowerCase())
    const matchesType =
      typeFilter === '' || training.trainingType.toLowerCase().includes(typeFilter.toLowerCase())
    const matchesDate =
      dateFilter === '' || dayjs(training.date).format('YYYY-MM-DD') === dateFilter

    return matchesStatus && matchesTitle && matchesType && matchesDate
  })

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    return hour > 12
      ? `${hour - 12}:${minutes} PM`
      : hour === 12
        ? `12:${minutes} PM`
        : `${hour}:${minutes} AM`
  }

  const [trainingAttendanceListModalEmployee, setTrainingAttendanceListModalEmployee] = useState(null)
  const handleAttendanceList = async (employee) => {
    setTrainingAttendanceListModalEmployee(employee)
    setAttendanceListModalVisible(true)
  }
  
  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files))
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5>Training Sessions</h5>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <CButton color="primary" onClick={() => setRefresh(!refresh)}>
                <CIcon icon={cilSync} className="me-2" />
                Refresh
              </CButton>

              <CFormSelect
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Trainings</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </CFormSelect>

              <input
                type="text"
                className="form-control"
                placeholder="Search by Title"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                style={{ width: 'auto' }}
              />

              <CFormSelect
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto' }}
              >
                <option value="">All Types</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </CFormSelect>

              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ width: 'auto' }}
              />
            </div>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
                <p>Loading trainings...</p>
              </div>
            ) : filteredTrainings.length === 0 ? (
              <div className="text-center text-muted p-4">No training sessions found</div>
            ) : (
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                    <CTableHeaderCell>Trainer</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Location</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>QR Image</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredTrainings.map((training) => (
                    <CTableRow key={training._id}>
                      <CTableDataCell>{training.title}</CTableDataCell>
                      <CTableDataCell>{training.trainerName}</CTableDataCell>
                      <CTableDataCell className="text-capitalize">
                        {training.trainingType}
                      </CTableDataCell>
                      <CTableDataCell>{training.location}</CTableDataCell>
                      <CTableDataCell>{dayjs(training.date).format('MMM D, YYYY')}</CTableDataCell>
                      <CTableDataCell>
                        {formatTime(training.startTime)} - {formatTime(training.endTime)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {training.status === 'scheduled' ? (
                          <CFormSelect
                            value={training.status}
                            onChange={(e) => handleStatusChange(training._id, e.target.value)}
                            size="sm"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </CFormSelect>
                        ) : (
                          <CBadge color={statusColors[training.status]}>
                            {training.status.toUpperCase()}
                          </CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <Image
                          width="50px"
                          height="50px"
                          src={`${endpoint}/${training.qrCodeImg}`}
                        />
                      </CTableDataCell>
                      {training.status === 'scheduled' ? (
                        <CTableDataCell>
                          <div className="d-flex gap-2">
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDelete(training._id)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                            <CButton
                              color="info"
                              size="sm"
                              className="me-2"
                              title="Edit Employee"
                              onClick={() => handleAttendanceList(training)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                          </div>
                        </CTableDataCell>
                      ) : (
                        ''
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      {/* Attendance List Modal */}
      {attendanceListModalVisible && (
        <CModal
          visible={attendanceListModalVisible}
          onClose={() => setAttendanceListModalVisible(false)}
          size="lg"
        >
          <CModalHeader>Attendance List</CModalHeader>
          <CModalBody>
            <AttendanceList
              training={trainingAttendanceListModalEmployee}
              onClose={() => setTrainingAttendanceListModalEmployee(null)}
            />
          </CModalBody>
        </CModal>
      )}
      
      {/* Completion Modal */}
      <CModal 
        visible={completionModalVisible} 
        onClose={() => setCompletionModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Complete Training Session</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {currentTraining && (
            <div>
              <p>You are marking <strong>{currentTraining.title}</strong> as completed.</p>
              <p>Date: {dayjs(currentTraining.date).format('MMM D, YYYY')}</p>
              
              <div className="mb-3">
                <label className="form-label">Total Attendance Count</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={attendanceCount}
                  onChange={(e) => setAttendanceCount(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">
                  Upload Photos (Minimum 2 required)
                </label>
                <input
                  type="file"
                  className="form-control"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <div className="form-text">
                  {photos.length > 0 
                    ? `${photos.length} photos selected` 
                    : 'No photos selected'}
                </div>
                {photos.length < 2 && (
                  <div className="text-danger">
                    Please select at least 2 photos
                  </div>
                )}
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => {
              setCompletionModalVisible(false)
              setPhotos([])
              setAttendanceCount('')
            }}
            disabled={uploading}
          >
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleCompleteTraining}
            disabled={uploading || photos.length < 2 || !attendanceCount}
          >
            {uploading ? <CSpinner size="sm" /> : 'Complete Training'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default TrainingList