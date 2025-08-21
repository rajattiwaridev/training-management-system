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
import logo from '../../assets/images/logo.png' // Adjust the path as necessary
const formatTime1 = (timeString) => {
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
const handlePrint = (src, trainingData) => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
      <html>
  <head>
    <title>Training Attendance - Print</title>
    <style>
      @page {
        size: A4;
        margin: 15mm;
      }
      body {
        font-family: 'Arial', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 20px;
      }
      .logo {
        height: 80px;
        margin-bottom: 10px;
      }
      .system-name {
        font-size: 24px;
        font-weight: bold;
        color: #0066cc;
        margin-bottom: 5px;
      }
      .training-title {
        font-size: 30px;
        font-weight: bold;
        margin: 25px 0;
        color: #222;
      }
      .qr-container {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
        border: 1px dashed #ccc;
        border-radius: 5px;
      }
      .qr-code {
        width: 250px;
        height: 250px;
        margin: 0 auto;
      }
      .scan-instruction {
        font-size: 20px;
        margin: 15px 0;
        color: #555;
      }
      .details-container {
        margin-top: 30px;
      }
      .detail-row {
        display: flex;
        margin-bottom: 10px;
        font-size: 20px;
      }
      .detail-label {
        font-size: 20px;
        font-weight: bold;
        width: 160px;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #777;
        border-top: 1px solid #eee;
        padding-top: 15px;
      }
      @media print {
        body {
          padding: 0;
        }
        .no-print {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="${logo}" class="logo" alt="Organization Logo">
      <div class="system-name">Training Management System</div>
      <div>Official Training Attendance</div>
    </div>

    <div class="training-title">Today's Training: <span id="training-title">${trainingData.title}</span></div>

    <div class="qr-container">
      <div class="scan-instruction">Scan the QR Code below to mark your attendance</div>
      <img src="${src}" class="qr-code" alt="Attendance QR Code">
    </div>

    <div class="details-container">
      <div class="detail-row">
        <div class="detail-label">Training Date:</div>
        <div id="training-date">${new Date(trainingData.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Training Time:</div>
        <div id="training-time">${formatTime1(trainingData.startTime)} - ${formatTime1(trainingData.endTime)}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Location:</div>
        <div id="training-location">${trainingData.location}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Trainer:</div>
        <div id="training-trainer">${trainingData.trainerName}</div>
      </div>
    </div>

    <div class="footer">
      <div>Generated on <span id="print-date"></span></div>
    </div>

    <script>
      // You can dynamically populate these fields from your data
      document.addEventListener('DOMContentLoaded', function() {
        // Format the current date for the footer
        const now = new Date();
        document.getElementById('print-date').textContent = now.toLocaleString();
        
        // Auto-print and close (for the print window)
        setTimeout(function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        }, 300);
      });
    </script>
  </body>
</html>
    `)
  printWindow.document.close()
}
const endpoint = import.meta.env.VITE_BACKEND_API
const TodayTrainingList = () => {
  const token = sessionStorage.getItem('authToken')
  const userId = sessionStorage.getItem('user')
  const [trainings, setTrainings] = useState([])

  useEffect(() => {
    const fetchTodayTrainings = async () => {
      try {
        const response = await axios.get(`${endpoint}/trainings/${userId}?type=Today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Add dynamic status to each training
        const trainingsWithStatus = response.data.map((training) => {
          const now = new Date()
          const trainingDate = new Date(training.date)

          // Create start datetime
          const [startHours, startMinutes] = training.startTime.split(':').map(Number)
          const startDateTime = new Date(trainingDate)
          startDateTime.setHours(startHours, startMinutes, 0, 0)

          // Create end datetime
          const [endHours, endMinutes] = training.endTime.split(':').map(Number)
          const endDateTime = new Date(trainingDate)
          endDateTime.setHours(endHours, endMinutes, 0, 0)

          // Determine status
          const status =
            now < startDateTime ? 'upcoming' : now <= endDateTime ? 'running' : 'completed'

          return {
            ...training,
            status,
            startDateTime,
            endDateTime,
          }
        })

        setTrainings(trainingsWithStatus)
      } catch (error) {
        console.error('Error fetching trainings:', error)
      }
    }

    fetchTodayTrainings()

    // Set up interval to update status every minute
    const intervalId = setInterval(() => {
      setTrainings((prevTrainings) => {
        return prevTrainings.map((training) => {
          const now = new Date()
          let status = training.status

          // Update status if needed
          if (now > training.endDateTime && training.status !== 'completed') {
            status = 'completed'
          } else if (
            now >= training.startDateTime &&
            now <= training.endDateTime &&
            training.status !== 'running'
          ) {
            status = 'running'
          }

          return {
            ...training,
            status,
          }
        })
      })
    }, 60000) // Update every minute

    return () => clearInterval(intervalId)
  }, [endpoint, userId, token])

  // Format time display
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

  // Get badge color based on status
  const getBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'running':
        return 'primary'
      case 'upcoming':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="training-container">
      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Title</CTableHeaderCell>
            <CTableHeaderCell>Trainer</CTableHeaderCell>
            <CTableHeaderCell>Department</CTableHeaderCell>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Time</CTableHeaderCell>
            <CTableHeaderCell>QR Image</CTableHeaderCell>
            <CTableHeaderCell>Print QR</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Time Left</CTableHeaderCell> {/* New column */}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {trainings.map((training) => (
            <TrainingRow
              key={training._id}
              training={training}
              formatTime={formatTime}
              getBadgeColor={getBadgeColor}
            />
          ))}
        </CTableBody>
      </CTable>
    </div>
  )
}

// Separate component for each row to manage its own timer
const TrainingRow = ({ training, formatTime, getBadgeColor }) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (training.status === 'running') {
      // Update timer every second for running trainings
      const intervalId = setInterval(() => {
        const now = new Date()
        const diffMs = training.endDateTime - now

        if (diffMs <= 0) {
          clearInterval(intervalId)
          setTimeLeft('Training ended')
          return
        }

        // Calculate time left
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000)

        setTimeLeft(`${diffHours}h ${diffMinutes}m ${diffSeconds}s`)
      }, 1000)

      return () => clearInterval(intervalId)
    } else if (training.status === 'completed') {
      setTimeLeft('Training completed')
    } else {
      setTimeLeft('Not started')
    }
  }, [training])

  return (
    <CTableRow>
      <CTableDataCell>{training.title}</CTableDataCell>
      <CTableDataCell>{training.trainerName}</CTableDataCell>
      <CTableDataCell>{training.departments?.departmentName}</CTableDataCell>
      <CTableDataCell>{new Date(training.date).toLocaleDateString()}</CTableDataCell>
      <CTableDataCell>
        {formatTime(training.startTime)} - {formatTime(training.endTime)}
      </CTableDataCell>
      <CTableDataCell>
        <Image width="50px" height="50px" src={`${endpoint}/${training.qrCodeImg}`} />
      </CTableDataCell>
      <CTableDataCell>
        <CBadge
          color="primary"
          onClick={() => handlePrint(`${endpoint}/${training.qrCodeImg}`, training)}
        >
          Print QR
        </CBadge>
      </CTableDataCell>
      <CTableDataCell>
        <CBadge color={getBadgeColor(training.status)}>{training.status}</CBadge>
      </CTableDataCell>
      <CTableDataCell>{timeLeft}</CTableDataCell>
    </CTableRow>
  )
}

export default TodayTrainingList
