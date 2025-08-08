import React, { useState } from 'react';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge
} from '@coreui/react';

const DashboardTrainingList = ({ trainings }) => {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Group trainings by state
  const states = trainings.reduce((acc, training) => {
    const stateId = training.createdBy.state._id;
    if (!acc[stateId]) {
      acc[stateId] = {
        name: training.createdBy.state.stateName,
        count: 0,
      };
    }
    acc[stateId].count++;
    return acc;
  }, {});

  // Group by division (if state selected)
  const divisions = selectedState 
    ? trainings
        .filter(t => t.createdBy.state._id === selectedState)
        .reduce((acc, training) => {
          const divId = training.createdBy.division._id;
          if (!acc[divId]) {
            acc[divId] = {
              name: training.createdBy.division.name,
              count: 0,
            };
          }
          acc[divId].count++;
          return acc;
        }, {})
    : null;

  // Group by district (if division selected)
  const districts = selectedDivision 
    ? trainings
        .filter(t => t.createdBy.division._id === selectedDivision)
        .reduce((acc, training) => {
          const distId = training.createdBy.district._id;
          if (!acc[distId]) {
            acc[distId] = {
              name: training.createdBy.district.districtNameEng,
              count: 0,
            };
          }
          acc[distId].count++;
          return acc;
        }, {})
    : null;

  // Filtered trainings (if district selected)
  const filteredTrainings = selectedDistrict
    ? trainings.filter(t => t.createdBy.district._id === selectedDistrict)
    : null;

  return (
    <div className="training-container">
      {/* State Level Table */}
      {!selectedState && (
        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>State</CTableHeaderCell>
              <CTableHeaderCell>Training Count</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {Object.entries(states).map(([id, state]) => (
              <CTableRow key={id}>
                <CTableDataCell>{state.name}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color="primary">{state.count}</CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton 
                    color="info" 
                    size="sm"
                    onClick={() => setSelectedState(id)}
                  >
                    View Divisions
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      {/* Division Level Table (if state selected) */}
      {selectedState && !selectedDivision && (
        <>
          <CButton 
            color="secondary" 
            onClick={() => setSelectedState(null)}
            className="mb-3"
          >
            ← Back to States
          </CButton>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Division</CTableHeaderCell>
                <CTableHeaderCell>Training Count</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {Object.entries(divisions).map(([id, division]) => (
                <CTableRow key={id}>
                  <CTableDataCell>{division.name}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="primary">{division.count}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      color="info" 
                      size="sm"
                      onClick={() => setSelectedDivision(id)}
                    >
                      View Districts
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </>
      )}

      {/* District Level Table (if division selected) */}
      {selectedDivision && !selectedDistrict && (
        <>
          <CButton 
            color="secondary" 
            onClick={() => setSelectedDivision(null)}
            className="mb-3"
          >
            ← Back to Divisions
          </CButton>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>District</CTableHeaderCell>
                <CTableHeaderCell>Training Count</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {Object.entries(districts).map(([id, district]) => (
                <CTableRow key={id}>
                  <CTableDataCell>{district.name}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="primary">{district.count}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      color="info" 
                      size="sm"
                      onClick={() => setSelectedDistrict(id)}
                    >
                      View Trainings
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </>
      )}

      {/* Training List Table (if district selected) */}
      {selectedDistrict && (
        <>
          <CButton 
            color="secondary" 
            onClick={() => setSelectedDistrict(null)}
            className="mb-3"
          >
            ← Back to Districts
          </CButton>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Title</CTableHeaderCell>
                <CTableHeaderCell>Trainer</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Time</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredTrainings.map(training => (
                <CTableRow key={training._id}>
                  <CTableDataCell>{training.title}</CTableDataCell>
                  <CTableDataCell>{training.trainerName}</CTableDataCell>
                  <CTableDataCell>
                    {new Date(training.date).toLocaleDateString()}
                  </CTableDataCell>
                  <CTableDataCell>
                    {training.startTime} - {training.endTime}
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
        </>
      )}
    </div>
  );
};

export default DashboardTrainingList;