import React, { useEffect, useState, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormSelect,
  CFormLabel,
  CFormFeedback,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
import { CSmartTable } from '@coreui/react-pro'

const AllSrmList = ({ designation, stateId }) => {
  // Constants and state initialization
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const role = sessionStorage.getItem('role')

  const [states, setStates] = useState([])
  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [loadingStates, setLoadingStates] = useState(true)
  const [loadingDivisions, setLoadingDivisions] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [employeeData, setEmployeesData] = useState([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)

  const [formData, setFormData] = useState({
    state: stateId || '',
    division: '',
    district: '',
  })

  // Memoized API call functions
  const fetchDivisions = useCallback(
    async (stateId) => {
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
    },
    [endpoint, token],
  )

  const fetchDistricts = useCallback(
    async (divisionId) => {
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
    },
    [endpoint, token],
  )

  const fetchEmployee = useCallback(async () => {
    if (!formData.state) return

    try {
      setIsLoadingEmployees(true)
      const response = await axios.get(
        `${endpoint}/get-filter-employees?type=${designation}&state=${formData.state}&division=${formData.division}&district=${formData.district}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.status === 200) {
        setEmployeesData(response.data)
      } else {
        setEmployeesData([])
        SweetAlert.fire('Info', `No ${designation} Found`, 'info')
      }
    } catch (error) {
      SweetAlert.fire('Error', error.message, 'error')
      setEmployeesData([])
    } finally {
      setIsLoadingEmployees(false)
    }
  }, [endpoint, token, formData.state, formData.division, formData.district, designation])

  const loadLocationData = useCallback(async () => {
    try {
      setLoadingStates(true)
      let statesData = []

      if (role === 'SRM' && stateId) {
        // SRM can only see their own state
        const stateResponse = await axios.get(`${endpoint}/states/${stateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        statesData = [stateResponse.data]
        setFormData((prev) => ({ ...prev, state: stateId }))

        // Load divisions for this state
        await fetchDivisions(stateId)
      } else {
        // Admin or other roles can see all states
        const response = await axios.get(`${endpoint}/states`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        statesData = response.data
      }

      setStates(statesData)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch location data', 'error')
    } finally {
      setLoadingStates(false)
    }
  }, [endpoint, token, role, stateId, fetchDivisions])

  // Event handlers
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

  const handleDistrictChange = (e) => {
    setFormData((prev) => ({ ...prev, district: e.target.value }))
  }

  // Effects
  useEffect(() => {
    loadLocationData()
  }, [loadLocationData])

  useEffect(() => {
    // Add a small delay to prevent rapid API calls during cascading dropdown changes
    const timer = setTimeout(() => {
      fetchEmployee()
    }, 300)

    return () => clearTimeout(timer)
  }, [formData.state, formData.division, formData.district, fetchEmployee])

  // Table configuration
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'officerEmail', label: 'Email' },
  ]

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>{designation} LIST</CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
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
                  onChange={handleDistrictChange}
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
            </CRow>

            {isLoadingEmployees ? (
              <div className="text-center">
                <CSpinner color="primary" />
                <p>Loading {designation} data...</p>
              </div>
            ) : (
              <CSmartTable
                columns={columns}
                items={employeeData}
                itemsPerPage={10}
                pagination
                tableProps={{
                  responsive: true,
                  striped: true,
                  hover: true,
                }}
                tableBodyProps={{
                  className: 'align-middle',
                }}
                loading={isLoadingEmployees}
                noItemsLabel={
                  formData.state
                    ? `No ${designation} found for selected filters`
                    : `Please select a state to view ${designation} data`
                }
              />
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AllSrmList
