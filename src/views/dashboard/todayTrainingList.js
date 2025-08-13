import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
} from '@coreui/react'
import axios from 'axios'
import { Image } from 'antd'
const TodayTrainingList = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const userId = sessionStorage.getItem('user')
  const role = sessionStorage.getItem('role')
  const stateId = sessionStorage.getItem('stateId')
  const [trainings, setTrainings] = useState([])
  useEffect(() => {
    const fetchTodayTrainings = async () => {
      try {
        const response = await axios.get(`${endpoint}/trainings/${userId}?type=Today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setTrainings(response.data)
      } catch (error) {
        console.error('Error fetching trainings:', error)
      }
    }
    fetchTodayTrainings()
  }, [endpoint, userId, token])

  return (
    <div className="training-container">
      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Title</CTableHeaderCell>
            <CTableHeaderCell>Trainer</CTableHeaderCell>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Time</CTableHeaderCell>
            <CTableHeaderCell>QR Image</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {trainings.map((training) => (
            <CTableRow key={training._id}>
              <CTableDataCell>{training.title}</CTableDataCell>
              <CTableDataCell>{training.trainerName}</CTableDataCell>
              <CTableDataCell>{new Date(training.date).toLocaleDateString()}</CTableDataCell>
              <CTableDataCell>
                {training.startTime} - {training.endTime}
              </CTableDataCell>
              <CTableDataCell>
                <Image width="50px" height="50px" src={`${endpoint}/${training.qrCodeImg}`} />
              </CTableDataCell>
              <CTableDataCell>
                <CBadge color={training.status === 'completed' ? 'success' : 'warning'}>
                  {training.status}
                </CBadge>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default TodayTrainingList
