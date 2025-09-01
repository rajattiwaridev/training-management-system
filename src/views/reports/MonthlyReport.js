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
  CCardFooter,
  CTableFoot,
} from '@coreui/react'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

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

    const dates = []
    for (let day = 1; day <= daysInMonth; day++) {
      // Don't include future dates if it's the current month and year
      if (!(year === currentYear && month === currentMonth && day > currentDate.getDate())) {
        // Format as dd/mm/yyyy
        const formatted =
          String(day).padStart(2, '0') + '-' + String(month).padStart(2, '0') + '-' + year
        dates.push(formatted)
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
  const [departments, setDepartments] = useState([])
  const [srmReport, setSRMReport] = useState([])
  // Separate lighthouse and non-lighthouse districts
  const lighthouseDistricts = districts
    .filter((district) => district.isLightHouse === true)
    .sort((a, b) => a.districtNameEng.localeCompare(b.districtNameEng))

  const nonLighthouseDistricts = districts
    .filter((district) => district.isLightHouse === false)
    .sort((a, b) => a.districtNameEng.localeCompare(b.districtNameEng))
  const getReportData = async () => {
    if (!validateForm()) {
      SweetAlert.fire('Error', 'Please fill all required fields', 'error')
      return
    }
    try {
      setLoadingReport(true)
      // For demonstration, we'll create mock data
      // In a real application, you would fetch this from your API
      const mockData = {}
      const responseData = await axios.get(
        `${endpoint}/monthly-report?stateId=${selectedState}&year=${selectedYear}&month=${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      districts.forEach((district) => {
        mockData[district._id] = {}
        datesInMonth.forEach((date) => {
          // Generate some random metrics for demonstration
          mockData[district._id][date] = {
            value: Math.floor(Math.random() * 100),
            status: Math.random() > 0.2 ? 'Completed' : 'Pending',
          }
        })
      })
      setDepartments(responseData.data.departmentss)
      setReportData(transformReportData(responseData.data.report))
      setSRMReport(transformReportData(responseData.data.SRMReport))

      SweetAlert.fire('Success', 'Report generated successfully!', 'success')
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to generate report', 'error')
    } finally {
      setLoadingReport(false)
    }
  }

  // Get the selected state name
  const selectedStateName = states.find((state) => state._id === selectedState)?.stateName || ''
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}` // "01-08-2025"
  }

  const transformReportData = (rawData) => {
    const formatted = {}

    rawData.forEach((item) => {
      const { Date: rawDate, Department: dept, ...districts } = item
      const date = formatDate(rawDate) // 🔥 normalize here

      Object.keys(districts).forEach((districtName) => {
        if (!formatted[districtName]) formatted[districtName] = {}
        if (!formatted[districtName][date]) formatted[districtName][date] = {}

        formatted[districtName][date][dept] = {
          value: districts[districtName],
          status: districts[districtName] > 0 ? 'Completed' : 'Pending',
        }
      })
    })

    return formatted
  }
  const exportToExcel = () => {
    const table = document.getElementById('reportTable') // table ka id
    const workbook = XLSX.utils.table_to_book(table, { sheet: 'Report' })
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'report.xlsx')
  }
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
                <CButton color="primary" onClick={exportToExcel} className="mb-3">
                  Export to Excel
                </CButton>
                <div style={{ overflowY: 'auto', lineHeight: '10px', whiteSpace: 'nowrap' }}>
                  <CTable id="reportTable">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell rowSpan="2" style={{ width: '200px' }}>
                          Date
                        </CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2">Departments</CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2">State Level Training</CTableHeaderCell>
                        <CTableHeaderCell
                          colSpan={lighthouseDistricts.length}
                          className="text-center"
                        >
                          Lighthouse Districts
                        </CTableHeaderCell>
                        <CTableHeaderCell
                          colSpan={nonLighthouseDistricts.length}
                          className="text-center"
                        >
                          Non-Lighthouse Districts
                        </CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2">Sub Total</CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2">Total</CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2">Count</CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2">Count of Trainings</CTableHeaderCell>
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

                    {(() => {
                      // 🔹 Grand Totals container (moved here at the top level of the IIFE)
                      const grandTotals = {
                        state: 0,
                        lighthouse: lighthouseDistricts.map(() => 0),
                        nonLighthouse: nonLighthouseDistricts.map(() => 0),
                        subTotal: 0,
                        dateTotal: 0,
                        count: 0,
                        countTotal: 0,
                      }

                      return (
                        <>
                          <CTableBody>
                            {datesInMonth.map((date) => {
                              if (departments.length === 0) {
                                return (
                                  <CTableRow key={`${date}-no-dept`}>
                                    <CTableDataCell>{date}</CTableDataCell>
                                    <CTableDataCell
                                      colSpan={
                                        3 +
                                        lighthouseDistricts.length +
                                        nonLighthouseDistricts.length +
                                        4
                                      }
                                    >
                                      <CBadge color="secondary">No Departments</CBadge>
                                    </CTableDataCell>
                                  </CTableRow>
                                )
                              }

                              const statsByDept = {}
                              let dateTotal = 0
                              let dateTrainingCountTotal = 0

                              departments.forEach((dept) => {
                                let subtotal = 0
                                let trainingCount = 0

                                const st = srmReport?.total?.[date]?.[dept]
                                if (st?.value) {
                                  subtotal += st.value
                                  trainingCount++
                                  grandTotals.state += st.value
                                }

                                lighthouseDistricts.forEach((d, idx) => {
                                  const cell = reportData?.[d.districtNameEng]?.[date]?.[dept]
                                  if (cell?.value) {
                                    subtotal += cell.value
                                    trainingCount++
                                    grandTotals.lighthouse[idx] += cell.value
                                  }
                                })

                                nonLighthouseDistricts.forEach((d, idx) => {
                                  const cell = reportData?.[d.districtNameEng]?.[date]?.[dept]
                                  if (cell?.value) {
                                    subtotal += cell.value
                                    trainingCount++
                                    grandTotals.nonLighthouse[idx] += cell.value
                                  }
                                })

                                statsByDept[dept] = { subtotal, trainingCount }
                                dateTotal += subtotal
                                dateTrainingCountTotal += trainingCount
                              })

                              grandTotals.subTotal += dateTotal
                              grandTotals.dateTotal += dateTotal
                              grandTotals.count += dateTrainingCountTotal
                              grandTotals.countTotal += dateTrainingCountTotal

                              return departments.map((dept, deptIndex) => {
                                const { subtotal, trainingCount } = statsByDept[dept]
                                const stateCell = srmReport?.total?.[date]?.[dept]

                                return (
                                  <CTableRow key={`${date}-${dept}`}>
                                    {deptIndex === 0 && (
                                      <CTableDataCell
                                        rowSpan={departments.length}
                                        className="text-center align-middle fw-bold"
                                      >
                                        {date}
                                      </CTableDataCell>
                                    )}
                                    <CTableDataCell>{dept}</CTableDataCell>
                                    <CTableDataCell className="text-center">
                                      {stateCell?.value > 0 ? (
                                        <CBadge color="success">{stateCell.value}</CBadge>
                                      ) : (
                                        0
                                      )}
                                    </CTableDataCell>

                                    {lighthouseDistricts.map((district) => {
                                      const cell =
                                        reportData?.[district.districtNameEng]?.[date]?.[dept]
                                      return (
                                        <CTableDataCell
                                          key={`LH-${district._id}-${date}-${dept}`}
                                          className="text-center"
                                        >
                                          {cell?.value > 0 ? (
                                            <CBadge color="success">{cell.value}</CBadge>
                                          ) : (
                                            0
                                          )}
                                        </CTableDataCell>
                                      )
                                    })}

                                    {nonLighthouseDistricts.map((district) => {
                                      const cell =
                                        reportData?.[district.districtNameEng]?.[date]?.[dept]
                                      return (
                                        <CTableDataCell
                                          key={`NLH-${district._id}-${date}-${dept}`}
                                          className="text-center"
                                        >
                                          {cell?.value > 0 ? (
                                            <CBadge color="success">{cell.value}</CBadge>
                                          ) : (
                                            0
                                          )}
                                        </CTableDataCell>
                                      )
                                    })}

                                    <CTableDataCell className="text-center fw-bold">
                                      {subtotal > 0 ? (
                                        <CBadge color="primary">{subtotal}</CBadge>
                                      ) : (
                                        0
                                      )}
                                    </CTableDataCell>

                                    {deptIndex === 0 && (
                                      <CTableDataCell
                                        rowSpan={departments.length}
                                        className="text-center align-middle fw-bold"
                                      >
                                        {dateTotal > 0 ? dateTotal : 0}
                                      </CTableDataCell>
                                    )}

                                    <CTableDataCell className="text-center fw-bold">
                                      {trainingCount > 0 ? trainingCount : 0}
                                    </CTableDataCell>

                                    {deptIndex === 0 && (
                                      <CTableDataCell
                                        rowSpan={departments.length}
                                        className="text-center align-middle fw-bold"
                                      >
                                        {dateTrainingCountTotal > 0 ? dateTrainingCountTotal : 0}
                                      </CTableDataCell>
                                    )}
                                  </CTableRow>
                                )
                              })
                            })}
                          </CTableBody>

                          {/* 🔹 FOOTER with Grand Totals */}
                          <CTableFoot>
                            <CTableRow className="fw-bold">
                              <CTableDataCell colSpan={2} className="text-center align-middle">
                                Grand Total
                              </CTableDataCell>
                              <CTableDataCell className="text-center align-middle">
                                {grandTotals.state}
                              </CTableDataCell>

                              {grandTotals.lighthouse.map((val, idx) => (
                                <CTableDataCell
                                  key={`LH-total-${idx}`}
                                  className="text-center align-middle"
                                >
                                  {val}
                                </CTableDataCell>
                              ))}

                              {grandTotals.nonLighthouse.map((val, idx) => (
                                <CTableDataCell
                                  key={`NLH-total-${idx}`}
                                  className="text-center align-middle"
                                >
                                  {val}
                                </CTableDataCell>
                              ))}

                              <CTableDataCell className="text-center align-middle">
                                {grandTotals.subTotal}
                              </CTableDataCell>
                              <CTableDataCell className="text-center align-middle">
                                {grandTotals.dateTotal}
                              </CTableDataCell>
                              <CTableDataCell className="text-center align-middle">
                                {grandTotals.count}
                              </CTableDataCell>
                              <CTableDataCell className="text-center align-middle">
                                {grandTotals.countTotal}
                              </CTableDataCell>
                            </CTableRow>
                          </CTableFoot>
                        </>
                      )
                    })()}
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
