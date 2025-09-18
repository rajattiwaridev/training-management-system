import React, { useState, useEffect } from 'react'
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
    departments: '',
  })
  const [trainings, setTrainings] = useState([])
  const [existingTrainings, setExistingTrainings] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState([])

  // Fetch existing trainings on component mount
  useEffect(() => {
    const fetchExistingTrainings = async () => {
      try {
        const response = await axios.get(`${endpoint}/trainings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setExistingTrainings(response.data)
      } catch (error) {
        console.error('Error fetching existing trainings:', error)
      }
    }
    const fetchAllDepartments = async () => {
      try {
        const response = await axios.get(`${endpoint}/departments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 200) {
          setDepartments(response.data)
        } else {
          SweetAlert.fire('Error', 'Failed to fetch departments', 'error')
        }
      } catch (error) {
        console.error('Error fetching existing trainings:', error)
      }
    }
    fetchExistingTrainings()
    fetchAllDepartments()
  }, [endpoint, token])

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

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleAddTraining = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    // Clear previous errors
    setError('')

    // Time validation
    if (!trainingData.startTime || !trainingData.endTime) {
      setError('Both start and end times are required')
      return
    }

    if (trainingData.startTime >= trainingData.endTime) {
      setError('End time must be after start time')
      return
    }

    // Format date to YYYY-MM-DD in LOCAL time
    const trainingDate = formatDate(trainingData.date)

    // Check for existing training conflicts
    const hasConflict = [...existingTrainings, ...trainings].some((training) => {
      return training.date === trainingDate && training.startTime === trainingData.startTime
    })

    if (hasConflict) {
      setError('A training already exists at this date and start time')
      return
    }
    const filteredDepartments = departments.filter(
      (department) => department._id === trainingData.departments,
    )
    const newTraining = {
      ...trainingData,
      departments: filteredDepartments.length > 0 ? filteredDepartments[0].departmentName : '',
      date: trainingDate,
      id: Date.now(), // temporary ID for local management
    }

    setTrainings([...trainings, newTraining])
    resetForm()
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
      departments: '',
    })
    setValidated(false)
    setError('')
  }

  const handleRemoveTraining = (id) => {
    setTrainings(trainings.filter((training) => training.id !== id))
  }

  const handleSaveAll = async () => {
    if (trainings.length === 0) {
      SweetAlert.fire('Warning', 'Please add at least one training session', 'warning')
      return
    }
    trainings.forEach((training) => {
      if (
        !training.title ||
        !training.trainerName ||
        !training.location ||
        !training.date ||
        !training.startTime ||
        !training.endTime ||
        !training.trainingType ||
        !training.departments
      ) {
        SweetAlert.fire('Error', 'All fields are required for each training session', 'error')
        throw new Error('All fields are required for each training session')
      }
    })
    const body = trainings.map((training) => {
      return {
        ...(training.toObject?.() ?? training), // ensures plain object
        departments: departments.find((dept) => training.departments?.includes(dept.departmentName))
          ?._id,
      }
    })
    setError('')
    setValidated(false)
    setIsLoading(true)
    try {
      const response = await axios.post(`${endpoint}/trainings/${user}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.status === 200) {
        SweetAlert.fire('Success', 'Trainings saved successfully', 'success')
        setTrainings([])
        // Update existing trainings with the newly added ones
        setExistingTrainings([...existingTrainings, ...trainings])
      }
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to save trainings', 'error')
      console.error('Error saving trainings:', error)
    } finally {
      setIsLoading(false)
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

  const formatDateDisplay = (dateString) => {
    if (!dateString) return ''
    const dateObj = new Date(dateString)
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return dateObj.toLocaleDateString(undefined, options)
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
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel>Department</CFormLabel>
                    <CFormSelect
                      name="departments"
                      value={trainingData.departments}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.departmentName}
                        </option>
                      ))}
                    </CFormSelect>
                    <CFormFeedback invalid>Please select department</CFormFeedback>
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
                </CRow>
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
                  className="w-100 border rounded p-2"
                  minDate={new Date(new Date().setDate(new Date().getDate() - 1))}
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
                    <CTableHeaderCell>Department</CTableHeaderCell>
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
                      <CTableDataCell>{training.departments}</CTableDataCell>
                      <CTableDataCell>{training.trainingType}</CTableDataCell>
                      <CTableDataCell>{training.location}</CTableDataCell>
                      <CTableDataCell>{formatDateDisplay(training.date)}</CTableDataCell>
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
                <CButton color="success" onClick={handleSaveAll} disabled={isLoading}>
                  <CIcon icon={cilSave} className="me-2" />
                  {isLoading ? 'Saving...' : 'Save All Trainings'}
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
