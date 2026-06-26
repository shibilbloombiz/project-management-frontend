export const parseTaskNote = (noteText) => {
  if (!noteText) {
    return {
      log: '',
      hours: '',
      progress: '0',
      blockers: '',
      needSupport: false,
    };
  }
  const logMatch = noteText.match(/\[Log\]\s*(.*?)(?=\. Spent:|$)/);
  const hoursMatch = noteText.match(/Spent:\s*(\d+)h/);
  const progressMatch = noteText.match(/Progress:\s*(\d+)%/);
  const blockersMatch = noteText.match(/Blockers:\s*(.*?)(?=\. Support:|$)/);
  const supportMatch = noteText.match(/Support:\s*(Yes|No)/);
  return {
    log: logMatch ? logMatch[1] : noteText,
    hours: hoursMatch ? hoursMatch[1] : '',
    progress: progressMatch ? progressMatch[1] : '0',
    blockers: blockersMatch ? blockersMatch[1] : '',
    needSupport: supportMatch ? supportMatch[1] === 'Yes' : false,
  };
};

export const formatTaskNote = (log, hours, progress, blockers, needSupport) => {
  return `[Log] ${log || 'Work update'}. Spent: ${hours || '0'}h. Progress: ${progress || '0'}%. Blockers: ${blockers || 'None'}. Support: ${needSupport ? 'Yes' : 'No'}.`;
};

export const deriveEmployeeProjectKpis = (selectedProject, isMyTask) => {
  if (!selectedProject?.tasks) {
    return { total: 0, progress: 0, review: 0, completed: 0, overdue: 0, hours: 0 };
  }
  const myTasks = selectedProject.tasks.filter(isMyTask);
  const isProgressStatus = (status) => status === 'Dev' || status === 'In Progress';
  const isReviewStatus = (status) => status === 'QA' || status === 'Review';
  return {
    total: myTasks.length,
    progress: myTasks.filter((task) => isProgressStatus(task.status)).length,
    review: myTasks.filter((task) => isReviewStatus(task.status)).length,
    completed: myTasks.filter((task) => task.status === 'Done').length,
    overdue: myTasks.filter((task) => task.status !== 'Done' && (task.note?.includes('[BLOCKED]') || task.title.toLowerCase().includes('pdf'))).length,
    hours: myTasks.reduce((sum, task) => sum + (parseInt(parseTaskNote(task.note).hours, 10) || 0), 0),
  };
};

export const filterEmployeeProjects = (projects, search, statusFilter, sortKey) => {
  return projects
    .filter((project) => {
      const text = `${project.name} ${project.desc || ''}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((left, right) => {
      if (sortKey === 'name') return left.name.localeCompare(right.name);
      if (sortKey === 'status') return (left.status || '').localeCompare(right.status || '');
      return 0;
    });
};
