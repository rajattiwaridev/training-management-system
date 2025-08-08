import React from 'react'
import './Bill.css'
import logo from '../../assets/images/PNG1.png'
const Bill = ({ orderDetails }) => {
  const calculateGst = (amount, rate) => (amount * rate) / 100
  const renderBillItems = () => {
    return orderDetails.foodItems.map((detail, index) => {
      const amount = detail.qty * detail.price
      if (isNaN(amount)) {
        console.error('Invalid amount for item:', detail)
        return null
      }
      return (
        <tr key={index}>
          <td style={{ textAlign: 'center' }}>{index + 1}</td>
          <td style={{ textAlign: 'left' }}>{detail.label}</td>
          <td style={{ textAlign: 'center' }}>{detail.qty}</td>
          <td style={{ textAlign: 'center' }}>{detail.price}</td>
          <td style={{ textAlign: 'center' }}>{amount}</td>
        </tr>
      )
    })
  }

  const sum = orderDetails.totalPrice
  const CGST = orderDetails.cgst
  const SGST = orderDetails.sgst
  const cgstAmount = calculateGst(sum, CGST)
  const sgstAmount = calculateGst(sum, SGST)
  const grandTotal = sum + cgstAmount + sgstAmount
  const formatDate = (date) => {
    const validDate = new Date(date)
    if (isNaN(validDate)) {
      console.error('Invalid date:', date)
      return 'Invalid date'
    }
    const day = String(validDate.getDate()).padStart(2, '0')
    const month = String(validDate.getMonth() + 1).padStart(2, '0')
    const year = validDate.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className="panel-body">
      <table className="table" width="100%" border="1">
        <thead>
          <tr>
            <td colSpan="3" style={{ border: 'none' }}>
              <h6 style={{ fontWeight: 'bold', textAlign: 'left' }}>GSTIN-22AEEPM0611H1Z6</h6>
            </td>
            <td style={{ border: 'none' }}>
              <h4 style={{ fontWeight: 'bold', textAlign: 'center' }}>JAI MAADI</h4>
            </td>
            <td style={{ border: 'none' }}>
              <h6 style={{ fontWeight: 'bold', textAlign: 'right' }}>FSSAI-20517083000646</h6>
            </td>
          </tr>
          <tr>
            <td colSpan="7" style={{ border: 'none', textAlign: 'center' }}>
              <h1>
                {' '}
                <img src={logo} alt="Banner" style={{ width: '30%', height: '30%' }} />
              </h1>
              <h6>
                Near Van Chetna Kendra, Mangatta, Rajanandgaon(C.G.)
                <br />
                Phone: 7223040444 WhatsApp: 9407980081 Email: rejoicepro@gmail.com
              </h6>
            </td>
          </tr>
          <tr>
            <td colSpan="4" style={{ border: 'none', textAlign: 'left' }}>
              <b>No. ND/A - {orderDetails.orderId}</b>
            </td>
            <td style={{ border: 'none', textAlign: 'right' }}>
              <b>Date - {formatDate(orderDetails.createdAt)}</b>
            </td>
          </tr>
          <tr>
            <td colSpan="7" style={{ border: 'none', textAlign: 'left' }}>
              <b>M/s. - {orderDetails.customerName}</b>
            </td>
          </tr>
          <tr style={{ textAlign: 'center' }}>
            <th>S.No.</th>
            <th>Items</th>
            <th>Qty.</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {renderBillItems()}
          <tr>
            <th colSpan="4" style={{ textAlign: 'right' }}>
              Total
            </th>
            <th style={{ textAlign: 'center' }}>{sum}</th>
          </tr>
          <tr>
            <th colSpan="4" style={{ textAlign: 'right' }}>
              CGST {CGST}%
            </th>
            <th style={{ textAlign: 'center' }}>{cgstAmount}</th>
          </tr>
          <tr>
            <th colSpan="4" style={{ textAlign: 'right' }}>
              SGST {SGST}%
            </th>
            <th style={{ textAlign: 'center' }}>{sgstAmount}</th>
          </tr>
          <tr>
            <th colSpan="4" style={{ textAlign: 'right' }}>
              G.Total
            </th>
            <th style={{ textAlign: 'center' }}>{grandTotal}</th>
          </tr>
        </tbody>
      </table>
      <p style={{ textAlign: 'center', fontSize: 'medium' }}>
        Thank you! Please visit again.
        <span style={{ float: 'right', marginRight: '10px' }}>
          <b>
            {orderDetails.careTakerName} ({orderDetails.roomName})
          </b>
        </span>
      </p>
    </div>
  )
}

export default Bill
