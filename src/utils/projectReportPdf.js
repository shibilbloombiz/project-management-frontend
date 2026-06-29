import jsPDF from 'jspdf';

const PAGE = {
  width: 297,
  height: 210,
  margin: 14,
};

const STATUS_DONE = new Set(['Done', 'Completed']);
const STATUS_PROGRESS = new Set(['Dev', 'In Progress', 'QA', 'Review']);

function valueOrDash(value) {
  if (value === 0) return '0';
  return value ? String(value) : '-';
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function taskCompletion(task) {
  if (typeof task.completion === 'number') return task.completion;
  if (typeof task.progress === 'number') return task.progress;
  if (STATUS_DONE.has(task.status)) return 100;
  if (task.status === 'QA' || task.status === 'Review') return 75;
  if (task.status === 'Dev' || task.status === 'In Progress') return 50;
  return 0;
}

function projectCompletion(tasks = []) {
  if (!tasks.length) return 0;
  const total = tasks.reduce((sum, task) => sum + taskCompletion(task), 0);
  return Math.round(total / tasks.length);
}

function statusCounts(tasks = []) {
  return {
    completed: tasks.filter((task) => STATUS_DONE.has(task.status)).length,
    inProgress: tasks.filter((task) => STATUS_PROGRESS.has(task.status)).length,
    pending: tasks.filter((task) => !STATUS_DONE.has(task.status) && !STATUS_PROGRESS.has(task.status)).length,
  };
}

function projectPriority(project) {
  if (project.priority) return project.priority;
  const tasks = project.tasks || [];
  const hasHighPriorityTask = tasks.some((task) => String(task.priority || '').toLowerCase() === 'high');
  return hasHighPriorityTask ? 'High' : 'Normal';
}

function table(doc, cursor, columns, rows, options = {}) {
  const rowHeight = options.rowHeight || 9;
  const headerHeight = 9;
  const bottomLimit = PAGE.height - 18;
  const startX = PAGE.margin;
  const widths = columns.map((column) => column.width);

  const ensurePage = (needed) => {
    if (cursor.y + needed <= bottomLimit) return;
    doc.addPage('landscape');
    cursor.y = PAGE.margin;
  };

  const drawHeader = () => {
    ensurePage(headerHeight + rowHeight);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(startX, cursor.y, widths.reduce((sum, width) => sum + width, 0), headerHeight, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    let x = startX;
    columns.forEach((column, index) => {
      doc.text(column.label, x + 2, cursor.y + 6);
      if (index > 0) doc.line(x, cursor.y, x, cursor.y + headerHeight);
      x += column.width;
    });
    cursor.y += headerHeight;
  };

  drawHeader();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  rows.forEach((row) => {
    const wrappedCells = row.map((cell, index) => {
      const width = columns[index].width - 4;
      return doc.splitTextToSize(valueOrDash(cell), width);
    });
    const maxLines = Math.max(...wrappedCells.map((lines) => lines.length));
    const height = Math.max(rowHeight, maxLines * 4.2 + 4);

    ensurePage(height);
    doc.setDrawColor(226, 232, 240);
    doc.rect(startX, cursor.y, widths.reduce((sum, width) => sum + width, 0), height);
    let x = startX;
    wrappedCells.forEach((lines, index) => {
      if (index > 0) doc.line(x, cursor.y, x, cursor.y + height);
      doc.text(lines, x + 2, cursor.y + 5);
      x += columns[index].width;
    });
    cursor.y += height;
  });

  cursor.y += 4;
}

function sectionTitle(doc, cursor, title) {
  if (cursor.y > PAGE.height - 26) {
    doc.addPage('landscape');
    cursor.y = PAGE.margin;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(title, PAGE.margin, cursor.y);
  doc.setDrawColor(99, 102, 241);
  doc.line(PAGE.margin, cursor.y + 2, PAGE.margin + 36, cursor.y + 2);
  cursor.y += 8;
}

function keyValueGrid(doc, cursor, items) {
  const colWidth = (PAGE.width - PAGE.margin * 2) / 4;
  const rowHeight = 17;
  items.forEach((item, index) => {
    const col = index % 4;
    const rowStart = col === 0;
    if (rowStart && cursor.y + rowHeight > PAGE.height - 18) {
      doc.addPage('landscape');
      cursor.y = PAGE.margin;
    }
    const x = PAGE.margin + col * colWidth;
    const y = cursor.y;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, colWidth - 3, rowHeight - 2, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label.toUpperCase(), x + 3, y + 5);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(valueOrDash(item.value), colWidth - 9), x + 3, y + 11);
    if (col === 3 || index === items.length - 1) cursor.y += rowHeight;
  });
  cursor.y += 3;
}

function paragraph(doc, cursor, text) {
  const lines = doc.splitTextToSize(valueOrDash(text), PAGE.width - PAGE.margin * 2);
  if (cursor.y + lines.length * 5 > PAGE.height - 18) {
    doc.addPage('landscape');
    cursor.y = PAGE.margin;
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(lines, PAGE.margin, cursor.y);
  cursor.y += lines.length * 5 + 4;
}

function addPageNumbers(doc) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${page} of ${total}`, PAGE.width - PAGE.margin, PAGE.height - 8, { align: 'right' });
  }
}

export function downloadProjectReportPdf(project, { companyName, companyLogo, projectManager } = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const tasks = project.tasks || [];
  const completion = projectCompletion(tasks);
  const counts = statusCounts(tasks);
  const generatedDate = new Date().toLocaleString('en-IN');
  const cursor = { y: PAGE.margin };

  if (companyLogo) {
    try {
      doc.addImage(companyLogo, 'PNG', PAGE.margin, cursor.y, 18, 18, undefined, 'FAST');
    } catch {
      try {
        doc.addImage(companyLogo, 'JPEG', PAGE.margin, cursor.y, 18, 18, undefined, 'FAST');
      } catch {
        // Ignore invalid logo data; the report remains valid without the image.
      }
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('PROJECT REPORT', companyLogo ? PAGE.margin + 23 : PAGE.margin, cursor.y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(valueOrDash(companyName), companyLogo ? PAGE.margin + 23 : PAGE.margin, cursor.y + 15);
  doc.text(`Generated: ${generatedDate}`, PAGE.width - PAGE.margin, cursor.y + 8, { align: 'right' });
  cursor.y += 25;

  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.6);
  doc.line(PAGE.margin, cursor.y, PAGE.width - PAGE.margin, cursor.y);
  cursor.y += 8;

  sectionTitle(doc, cursor, 'Project Overview');
  keyValueGrid(doc, cursor, [
    { label: 'Company Name', value: companyName },
    { label: 'Project Name', value: project.name },
    { label: 'Project Status', value: project.status },
    { label: 'Priority', value: projectPriority(project) },
    { label: 'Start Date', value: formatDate(project.startDate) },
    { label: 'Deadline', value: formatDate(project.endDate || project.deadline) },
    { label: 'Completion', value: `${completion}%` },
    { label: 'Project Manager', value: project.manager || project.leadName || projectManager },
  ]);

  paragraph(doc, cursor, project.desc || project.description || 'No project description provided.');

  sectionTitle(doc, cursor, 'Team Members');
  table(
    doc,
    cursor,
    [
      { label: 'Name / Email', width: 95 },
      { label: 'Role', width: 70 },
      { label: 'Assigned Tasks', width: 105 },
    ],
    (project.assignedStaff || []).map((member) => {
      const assigned = tasks.filter((task) => task.assigneeEmail === member || task.assigneeName === member);
      return [member, 'Team Member', assigned.map((task) => task.title).join(', ') || '-'];
    }),
    { rowHeight: 10 }
  );

  sectionTitle(doc, cursor, 'Modules And Milestones');
  table(
    doc,
    cursor,
    [
      { label: 'Type', width: 45 },
      { label: 'Name', width: 135 },
      { label: 'Status', width: 45 },
      { label: 'Notes', width: 45 },
    ],
    [
      ...(project.requirements || []).map((item) => ['Module', item, project.status || '-', '-']),
      ...(project.milestones || []).map((item) => [
        'Milestone',
        item.title || item.name || item,
        item.status || '-',
        item.dueDate ? `Due ${formatDate(item.dueDate)}` : '-',
      ]),
    ],
    { rowHeight: 10 }
  );

  sectionTitle(doc, cursor, 'Tasks');
  table(
    doc,
    cursor,
    [
      { label: 'Task Name', width: 84 },
      { label: 'Assigned Employee', width: 58 },
      { label: 'Status', width: 34 },
      { label: 'Priority', width: 28 },
      { label: 'Due Date', width: 34 },
      { label: 'Completion', width: 32 },
    ],
    tasks.map((task) => [
      task.title,
      task.assigneeName || task.assigneeEmail || '-',
      task.status || '-',
      task.priority || 'Normal',
      formatDate(task.deadline || task.dueDate),
      `${taskCompletion(task)}%`,
    ]),
    { rowHeight: 10 }
  );

  sectionTitle(doc, cursor, 'Recent Activity');
  table(
    doc,
    cursor,
    [
      { label: 'Activity', width: 205 },
      { label: 'Status', width: 65 },
    ],
    tasks.slice(-8).reverse().map((task) => [
      `${task.assigneeName || task.assigneeEmail || 'Team'} updated ${task.title}${task.note ? ` - ${task.note}` : ''}`,
      task.status || '-',
    ]),
    { rowHeight: 10 }
  );

  sectionTitle(doc, cursor, 'Project Summary');
  paragraph(
    doc,
    cursor,
    `This project is ${completion}% complete with ${counts.completed} completed tasks, ${counts.inProgress} tasks in progress, and ${counts.pending} pending tasks. Current phase: ${project.currentPhase || project.status || '-'}.`
  );

  addPageNumbers(doc);
  doc.save(`${valueOrDash(project.name).replace(/[^a-z0-9]+/gi, '_')}_project_report.pdf`);
}
