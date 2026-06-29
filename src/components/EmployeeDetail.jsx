import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

export default function EmployeeDetail({ employeeId }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    const token = sessionStorage.getItem("syncra_token");
    fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmployee(data.data);
      })
      .catch(err => console.error('Fetch employee error:', err));
  }, [employeeId]);

  const downloadFile = async (url, filename) => {
    try {
      const token = sessionStorage.getItem("syncra_token");
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleAttendanceDownload = () => {
    downloadFile(`${API_BASE_URL}/api/employees/${employeeId}/attendance/report`, 'attendance_report.pdf');
  };

  const handlePaymentDownload = () => {
    downloadFile(`${API_BASE_URL}/api/employees/${employeeId}/payment/report`, 'payment_report.pdf');
  };

  if (!employee) return <div>Loading employee...</div>;

  return (
    <div className="employee-detail" style={{ padding: '1rem', background: 'var(--bg-paper)', borderRadius: '8px' }}>
      <h2>{employee.name}</h2>
      <p><strong>Role:</strong> {employee.role}</p>
      <p><strong>Assigned Tasks:</strong> {employee.assignedTasks?.join(', ')}</p>
      <p><strong>Pending Tasks:</strong> {employee.pendingTasks?.join(', ')}</p>
      <p><strong>Leave Count:</strong> {employee.leaveCount ?? 0}</p>
      <p><strong>Attendance Summary:</strong> {employee.attendanceSummary}</p>
      <button onClick={handleAttendanceDownload} style={{ marginRight: '0.5rem' }}>Download Attendance Report</button>
      <button onClick={handlePaymentDownload}>Download Payment Details</button>
    </div>
  );
}
