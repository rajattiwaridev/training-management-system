import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser } from '@coreui/icons'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
const Attendance = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const [searchParams] = useSearchParams()
  const trainingId = searchParams.get('trainingId')
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [trainingDetails, setTrainingDetails] = useState(null)

  useEffect(() => {
    if (trainingId) {
      console.log('Training ID:', trainingId)
      // You could fetch training details here if needed
      // fetchTrainingDetails(trainingId)
    }
  }, [trainingId])

  const handleNameChange = (e) => {
    const value = e.target.value
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setUsername(value)
    }
  }

  const handleNumberChange = (e) => {
    const value = e.target.value
    if (value === '' || /^[6-9][0-9]{0,9}$/.test(value)) {
      setPhoneNumber(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!trainingId) {
      alert('No training session specified')
      return
    }

    try {
      const response = await axios.post(`${endpoint}/training/attendance`, {
        name: username,
        mobile: phoneNumber,
        trainingId: trainingId,
      })
      if (response.status === 200) {
        SweetAlert.fire('Success', 'Attendance marked successfully!', 'success')
        setUsername('')
        setPhoneNumber('')
      } else {
        SweetAlert.fire('Error', response.data.msg, 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.response?.data?.message || 'Failed to mark attendance.')
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Attendance</h1>
                  <p className="text-body-secondary">
                    {trainingId ? `Training ID: ${trainingId}` : 'No training specified'}
                  </p>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      name="name"
                      placeholder="Name"
                      value={username}
                      onChange={handleNameChange}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>#</CInputGroupText>
                    <CFormInput
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChange={handleNumberChange}
                      maxLength={10}
                      required
                    />
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton color="success" type="submit">
                      Mark Attendance
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Attendance
