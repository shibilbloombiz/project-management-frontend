import React, { useEffect, useState } from 'react';

const statusOptions = ['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

export default function ProjectDetail({ projectId }) {
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProject(data.data);
          setStatus(data.data.status);
        }
      })
      .catch(err => console.error('Fetch project error:', err));
  }, [projectId]);

  const handleStatusChange = async e => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        setProject(result.data);
      } else {
        console.error('Status update failed:', result.message);
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <div>Loading project...</div>;

  return (
    <div className="project-detail" style={{ padding: '1rem', background: 'var(--bg-paper)', borderRadius: '8px' }}>
      <h2>{project.name}</h2>
      <p><strong>Description:</strong> {project.desc}</p>
      <p><strong>Client Email:</strong> {project.clientEmail}</p>
      <p><strong>Client Access Link:</strong> <a href={`/share/${project.clientAccessKey}`} target="_blank" rel="noopener noreferrer">Access Link</a></p>
      <p><strong>Assigned Employees:</strong> {project.assignedStaff?.join(', ')}</p>
      <p><strong>Ongoing Work:</strong> {project.tasks?.filter(t => t.status !== 'Done').map(t => t.title).join(', ')}</p>
      <p><strong>Pending Tasks:</strong> {project.tasks?.filter(t => t.status === 'Pending' || t.status === 'Planning').map(t => t.title).join(', ')}</p>
      <label htmlFor="status-select"><strong>Status:</strong></label>
      <select id="status-select" value={status} onChange={handleStatusChange} disabled={loading} style={{ marginLeft: '0.5rem' }}>
        {statusOptions.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {loading && <span style={{ marginLeft: '0.5rem' }}>Updating...</span>}
    </div>
  );
}
