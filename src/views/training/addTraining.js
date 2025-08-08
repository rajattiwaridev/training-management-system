import React, { useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CCol,
  CRow,
  CFormSelect,
  CFormFeedback,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
} from '@coreui/react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import CIcon from '@coreui/icons-react'
import { cilSave, cilX, cilPlus, cilTrash } from '@coreui/icons'
import SweetAlert from 'sweetalert2'
import axios from 'axios'

const AddTraining = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const role = sessionStorage.getItem('role')
  const stateId = sessionStorage.getItem('stateId')
  const user = sessionStorage.getItem('user')
  const [validated, setValidated] = useState(false)
  const [trainingData, setTrainingData] = useState({
    title: '',
    trainerName: '',
    location: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    trainingType: '',
  })
  const [trainings, setTrainings] = useState([])
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setTrainingData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (date) => {
    setTrainingData((prev) => ({
      ...prev,
      date,
    }))
  }

  const handleAddTraining = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    const today = new Date()
    const selectedDate = new Date(trainingData.date)
    const isToday = today.toDateString() === selectedDate.toDateString()

    if (trainingData.startTime >= trainingData.endTime) {
      setError('End time must be after start time')
      return
    }

    if (isToday) {
      const now = new Date()
      const [startHour, startMin] = trainingData.startTime.split(':').map(Number)
      const startDateTime = new Date(selectedDate)
      startDateTime.setHours(startHour, startMin, 0)

      if (startDateTime < now) {
        setError('Start time cannot be in the past')
        return
      }
    }

    // Format date to YYYY-MM-DD
    const formattedDate = trainingData.date.toISOString().split('T')[0]

    const newTraining = {
      ...trainingData,
      date: formattedDate,
      id: Date.now(), // temporary ID for local management
    }

    setTrainings([...trainings, newTraining])
    resetForm()
    setError('')
  }

  const resetForm = () => {
    setTrainingData({
      title: '',
      trainerName: '',
      location: '',
      date: new Date(),
      startTime: '',
      endTime: '',
      trainingType: '',
    })
    setValidated(false)
  }

  const handleRemoveTraining = (id) => {
    setTrainings(trainings.filter((training) => training.id !== id))
  }

  const handleSaveAll = async () => {
    if (trainings.length === 0) {
      SweetAlert.fire('Warning', 'Please add at least one training session', 'warning')
      return
    }
    console.log(trainingData);
    try {
      const response = await axios.post(`${endpoint}/trainings/${user}`, trainings, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.status === 200) {
        SweetAlert.fire('Success', 'Trainings saved successfully', 'success')
        setTrainings([])
      }
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to save trainings', 'error')
      console.error('Error saving trainings:', error)
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    return hour > 12 ? `${hour - 12}:${minutes} PM` : `${hour}:${minutes} AM`
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h5>Add New Training</h5>
          </CCardHeader>
          <CCardBody>
            <CForm
              className="row g-3 needs-validation"
              noValidate
              validated={validated}
              onSubmit={handleAddTraining}
            >
              <CCol md={6}>
                <CFormLabel>Training Title</CFormLabel>
                <CFormInput
                  type="text"
                  name="title"
                  value={trainingData.title}
                  onChange={handleChange}
                  placeholder="Enter training title"
                  required
                />
                <CFormFeedback invalid>Please enter a title</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Trainer Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="trainerName"
                  value={trainingData.trainerName}
                  onChange={handleChange}
                  placeholder="Enter trainer name"
                  required
                />
                <CFormFeedback invalid>Please enter trainer name</CFormFeedback>
              </CCol>

              <CCol md={6}>
                <CFormLabel>Training Type</CFormLabel>
                <CFormSelect
                  name="trainingType"
                  value={trainingData.trainingType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </CFormSelect>
                <CFormFeedback invalid>Please select training type</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Location</CFormLabel>
                <CFormInput
                  type="text"
                  name="location"
                  value={trainingData.location}
                  onChange={handleChange}
                  placeholder="Enter training location"
                  required
                />
                <CFormFeedback invalid>Please enter location</CFormFeedback>
              </CCol>

              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <Calendar
                  onChange={handleDateChange}
                  value={trainingData.date}
                  minDate={new Date()} // 🔒 block past dates
                  className="w-100 border rounded p-2"
                />
              </CCol>
              <CCol md={6}>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Start Time</CFormLabel>
                    <CFormInput
                      type="time"
                      name="startTime"
                      value={trainingData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <CFormLabel>End Time</CFormLabel>
                    <CFormInput
                      type="time"
                      name="endTime"
                      value={trainingData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </CCol>
                </CRow>
                {error && <CAlert color="danger">{error}</CAlert>}
              </CCol>

              <CCol className="d-flex justify-content-end gap-2">
                <CButton color="danger" type="button" onClick={resetForm}>
                  <CIcon icon={cilX} className="me-2" />
                  Clear
                </CButton>
                <CButton color="primary" type="submit">
                  <CIcon icon={cilPlus} className="me-2" />
                  Add Training
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>

        {trainings.length > 0 && (
          <CCard className="mb-4">
            <CCardHeader>
              <h5>Training Sessions Preview</h5>
            </CCardHeader>
            <CCardBody>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Title</CTableHeaderCell>
                    <CTableHeaderCell>Trainer</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Location</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {trainings.map((training) => (
                    <CTableRow key={training.id}>
                      <CTableDataCell>{training.title}</CTableDataCell>
                      <CTableDataCell>{training.trainerName}</CTableDataCell>
                      <CTableDataCell>{training.trainingType}</CTableDataCell>
                      <CTableDataCell>{training.location}</CTableDataCell>
                      <CTableDataCell>{training.date}</CTableDataCell>
                      <CTableDataCell>
                        {formatTime(training.startTime)} - {formatTime(training.endTime)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleRemoveTraining(training.id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <div className="d-flex justify-content-end mt-3">
                <CButton color="success" onClick={handleSaveAll}>
                  <CIcon icon={cilSave} className="me-2" />
                  Save All Trainings
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        )}
      </CCol>
    </CRow>
  )
}

export default AddTraining
