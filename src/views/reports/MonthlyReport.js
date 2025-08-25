import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormFeedback,
  CFormLabel,
  CFormSelect,
  CRow,
  CSpinner,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from '@coreui/react'
import axios from 'axios'
import SweetAlert from 'sweetalert2'

const MonthlyReport = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')

  // State management
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [selectedState, setSelectedState] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [stateValid, setStateValid] = useState(true)
  const [yearValid, setYearValid] = useState(true)
  const [monthValid, setMonthValid] = useState(true)
  const [loadingStates, setLoadingStates] = useState(true)
  const [formValid, setFormValid] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [datesInMonth, setDatesInMonth] = useState([])

  // Get current year and month
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed

  // Generate year options (current year and previous 2 years)
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear]

  // Generate month options with names
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Check if form is valid whenever selections change
  useEffect(() => {
    const isValid = selectedState && selectedYear && selectedMonth
    setFormValid(isValid)
    
    // Generate dates when month and year are selected
    if (selectedYear && selectedMonth) {
      generateDatesInMonth()
    }
  }, [selectedState, selectedYear, selectedMonth])

  // Load states on component mount
  useEffect(() => {
    loadLocationData()
  }, [])

  // Generate all dates in the selected month
  const generateDatesInMonth = () => {
    const year = parseInt(selectedYear)
    const month = parseInt(selectedMonth)
    
    // Get number of days in the month
    const daysInMonth = new Date(year, month, 0).getDate()
    
    // Generate array of dates
    const dates = []
    for (let day = 1; day <= daysInMonth; day++) {
      // Don't include future dates if it's the current month and year
      if (!(year === currentYear && month === currentMonth && day > currentDate.getDate())) {
        dates.push(day)
      }
    }
    
    setDatesInMonth(dates)
  }

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

  const fetchDistricts = async (stateId) => {
    try {
      setLoadingDistricts(true)
      const response = await axios.get(`${endpoint}/state/${stateId}/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.length === 0) {
        SweetAlert.fire('Info', 'No districts found for the selected state', 'info')
        setDistricts([])
      } else {
        setDistricts(response.data)
      }
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load districts', 'error')
      setDistricts([])
    } finally {
      setLoadingDistricts(false)
    }
  }

  const handleStateChange = async (e) => {
    const stateId = e.target.value
    setSelectedState(stateId)
    setStateValid(!!stateId)
    setReportData(null) // Clear previous report data
    if (stateId) {
      await fetchDistricts(stateId)
    } else {
      setDistricts([])
    }
  }

  const handleYearChange = (e) => {
    const year = e.target.value
    setSelectedYear(year)
    setYearValid(!!year)
    // Reset month when year changes
    setSelectedMonth('')
    setReportData(null) // Clear previous report data
    setDatesInMonth([])
  }

  const handleMonthChange = (e) => {
    const month = e.target.value
    setSelectedMonth(month)
    setMonthValid(!!month)
    setReportData(null) // Clear previous report data
  }

  const validateForm = () => {
    const isStateValid = !!selectedState
    const isYearValid = !!selectedYear
    const isMonthValid = !!selectedMonth

    setStateValid(isStateValid)
    setYearValid(isYearValid)
    setMonthValid(isMonthValid)

    return isStateValid && isYearValid && isMonthValid
  }

  const getReportData = async () => {
    if (!validateForm()) {
      SweetAlert.fire('Error', 'Please fill all required fields', 'error')
      return
    }
    console.log(selectedState,selectedYear,selectedMonth)
    try {
      setLoadingReport(true)
      // For demonstration, we'll create mock data
      // In a real application, you would fetch this from your API
      const mockData = {}
      
      districts.forEach(district => {
        mockData[district._id] = {}
        datesInMonth.forEach(date => {
          // Generate some random metrics for demonstration
          mockData[district._id][date] = {
            value: Math.floor(Math.random() * 100),
            status: Math.random() > 0.2 ? 'Completed' : 'Pending'
          }
        })
      })
      
      setReportData(mockData)
      
      SweetAlert.fire('Success', 'Report generated successfully!', 'success')
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to generate report', 'error')
    } finally {
      setLoadingReport(false)
    }
  }

  // Get the selected state name
  const selectedStateName = states.find(state => state._id === selectedState)?.stateName || '';

  // Separate lighthouse and non-lighthouse districts
  const lighthouseDistricts = districts.filter(district => district.isLightHouse === true)
    .sort((a, b) => a.districtNameEng.localeCompare(b.districtNameEng));
  
  const nonLighthouseDistricts = districts.filter(district => district.isLightHouse === false)
    .sort((a, b) => a.districtNameEng.localeCompare(b.districtNameEng));

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Monthly Report</strong>
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
                  Year <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="year"
                  value={selectedYear}
                  onChange={handleYearChange}
                  required
                  invalid={!yearValid}
                >
                  <option value="">Select Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </CFormSelect>
                <CFormFeedback invalid>Please select year</CFormFeedback>
              </CCol>

              <CCol md={4}>
                <CFormLabel>
                  Month <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  required
                  invalid={!monthValid}
                  disabled={!selectedYear}
                >
                  <option value="">Select Month</option>
                  {monthNames.map((month, index) => {
                    const monthNumber = index + 1
                    const isFutureMonth = selectedYear == currentYear && monthNumber > currentMonth
                    return (
                      <option key={monthNumber} value={monthNumber} disabled={isFutureMonth}>
                        {month}
                      </option>
                    )
                  })}
                </CFormSelect>
                <CFormFeedback invalid>Please select month</CFormFeedback>
              </CCol>

              <CCol xs={12} className="text-center mt-3">
                <CButton 
                  color="primary" 
                  onClick={getReportData} 
                  disabled={loadingReport || !formValid}
                >
                  {loadingReport ? <CSpinner size="sm" /> : 'Generate Report'}
                </CButton>
              </CCol>
            </CRow>

            {/* Report Table */}
            {districts.length > 0 && selectedMonth && (
              <div className="mt-4">
                <h5>
                  Report of {selectedStateName} for {monthNames[selectedMonth - 1]} {selectedYear}
                  {loadingDistricts && <CSpinner size="sm" className="ms-2" />}
                </h5>
                
                <div className="table-responsive">
                  <CTable striped responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell rowSpan="2">Date</CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2">Departments</CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2">State Level Training</CTableHeaderCell>
                        <CTableHeaderCell colSpan={lighthouseDistricts.length} className="text-center">
                          Lighthouse Districts
                        </CTableHeaderCell>
                        <CTableHeaderCell colSpan={nonLighthouseDistricts.length} className="text-center">
                          Non-Lighthouse Districts
                        </CTableHeaderCell>
                      </CTableRow>
                      <CTableRow>
                        {/* Lighthouse district headers */}
                        {lighthouseDistricts.map((district) => (
                          <CTableHeaderCell key={district._id}>
                            {district.districtNameEng}
                          </CTableHeaderCell>
                        ))}
                        
                        {/* Non-Lighthouse district headers */}
                        {nonLighthouseDistricts.map((district) => (
                          <CTableHeaderCell key={district._id}>
                            {district.districtNameEng}
                          </CTableHeaderCell>
                        ))}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {datesInMonth.map((date) => (
                        <CTableRow key={date}>
                          <CTableDataCell>{date}</CTableDataCell>
                          <CTableDataCell>
                            {/* Department data would go here */}
                            <CBadge color="info">N/A</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {/* State Level Training data would go here */}
                            <CBadge color="info">N/A</CBadge>
                          </CTableDataCell>
                          
                          {/* Lighthouse districts data */}
                          {lighthouseDistricts.map((district) => (
                            <CTableDataCell key={district._id}>
                              {reportData && reportData[district._id] && reportData[district._id][date] ? (
                                <CBadge color={reportData[district._id][date].status === 'Completed' ? 'success' : 'warning'}>
                                  {reportData[district._id][date].value}
                                </CBadge>
                              ) : (
                                <CBadge color="secondary">-</CBadge>
                              )}
                            </CTableDataCell>
                          ))}
                          
                          {/* Non-Lighthouse districts data */}
                          {nonLighthouseDistricts.map((district) => (
                            <CTableDataCell key={district._id}>
                              {reportData && reportData[district._id] && reportData[district._id][date] ? (
                                <CBadge color={reportData[district._id][date].status === 'Completed' ? 'success' : 'warning'}>
                                  {reportData[district._id][date].value}
                                </CBadge>
                              ) : (
                                <CBadge color="secondary">-</CBadge>
                              )}
                            </CTableDataCell>
                          ))}
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MonthlyReport