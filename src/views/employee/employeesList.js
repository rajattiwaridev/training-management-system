import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormInput,
  CBadge,
  CPagination,
  CPaginationItem,
  CFormSelect,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert,
  CForm,
  CFormLabel,
  CFormFeedback,
} from '@coreui/react'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
import { format } from 'date-fns'
import {
  cilPencil,
  cilTrash,
  cilFilter,
  cilSearch,
  cilUser,
  cilSave,
  cilX,
  cilLaptop,
  cilSync,
  cilLockLocked,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import AddEmployee from './addEmployee'
import dayjs from 'dayjs'

const EmployeeList = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const role = sessionStorage.getItem('role')

  // State variables
  const [employeeData, setEmployeeData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [states, setStates] = useState([])
  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [loadingDivisions, setLoadingDivisions] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [visible, setVisible] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState(null)

  const userId = sessionStorage.getItem('user')
  const [trainings, setTrainings] = useState([])
  const [filter, setFilter] = useState('all')
  const [refresh, setRefresh] = useState(false)
  const [titleFilter, setTitleFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showDRMMeetings, setShowDRMMeetings] = useState(false)
  const [isLoadingDRM, setIsLoadingDRM] = useState(false)

  // Fetch states on component mount
  useEffect(() => {
    fetchStates()
    fetchAllEmployees()
  }, [])

  // Fetch divisions when state changes
  useEffect(() => {
    if (formData.state) {
      setLoadingDivisions(true)
      fetchDivisions(formData.state)
      setFormData((prev) => ({ ...prev, division: '', district: '' }))
      setDistricts([])
    } else {
      setDivisions([])
      setDistricts([])
    }
  }, [formData.state])

  // Fetch districts when division changes
  useEffect(() => {
    if (formData.division) {
      setLoadingDistricts(true)
      fetchDistricts(formData.division)
      setFormData((prev) => ({ ...prev, district: '' }))
    } else {
      setDistricts([])
    }
  }, [formData.division])

  // Apply filters when dependencies change
  useEffect(() => {
    filterData()
  }, [employeeData, searchTerm, statusFilter, genderFilter, sortConfig])

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${endpoint}/states`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStates(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch states', 'error')
    }
  }

  const fetchDivisions = async (stateId) => {
    try {
      const response = await axios.get(`${endpoint}/state/${stateId}/divisions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDivisions(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load divisions', 'error')
    } finally {
      setLoadingDivisions(false)
    }
  }

  const fetchDistricts = async (divisionId) => {
    try {
      const response = await axios.get(`${endpoint}/division/${divisionId}/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDistricts(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load districts', 'error')
    } finally {
      setLoadingDistricts(false)
    }
  }

  const fetchAllEmployees = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${endpoint}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmployeeData(response.data)
    } catch (err) {
      setError('Failed to fetch employees')
      SweetAlert.fire('Error', 'Failed to fetch employees', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let result = [...employeeData]

    // Apply role-based filter
    if (role === 'SRM') {
      result = result.filter((emp) => emp.designation === 'DRM')
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          emp.mobile.includes(term) ||
          emp.officerEmail.toLowerCase().includes(term) ||
          (emp.district?.districtNameEng &&
            emp.district.districtNameEng.toLowerCase().includes(term)),
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((emp) => emp.status === (statusFilter === 'active'))
    }

    // Apply gender filter
    if (genderFilter !== 'all') {
      result = result.filter((emp) => emp.gender === genderFilter)
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle nested objects
        if (sortConfig.key === 'state') aValue = a.state?.stateName || ''
        if (sortConfig.key === 'district') aValue = a.district?.districtNameEng || ''
        if (sortConfig.key === 'state') bValue = b.state?.stateName || ''
        if (sortConfig.key === 'district') bValue = b.district?.districtNameEng || ''

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }

    setFilteredData(result)
    setCurrentPage(1)
  }

  const handleSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const requestSort = (key) => {
    handleSort(key)
  }

  const handleDeleteConfirmation = (employee) => {
    setSelectedEmployee(employee)
    setDeleteModalVisible(true)
  }

  const handleDeleteEmployee = async () => {
    try {
      await axios.get(`${endpoint}/employees/status/${selectedEmployee._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      SweetAlert.fire('Deleted!', 'Employee has been deleted.', 'success')
      fetchAllEmployees()
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to delete employee', 'error')
    } finally {
      setDeleteModalVisible(false)
      setSelectedEmployee(null)
    }
  }
  const [editModalEmployee, setEditModalEmployee] = useState(null)
  const handleEditClick = async (employee) => {
    setEditModalEmployee(employee)
    setEditModalVisible(true)
  }

  const handleEnableEdit = () => {
    setIsEditMode(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'dd MMM yyyy')
    } catch {
      return 'Invalid Date'
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <CAlert color="danger">
        {error}{' '}
        <CButton color="primary" size="sm" onClick={fetchAllEmployees}>
          Retry
        </CButton>
      </CAlert>
    )
  }

  const handleSaveSuccess = () => {
    // Refresh employee list or update state as needed
    fetchAllEmployees()
  }

  // Function to handle button click
  const handleViewTraining = (employee) => {
    setSelectedTraining(employee)
    setVisible(true)
  }

  const statusColors = {
    scheduled: 'info',
    completed: 'success',
    cancelled: 'danger',
  }

  const fetchDRMMeetings = async (id) => {
    try {
      setIsLoadingDRM(true)
      const response = await axios.get(`${endpoint}/drm-trainings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTrainings(response.data)
      setIsLoadingDRM(false)
      setVisible(true)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to load DRM meetings', 'error')
      setIsLoadingDRM(false)
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

  const handleResetPassword = async (employee) => {
    try {
      console.log('Resetting password for:', employee)
      const response = await axios.get(
        `${endpoint}/employees/reset-password/${employee._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (response.status !== 200) {
        throw new Error('Failed to reset password')
      }
      // Show success message
      SweetAlert.fire('Success', response.data.message, 'success')
    } catch (error) {
      SweetAlert.fire('Error', error.message, 'error')
    }
  }
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Employee List</strong>
              <CBadge color="info" className="ms-2">
                {filteredData.length} employees
              </CBadge>
            </div>
          </CCardHeader>

          <CCardBody>
            {/* Filters Section */}
            <div className="mb-4 p-3 bg-light rounded">
              <CRow>
                <CCol md={4}>
                  <div className="input-group">
                    <span className="input-group-text">
                      <CIcon icon={cilSearch} />
                    </span>
                    <CFormInput
                      placeholder="Search by name, mobile, email or district"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CCol>
                <CCol md={3}>
                  <CFormSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormSelect
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                  >
                    <option value="all">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CButton
                    color="secondary"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setGenderFilter('all')
                    }}
                  >
                    <CIcon icon={cilFilter} /> Reset
                  </CButton>
                </CCol>
              </CRow>
            </div>

            {/* Employee Table */}
            <CTable hover responsive striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell onClick={() => requestSort('name')}>
                    Name{' '}
                    {sortConfig.key === 'name' &&
                      (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => requestSort('mobile')}>
                    Mobile{' '}
                    {sortConfig.key === 'mobile' &&
                      (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => requestSort('dob')}>
                    DOB{' '}
                    {sortConfig.key === 'dob' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => requestSort('state')}>
                    State{' '}
                    {sortConfig.key === 'state' &&
                      (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => requestSort('district')}>
                    District{' '}
                    {sortConfig.key === 'district' &&
                      (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => requestSort('dateOfJoining')}>
                    DOJ{' '}
                    {sortConfig.key === 'dateOfJoining' &&
                      (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((employee) => (
                    <CTableRow key={employee._id}>
                      <CTableDataCell>
                        {employee.name}{' '}
                        <CBadge
                          color={employee.designation === 'SRM' ? 'info' : 'warning'}
                          className="ms-2"
                        >
                          {employee.designation}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{employee.mobile}</CTableDataCell>
                      <CTableDataCell>{formatDate(employee.dob)}</CTableDataCell>
                      <CTableDataCell>
                        <a href={`mailto:${employee.officerEmail}`}>{employee.officerEmail}</a>
                      </CTableDataCell>
                      <CTableDataCell>{employee.state?.stateName || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{employee.district?.districtNameEng || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{formatDate(employee.dateOfJoining)}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={employee.status ? 'success' : 'danger'}>
                          {employee.status ? 'Active' : 'Inactive'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="warning"
                          className="me-2"
                          size="sm"
                          onClick={() => fetchDRMMeetings(employee._id)}
                          title="View Training"
                        >
                          <CIcon icon={cilLaptop} />
                        </CButton>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2"
                          title="Edit Employee"
                          onClick={() => handleEditClick(employee)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          color="primary"
                          size="sm"
                          className="me-2"
                          title="Reset Password"
                          onClick={() => handleResetPassword(employee)}
                        >
                          <CIcon icon={cilLockLocked} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDeleteConfirmation(employee)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="9" className="text-center">
                      No employees found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>

            {/* Pagination */}
            {totalPages > 1 && (
              <CPagination className="mt-3" align="center">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                >
                  Previous
                </CPaginationItem>

                {[...Array(totalPages).keys()].map((number) => (
                  <CPaginationItem
                    key={number + 1}
                    active={currentPage === number + 1}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </CPaginationItem>
                ))}

                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => paginate(currentPage + 1)}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEmployee && (
            <p>
              Are you sure you want to delete employee <strong>{selectedEmployee.name}</strong>?
              This action cannot be undone.
            </p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteEmployee}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
      {editModalEmployee && (
        <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} size="lg">
          <CModalHeader></CModalHeader>
          <CModalBody>
            <AddEmployee
              employee={editModalEmployee}
              onClose={() => setEditModalEmployee(null)}
              onSave={handleSaveSuccess}
            />
          </CModalBody>
        </CModal>
      )}
      <CModal visible={visible} onClose={() => setVisible(false)} size="xl">
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Training Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol xs={12}>
              <CCard className="mb-4">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <h5>Training Sessions</h5>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
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
                      placeholder={`Search by Training Title`}
                      value={titleFilter}
                      onChange={(e) => setTitleFilter(e.target.value)}
                      style={{ width: 'auto' }}
                    />

                    {!showDRMMeetings && (
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
                    )}

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
                  {loading || isLoadingDRM ? (
                    <div className="text-center">
                      <CSpinner color="primary" />
                      <p>Loading trainings...</p>
                    </div>
                  ) : filteredTrainings.length === 0 ? (
                    <div className="text-center text-muted p-4">No trainings found</div>
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
                            <CTableDataCell>
                              {dayjs(training.date).format('MMM D, YYYY')}
                            </CTableDataCell>
                            <CTableDataCell>
                              {formatTime(training.startTime)} - {formatTime(training.endTime)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={statusColors[training.status]}>
                                {training.status.toUpperCase()}
                              </CBadge>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          {/* <CButton color="primary">Download Certificate</CButton> */}
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default EmployeeList
