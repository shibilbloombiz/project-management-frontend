export const getToken = () => sessionStorage.getItem('syncra_token');

export const authHeaders = (json = false) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  Authorization: `Bearer ${getToken()}`,
});

export function buildNotifications({ leaves = [], projects = [], messages = [] }) {
  return [
    ...leaves
      .filter((leave) => leave.status === 'Pending')
      .map((leave) => ({
        id: `leave_${leave._id || leave.id}`,
        type: 'leave_request',
        title: 'Pending Leave Request',
        desc: `${leave.employeeName || leave.employeeEmail} requested leave from ${leave.startDate} to ${leave.endDate}`,
        tab: 'employees',
      })),

    ...projects.flatMap((project) =>
      (project.clientRequirements || [])
        .filter((req) => req.status === 'Pending Review')
        .map((req) => ({
          id: `scope_${req.id || req._id}`,
          type: 'client_scope',
          title: `Scope Proposed: ${project.name}`,
          desc: req.title || req.description || 'Client submitted a new requirement',
          tab: 'projects',
          project,
        }))
    ),

    ...messages
      .filter((msg) => msg.senderName?.toLowerCase?.().includes('client'))
      .map((msg) => ({
        id: `msg_${msg._id || msg.id || msg.createdAt}`,
        type: 'client_message',
        title: `Client Message: ${msg.senderName}`,
        desc: msg.text || 'Shared an attachment',
        tab: 'messages',
      })),
  ];
}
