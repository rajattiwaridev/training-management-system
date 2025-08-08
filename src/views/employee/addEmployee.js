import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormFeedback,
  CRow,
  CButton,
} from '@coreui/react'
import axios from 'axios'
import SweetAlert from 'sweetalert2'

const AddEmployee = ({ employee, onClose, onSave }) => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const role = sessionStorage.getItem('role')
  const stateId = sessionStorage.getItem('stateId')
  const [validated, setValidated] = useState(false)
  const [states, setStates] = useState([])
  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [loadingStates, setLoadingStates] = useState(true)
  const [loadingDivisions, setLoadingDivisions] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [isDataReady, setIsDataReady] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const [formData, setFormData] = useState({
    state: role === 'SRM' && stateId ? stateId : '',
    division: '',
    district: '',
    name: '',
    mobile: '',
    officerEmail: '',
    designation: '',
    address: '',
    photo: '',
    postQualification: '',
    dob: '',
    dateOfJoining: '',
    gender: '',
    personalEmail: '',
    fatherName: '',
  })

  const loadLocationData = async () => {
    try {
      setLoadingStates(true)
      let statesData = []
      if (role === 'SRM' && stateId) {
        const stateResponse = await axios.get(`${endpoint}/states/${stateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        statesData = [stateResponse.data]
      } else {
        const response = await axios.get(`${endpoint}/states`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        statesData = response.data
      }
      setStates(statesData)
      if (employee) {
        const employeeStateId = employee.state?._id || ''
        const employeeDivisionId = employee.division?._id || ''
        if (employeeStateId) {
          setLoadingDivisions(true)
          const divisionsResponse = await axios.get(
            `${endpoint}/state/${employeeStateId}/divisions`,
            { headers: { Authorization: `Bearer ${token}` } },
          )
          setDivisions(divisionsResponse.data)
          if (employeeDivisionId) {
            setLoadingDistricts(true)
            const districtsResponse = await axios.get(
              `${endpoint}/division/${employeeDivisionId}/districts`,
              { headers: { Authorization: `Bearer ${token}` } },
            )
            setDistricts(districtsResponse.data)
            setLoadingDistricts(false)
          }
          setLoadingDivisions(false)
        }
      } else {
        if (role === 'SRM' && stateId) {
          setLoadingDivisions(true)
          const divisionsResponse = await axios.get(`${endpoint}/state/${stateId}/divisions`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          setDivisions(divisionsResponse.data)
          setLoadingDivisions(false)
        }
      }
      setIsDataReady(true)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch location data', 'error')
    } finally {
      setLoadingStates(false)
    }
  }
  useEffect(() => {
    loadLocationData()
  }, [])

  useEffect(() => {
    if (isDataReady && employee) {
      setFormData({
        state: employee.state?._id || '',
        division: employee.division?._id || '',
        district: employee.district?._id || '',
        name: employee.name || '',
        mobile: employee.mobile || '',
        officerEmail: employee.officerEmail || '',
        designation: employee.designation,
        address: employee.address || '',
        photo: employee.photo || '',
        postQualification: employee.postQualification || '',
        dob: employee.dob ? employee.dob.split('T')[0] : '',
        dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : '',
        gender: employee.gender || '',
        personalEmail: employee.personalEmail || '',
        fatherName: employee.fatherName || '',
      })
    }
  }, [isDataReady, employee])

  const fetchDivisions = async (stateId) => {
    try {
      setLoadingDivisions(true)
      const response = await axios.get(`${endpoint}/state/${stateId}/divisions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDivisions(response.data)
      setDistricts([])
      setFormData((prev) => ({ ...prev, division: '', district: '' }))
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load divisions', 'error')
    } finally {
      setLoadingDivisions(false)
    }
  }

  const fetchDistricts = async (divisionId) => {
    try {
      setLoadingDistricts(true)
      const response = await axios.get(`${endpoint}/division/${divisionId}/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDistricts(response.data)
      setFormData((prev) => ({ ...prev, district: '' }))
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load districts', 'error')
    } finally {
      setLoadingDistricts(false)
    }
  }

  const handleStateChange = async (e) => {
    const stateId = e.target.value
    setFormData((prev) => ({ ...prev, state: stateId }))
    if (stateId) {
      await fetchDivisions(stateId)
    } else {
      setDivisions([])
      setDistricts([])
    }
  }

  const handleDivisionChange = async (e) => {
    const divisionId = e.target.value
    setFormData((prev) => ({ ...prev, division: divisionId }))
    if (divisionId) {
      await fetchDistricts(divisionId)
    } else {
      setDistricts([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }
    try {
      if (employee) {
        const response = await axios.put(`${endpoint}/employees/${employee._id}`, formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 200) {
          SweetAlert.fire('Success', 'Employee updated successfully', 'success')
          onSave && onSave(response.data)
          onClose && onClose()
        }
      } else {
        const response = await axios.post(`${endpoint}/employees`, formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 201) {
          SweetAlert.fire('Success', 'Employee added successfully', 'success')
          setFormData({
            state: '',
            division: '',
            district: '',
            name: '',
            mobile: '',
            officerEmail: '',
            designation: '',
            address: '',
            photo: '',
            postQualification: '',
            dob: '',
            dateOfJoining: '',
            gender: '',
            personalEmail: '',
            fatherName: '',
          })
          setValidated(false)
          setDivisions([])
          setDistricts([])
          onSave && onSave(response.data)
        }
      }
    } catch (err) {
      const errorMessage = employee ? 'Failed to update employee' : 'Failed to add employee'
      SweetAlert.fire('Error', errorMessage, 'error')
    }
  }
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{employee ? 'Edit' : 'Add'} Employee Details</strong>
          </CCardHeader>
          <CCardBody>
            <CForm
              className="row g-3 needs-validation"
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
            >
              <CCol md={3}>
                <CFormLabel>
                  Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput name="name" value={formData.name} onChange={handleChange} required />
                <CFormFeedback invalid>Please provide name</CFormFeedback>
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  Mobile <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  pattern="^[6789][0-9]{9}$"
                  title="Mobile number must start with 6, 7, or 9 and be 10 digits"
                />
                <CFormFeedback invalid>
                  Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9
                </CFormFeedback>
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  Officer Email <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="email"
                  name="officerEmail"
                  value={formData.officerEmail}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Please provide valid email</CFormFeedback>
              </CCol>

              <CCol md={3}>
                <CFormLabel>Designation</CFormLabel>
                <CFormSelect
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                >
                  <option value="">Select Designation</option>
                  {!(role === 'SRM' || role === 'DRM') && <option value="SRM">SRM</option>}
                  <option value="DRM">DRM</option>
                </CFormSelect>
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  DOB <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  max={today}
                />
                <CFormFeedback invalid>Please select date of birth</CFormFeedback>
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  Date of Joining <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  required
                  max={today}
                />
                <CFormFeedback invalid>Please select joining date</CFormFeedback>
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  Gender <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </CFormSelect>
                <CFormFeedback invalid>Please select gender</CFormFeedback>
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  Post Qualification <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="postQualification"
                  value={formData.postQualification}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Please provide qualification</CFormFeedback>
              </CCol>

              <CCol md={3}>
                <CFormLabel>Personal Email</CFormLabel>
                <CFormInput
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                />
              </CCol>

              <CCol md={3}>
                <CFormLabel>
                  Father's Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Please provide father's name</CFormFeedback>
              </CCol>

              <CCol md={6}>
                <CFormLabel>
                  Address <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Please provide address</CFormFeedback>
              </CCol>

              <CCol md={4}>
                <CFormLabel>
                  State <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="state"
                  value={formData.state}
                  onChange={handleStateChange}
                  required
                  disabled={loadingStates || (role === 'SRM' && stateId)}
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
                  value={formData.division}
                  onChange={handleDivisionChange}
                  required
                  disabled={!formData.state || loadingDivisions}
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
                  value={formData.district}
                  onChange={handleChange}
                  required
                  disabled={!formData.division || loadingDistricts}
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

              <CCol xs={12} className="d-flex justify-content-end gap-2">
                {onClose && (
                  <CButton color="secondary" onClick={onClose}>
                    Cancel
                  </CButton>
                )}
                <CButton type="submit" color="primary">
                  {employee ? 'Update' : 'Submit'}
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddEmployee
