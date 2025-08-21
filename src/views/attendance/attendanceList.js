import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CSpinner,
  CButton,
  CRow,
  CCol,
  CAlert,
} from '@coreui/react'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
import { format, parseISO } from 'date-fns'

const AttendanceList = ({ training, onClose, onSave }) => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const [loading, setLoading] = useState(true)
  const [trainingAttendanceList, setTrainingAttendanceList] = useState([])

  useEffect(() => {
    const getAttendanceList = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${endpoint}/training/attendance/${training._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 200) {
          setTrainingAttendanceList(response.data)
        } else {
          SweetAlert.fire('Error', 'No Attendance Found', 'error')
          onClose(true)
        }
      } catch (error) {
        SweetAlert.fire('Error', 'Failed to load training Attendance', 'error')
        onClose(true)
      } finally {
        setLoading(false)
      }
    }

    if (training && training._id) {
      getAttendanceList()
    }
  }, [training, token])

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
  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'scheduled':
        return 'warning'
      case 'cancelled':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  return (
    <div>
      {/* Training Details Card */}
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Training Details</h5>
          <CButton color="secondary" size="sm" onClick={onClose}>
            Close
          </CButton>
        </CCardHeader>
        <CCardBody>
          {training ? (
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Title:</strong> {training.title || 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>Start Time:</strong>{' '}
                  {training.startTime ? formatTime(training.startTime) : 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>Location:</strong> {training.location || 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>Conducted By:</strong> {training.trainerName || 'N/A'}
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Date:</strong>{' '}
                  {training.date ? new Date(training.date).toLocaleDateString() : 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>End Time:</strong>{' '}
                  {training.endTime ? formatTime(training.endTime) : 'N/A'}
                </div>
                <div className="mb-3">
                  <strong>Status:</strong>{' '}
                  <CBadge color={getStatusBadge(training.status)}>
                    {training.status || 'N/A'}
                  </CBadge>
                </div>
                <div className="mb-3">
                  <strong>Total Attendees:</strong> {trainingAttendanceList.length}
                </div>
              </CCol>
            </CRow>
          ) : (
            <CAlert color="warning">No training data available</CAlert>
          )}
        </CCardBody>
      </CCard>

      {/* Attendance List Card */}
      <CCard>
        <CCardHeader>
          <strong>Attendance List</strong>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center">
              <CSpinner />
              <p>Loading attendance data...</p>
            </div>
          ) : trainingAttendanceList.length > 0 ? (
            <CTable hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Mobile</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {trainingAttendanceList.map((employee, index) => (
                  <CTableRow key={employee._id}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{employee.name}</CTableDataCell>
                    <CTableDataCell>{employee.mobile || 'N/A'}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : (
            <CAlert color="info">No attendance records found for this training</CAlert>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AttendanceList
