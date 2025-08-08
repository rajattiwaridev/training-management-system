import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
const AttendanceList = ({ training, onClose, onSave }) => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const userId = sessionStorage.getItem('user')
  const [loading, setLoading] = useState(true)
  const [trainingAttendanceList, setTrainingAttendanceList] = useState([])
  useEffect(() => {
    const getAttendanceList = async () => {
      try {
        const response = await axios.get(`${endpoint}/training/attendance/${training._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 200) {
          setTrainingAttendanceList(response.data)
        } else {
          SweetAlert.fire('Error', 'No Attendance Found', 'errors')
        }
      } catch (error) {
        SweetAlert.fire('Error', 'Failed to load training Attendance', 'error')
        setLoading(false)
      }
    }
    getAttendanceList()
  }, [token])

  return (
    <CTable hover responsive striped>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>Name</CTableHeaderCell>
          <CTableHeaderCell>Mobile </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {trainingAttendanceList.length > 0 ? (
          trainingAttendanceList.map((employee) => (
            <CTableRow key={employee._id}>
              <CTableDataCell>{employee.name} </CTableDataCell>
              <CTableDataCell>{employee.mobile}</CTableDataCell>
            </CTableRow>
          ))
        ) : (
          <CTableRow>
            <CTableDataCell colSpan="9" className="text-center">
              No Attendance found
            </CTableDataCell>
          </CTableRow>
        )}
      </CTableBody>
    </CTable>
  )
}

export default AttendanceList
