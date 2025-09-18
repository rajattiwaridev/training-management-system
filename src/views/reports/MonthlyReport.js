import React, { useEffect, useState, useMemo } from 'react'
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
import CIcon from '@coreui/icons-react'
import { cilSync } from '@coreui/icons'
// import './monthlyReport.css'

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
  const [departments, setDepartments] = useState([])
  const [srmReport, setSRMReport] = useState([])

  // Get current year and month
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

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

  // Separate lighthouse and non-lighthouse districts
  const { lighthouseDistricts, nonLighthouseDistricts } = useMemo(() => {
    const lighthouse = districts
      .filter((district) => district.isLightHouse === true)
      .sort((a, b) => a.districtNameEng.localeCompare(b.districtNameEng))

    const nonLighthouse = districts
      .filter((district) => district.isLightHouse === false)
      .sort((a, b) => a.districtNameEng.localeCompare(b.districtNameEng))

    return { lighthouseDistricts: lighthouse, nonLighthouseDistricts: nonLighthouse }
  }, [districts])

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
        // Format as dd-mm-yyyy
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

  const getReportData = async () => {
    if (!validateForm()) {
      SweetAlert.fire('Error', 'Please fill all required fields', 'error')
      return
    }
    try {
      setLoadingReport(true)
      const responseData = await axios.get(
        `${endpoint}/monthly2?stateId=${selectedState}&year=${selectedYear}&month=${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setDepartments(responseData.data.departments)
      setReportData(responseData.data.report)
      setSRMReport(responseData.data.reportSRM)

      SweetAlert.fire('Success', 'Report generated successfully!', 'success')
    } catch (error) {
      SweetAlert.fire('Error', `Failed to generate report:${error.message}`, 'error')
    } finally {
      setLoadingReport(false)
    }
  }

  // Calculate grand totals for the footer
  const calculateGrandTotals = () => {
    const totals = {
      state: 0,
      lighthouse: Array(lighthouseDistricts.length).fill(0),
      nonLighthouse: Array(nonLighthouseDistricts.length).fill(0),
      subTotal: 0,
      total: 0,
      count: 0,
      trainingCount: 0,
    }

    if (!reportData || !srmReport) return totals

    datesInMonth.forEach((date) => {
      departments.forEach((dept) => {
        // State level data
        const stateData = srmReport[date]?.[dept.departmentName] || {}
        totals.state += stateData.attendanceCount || 0

        // Lighthouse districts
        lighthouseDistricts.forEach((district, idx) => {
          const districtData =
            reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
          totals.lighthouse[idx] += districtData.attendanceCount || 0
        })

        // Non-lighthouse districts
        nonLighthouseDistricts.forEach((district, idx) => {
          const districtData =
            reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
          totals.nonLighthouse[idx] += districtData.attendanceCount || 0
        })

        // Calculate department subtotal for this date
        const deptSubtotal =
          (stateData.attendanceCount || 0) +
          lighthouseDistricts.reduce((sum, district) => {
            const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
            return sum + (data.attendanceCount || 0)
          }, 0) +
          nonLighthouseDistricts.reduce((sum, district) => {
            const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
            return sum + (data.attendanceCount || 0)
          }, 0)

        totals.subTotal += deptSubtotal

        // Training counts
        totals.count += stateData.trainingCount || 0
        lighthouseDistricts.forEach((district) => {
          const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
          totals.count += data.trainingCount || 0
        })
        nonLighthouseDistricts.forEach((district) => {
          const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
          totals.count += data.trainingCount || 0
        })
      })
    })

    totals.total = totals.subTotal
    totals.trainingCount = totals.count

    return totals
  }

  const exportToExcel = () => {
    // Create a flattened data structure for export
    const dataForExport = []

    // Add headers
    const headers = [
      'Date',
      'Department',
      'State Level Training',
      ...lighthouseDistricts.map((d) => d.districtNameEng),
      ...nonLighthouseDistricts.map((d) => d.districtNameEng),
      'Sub Total',
      'Total',
      'Count',
      'Count of Trainings',
    ]
    dataForExport.push(headers)

    // Add data rows
    datesInMonth.forEach((date) => {
      departments.forEach((dept, deptIndex) => {
        const row = []

        // Date (only show on first department row for this date)
        row.push(deptIndex === 0 ? date : '')

        // Department
        row.push(dept.departmentName)

        // State Level Training
        const stateData = srmReport[date]?.[dept.departmentName] || {}
        row.push(stateData.attendanceCount || 0)

        // Lighthouse districts
        lighthouseDistricts.forEach((district) => {
          const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
          row.push(data.attendanceCount || 0)
        })

        // Non-lighthouse districts
        nonLighthouseDistricts.forEach((district) => {
          const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
          row.push(data.attendanceCount || 0)
        })

        // Sub Total
        const subtotal =
          (stateData.attendanceCount || 0) +
          lighthouseDistricts.reduce((sum, district) => {
            const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
            return sum + (data.attendanceCount || 0)
          }, 0) +
          nonLighthouseDistricts.reduce((sum, district) => {
            const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
            return sum + (data.attendanceCount || 0)
          }, 0)
        row.push(subtotal)

        // Total (only show on first department row for this date)
        if (deptIndex === 0) {
          const dateTotal = departments.reduce((sum, dept) => {
            const stateData = srmReport[date]?.[dept.departmentName] || {}
            const districtTotal =
              lighthouseDistricts.reduce((s, district) => {
                const data =
                  reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
                return s + (data.attendanceCount || 0)
              }, 0) +
              nonLighthouseDistricts.reduce((s, district) => {
                const data =
                  reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
                return s + (data.attendanceCount || 0)
              }, 0)
            return sum + (stateData.attendanceCount || 0) + districtTotal
          }, 0)
          row.push(dateTotal)
        } else {
          row.push('')
        }

        // Count
        const trainingCount =
          (stateData.trainingCount || 0) +
          lighthouseDistricts.reduce((sum, district) => {
            const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
            return sum + (data.trainingCount || 0)
          }, 0) +
          nonLighthouseDistricts.reduce((sum, district) => {
            const data = reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
            return sum + (data.trainingCount || 0)
          }, 0)
        row.push(trainingCount)

        // Count of Trainings (only show on first department row for this date)
        if (deptIndex === 0) {
          const dateTrainingCount = departments.reduce((sum, dept) => {
            const stateData = srmReport[date]?.[dept.departmentName] || {}
            const districtTrainingCount =
              lighthouseDistricts.reduce((s, district) => {
                const data =
                  reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
                return s + (data.trainingCount || 0)
              }, 0) +
              nonLighthouseDistricts.reduce((s, district) => {
                const data =
                  reportData[district.districtNameEng]?.[date]?.[dept.departmentName] || {}
                return s + (data.trainingCount || 0)
              }, 0)
            return sum + (stateData.trainingCount || 0) + districtTrainingCount
          }, 0)
          row.push(dateTrainingCount)
        } else {
          row.push('')
        }

        dataForExport.push(row)
      })
    })

    // Add grand totals row
    const grandTotals = calculateGrandTotals()
    const totalsRow = [
      'Grand Total',
      '',
      grandTotals.state,
      ...grandTotals.lighthouse,
      ...grandTotals.nonLighthouse,
      grandTotals.subTotal,
      grandTotals.total,
      grandTotals.count,
      grandTotals.trainingCount,
    ]
    dataForExport.push(totalsRow)

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(dataForExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report')

    // Generate Excel file and save
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(data, `Monthly_Report_${selectedState}_${selectedYear}_${selectedMonth}.xlsx`)
  }

  // Get the selected state name
  const selectedStateName = states.find((state) => state._id === selectedState)?.stateName || ''
  const grandTotals = calculateGrandTotals()
  const handleSyncData = async () => {
    try {
      setLoadingReport(true)
      const response = await axios.get(`${endpoint}/sync-details`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      SweetAlert.fire(
        'Success',
        response.data.message || 'Data synchronized successfully!',
        'success',
      )
    } catch (error) {
      SweetAlert.fire('Error', `Failed to synchronize data: ${error.message}`, 'error')
    } finally {
      setLoadingReport(false)
    }
  }
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Monthly Report</strong>
            <br/>
            Before Generating report please click on Sync Data to get latest data.
            <CButton

              color="info"
              style={{ color: 'white' }}
              className="ms-3"
              size='sm'
              onClick={handleSyncData}
            >
              Sync Data
              <CIcon icon={cilSync} className="ms-2" />
            </CButton>
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
                <div style={{ overflowX: 'auto' }} className='table-container'>
                  <CTable id="reportTable" striped responsive>
                    <CTableHead className="sticky-top">
                      <CTableRow>
                        <CTableHeaderCell rowSpan="2" style={{ minWidth: '100px' }}>
                          Date
                        </CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2" style={{ minWidth: '150px' }}>
                          Departments
                        </CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2" style={{ minWidth: '120px' }}>
                          State Level Training
                        </CTableHeaderCell>
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
                        <CTableHeaderCell rowSpan="2" style={{ minWidth: '100px' }}>
                          Sub Total
                        </CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2" style={{ minWidth: '100px' }}>
                          Total
                        </CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2" style={{ minWidth: '80px' }}>
                          Count
                        </CTableHeaderCell>
                        <CTableHeaderCell rowSpan="2" style={{ minWidth: '120px' }}>
                          Count of Trainings
                        </CTableHeaderCell>
                      </CTableRow>
                      <CTableRow>
                        {/* Lighthouse district headers */}
                        {lighthouseDistricts.map((district) => (
                          <CTableHeaderCell key={district._id} style={{ minWidth: '120px' }}>
                            {district.districtNameEng}
                          </CTableHeaderCell>
                        ))}

                        {/* Non-Lighthouse district headers */}
                        {nonLighthouseDistricts.map((district) => (
                          <CTableHeaderCell key={district._id} style={{ minWidth: '120px' }}>
                            {district.districtNameEng}
                          </CTableHeaderCell>
                        ))}
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {datesInMonth.map((date) => {
                        if (departments.length === 0) {
                          return (
                            <CTableRow key={`${date}-no-dept`}>
                              <CTableDataCell>{date}</CTableDataCell>
                              <CTableDataCell
                                colSpan={
                                  3 + lighthouseDistricts.length + nonLighthouseDistricts.length + 4
                                }
                              >
                                <CBadge color="secondary">No Departments</CBadge>
                              </CTableDataCell>
                            </CTableRow>
                          )
                        }

                        // Calculate date totals
                        let dateTotal = 0
                        let dateTrainingCountTotal = 0

                        const departmentRows = departments.map((dept, deptIndex) => {
                          // State level data
                          const stateData = srmReport[date]?.[dept.departmentName] || {}
                          const stateAttendance = stateData.attendanceCount || 0
                          const stateTrainingCount = stateData.trainingCount || 0

                          // Initialize department totals
                          let deptSubtotal = stateAttendance
                          let deptTrainingCount = stateTrainingCount

                          return (
                            <CTableRow key={`${date}-${dept.departmentName}`}>
                              {deptIndex === 0 && (
                                <CTableDataCell
                                  rowSpan={departments.length}
                                  className="text-center align-middle fw-bold"
                                >
                                  {date}
                                </CTableDataCell>
                              )}
                              <CTableDataCell>{dept.departmentName}</CTableDataCell>
                              <CTableDataCell className="text-center">
                                {stateAttendance > 0 ? (
                                  <CBadge color="success">{stateAttendance}</CBadge>
                                ) : (
                                  0
                                )}
                              </CTableDataCell>

                              {/* Lighthouse districts */}
                              {lighthouseDistricts.map((district) => {
                                const data =
                                  reportData[district.districtNameEng]?.[date]?.[
                                    dept.departmentName
                                  ] || {}
                                const attendance = data.attendanceCount || 0
                                const trainingCount = data.trainingCount || 0

                                deptSubtotal += attendance
                                deptTrainingCount += trainingCount

                                return (
                                  <CTableDataCell
                                    key={`LH-${district._id}-${date}-${dept.departmentName}`}
                                    className="text-center"
                                  >
                                    {attendance > 0 ? (
                                      <CBadge color="success">{attendance}</CBadge>
                                    ) : (
                                      0
                                    )}
                                  </CTableDataCell>
                                )
                              })}

                              {/* Non-Lighthouse districts */}
                              {nonLighthouseDistricts.map((district) => {
                                const data =
                                  reportData[district.districtNameEng]?.[date]?.[
                                    dept.departmentName
                                  ] || {}
                                const attendance = data.attendanceCount || 0
                                const trainingCount = data.trainingCount || 0

                                deptSubtotal += attendance
                                deptTrainingCount += trainingCount

                                return (
                                  <CTableDataCell
                                    key={`NON-LH-${district._id}-${date}-${dept.departmentName}`}
                                    className="text-center"
                                  >
                                    {attendance > 0 ? (
                                      <CBadge color="success">{attendance}</CBadge>
                                    ) : (
                                      0
                                    )}
                                  </CTableDataCell>
                                )
                              })}

                              <CTableDataCell className="text-center fw-bold">
                                {deptSubtotal > 0 ? (
                                  <CBadge color="primary">{deptSubtotal}</CBadge>
                                ) : (
                                  0
                                )}
                              </CTableDataCell>

                              {deptIndex === 0 && (
                                <CTableDataCell
                                  rowSpan={departments.length}
                                  className="text-center align-middle fw-bold"
                                >
                                  {/* This will be calculated after processing all departments */}
                                  <span className="date-total-placeholder" data-date={date}></span>
                                </CTableDataCell>
                              )}

                              <CTableDataCell className="text-center fw-bold">
                                {deptTrainingCount > 0 ? deptTrainingCount : 0}
                              </CTableDataCell>

                              {deptIndex === 0 && (
                                <CTableDataCell
                                  rowSpan={departments.length}
                                  className="text-center align-middle fw-bold"
                                >
                                  {/* This will be calculated after processing all departments */}
                                  <span
                                    className="date-training-total-placeholder"
                                    data-date={date}
                                  ></span>
                                </CTableDataCell>
                              )}
                            </CTableRow>
                          )
                        })

                        // Calculate date totals after processing all departments
                        dateTotal = departments.reduce((total, dept) => {
                          const stateData = srmReport[date]?.[dept.departmentName] || {}
                          const stateAttendance = stateData.attendanceCount || 0

                          const districtTotal =
                            lighthouseDistricts.reduce((sum, district) => {
                              const data =
                                reportData[district.districtNameEng]?.[date]?.[
                                  dept.departmentName
                                ] || {}
                              return sum + (data.attendanceCount || 0)
                            }, 0) +
                            nonLighthouseDistricts.reduce((sum, district) => {
                              const data =
                                reportData[district.districtNameEng]?.[date]?.[
                                  dept.departmentName
                                ] || {}
                              return sum + (data.attendanceCount || 0)
                            }, 0)

                          return total + stateAttendance + districtTotal
                        }, 0)

                        dateTrainingCountTotal = departments.reduce((total, dept) => {
                          const stateData = srmReport[date]?.[dept.departmentName] || {}
                          const stateTrainingCount = stateData.trainingCount || 0

                          const districtTrainingCount =
                            lighthouseDistricts.reduce((sum, district) => {
                              const data =
                                reportData[district.districtNameEng]?.[date]?.[
                                  dept.departmentName
                                ] || {}
                              return sum + (data.trainingCount || 0)
                            }, 0) +
                            nonLighthouseDistricts.reduce((sum, district) => {
                              const data =
                                reportData[district.districtNameEng]?.[date]?.[
                                  dept.departmentName
                                ] || {}
                              return sum + (data.trainingCount || 0)
                            }, 0)

                          return total + stateTrainingCount + districtTrainingCount
                        }, 0)

                        // Update the placeholders with calculated values
                        setTimeout(() => {
                          const dateTotalEls = document.querySelectorAll(
                            `.date-total-placeholder[data-date="${date}"]`,
                          )
                          const dateTrainingTotalEls = document.querySelectorAll(
                            `.date-training-total-placeholder[data-date="${date}"]`,
                          )

                          dateTotalEls.forEach((el) => {
                            el.textContent = dateTotal > 0 ? dateTotal : 0
                            el.classList.remove('date-total-placeholder')
                          })

                          dateTrainingTotalEls.forEach((el) => {
                            el.textContent = dateTrainingCountTotal > 0 ? dateTrainingCountTotal : 0
                            el.classList.remove('date-training-total-placeholder')
                          })
                        }, 0)

                        return departmentRows
                      })}
                    </CTableBody>

                    <CTableFoot>
                      <CTableRow>
                        <CTableHeaderCell colSpan={2}>Grand Total</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          {grandTotals.state > 0 ? (
                            <CBadge color="success">{grandTotals.state}</CBadge>
                          ) : (
                            0
                          )}
                        </CTableHeaderCell>

                        {/* Lighthouse district totals */}
                        {grandTotals.lighthouse.map((total, index) => (
                          <CTableHeaderCell key={`lh-total-${index}`} className="text-center">
                            {total > 0 ? <CBadge color="success">{total}</CBadge> : 0}
                          </CTableHeaderCell>
                        ))}

                        {/* Non-Lighthouse district totals */}
                        {grandTotals.nonLighthouse.map((total, index) => (
                          <CTableHeaderCell key={`non-lh-total-${index}`} className="text-center">
                            {total > 0 ? <CBadge color="success">{total}</CBadge> : 0}
                          </CTableHeaderCell>
                        ))}

                        <CTableHeaderCell className="text-center">
                          {grandTotals.subTotal > 0 ? (
                            <CBadge color="primary">{grandTotals.subTotal}</CBadge>
                          ) : (
                            0
                          )}
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          {grandTotals.total > 0 ? (
                            <CBadge color="primary">{grandTotals.total}</CBadge>
                          ) : (
                            0
                          )}
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          {grandTotals.count > 0 ? grandTotals.count : 0}
                        </CTableHeaderCell>
                        <CTableHeaderCell className="text-center">
                          {grandTotals.trainingCount > 0 ? grandTotals.trainingCount : 0}
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableFoot>
                  </CTable>
                </div>
              </div>
            )}
          </CCardBody>
          <CCardFooter>
            <small className="text-medium-emphasis">
              Report generated for {selectedStateName} - {monthNames[selectedMonth - 1]}{' '}
              {selectedYear}
            </small>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MonthlyReport
