import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format a readable date string: e.g. "October 19, 2026 at 08:30 PM"
 */
function formatReportDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' at ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Generate and download a professional PDF Academic Performance Report.
 */
export function exportStudentPdf({ student, analysis, performances = [], aiRecommendation = null }) {
  if (!student) {
    throw new Error('Please select a student before generating the PDF report.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // 1. Header Banner
  doc.setFillColor(79, 70, 229); // Primary Indigo (#4F46E5)
  doc.rect(margin, cursorY, contentWidth, 54, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('EduPulse Academic Performance Report', margin + 16, cursorY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Intelligent Student Success & Risk Diagnostics System', margin + 16, cursorY + 44);

  cursorY += 68;

  // 2. Report Metadata
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.text(`Generated on: ${formatReportDate()}`, margin, cursorY);
  doc.text(`Verification ID: EP-${student.id}-${Date.now().toString().slice(-6)}`, pageWidth - margin, cursorY, { align: 'right' });

  cursorY += 16;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 18;

  // 3. Student Profile Info Card
  doc.setFillColor(248, 250, 252); // Light slate background
  doc.roundedRect(margin, cursorY, contentWidth, 70, 4, 4, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cursorY, contentWidth, 70, 4, 4, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(student.name || 'Unnamed Student', margin + 14, cursorY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Student ID: #${student.id}`, margin + 14, cursorY + 38);
  doc.text(`Email: ${student.email || 'N/A'}`, margin + 14, cursorY + 54);

  doc.text(`Department / Course: ${student.course || 'N/A'}`, margin + 240, cursorY + 38);
  doc.text(`Academic Standing: Year ${student.year || 1}`, margin + 240, cursorY + 54);

  cursorY += 86;

  // 4. Academic Health Diagnostics Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Academic Diagnostics Summary', margin, cursorY);
  cursorY += 12;

  const boxWidth = (contentWidth - 24) / 3;
  const boxHeight = 50;

  // Avg Marks Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, cursorY, boxWidth, boxHeight, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  const avgMarksText = analysis?.averageMarks != null ? `${analysis.averageMarks.toFixed(1)}%` : 'N/A';
  doc.text(avgMarksText, margin + boxWidth / 2, cursorY + 24, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CUMULATIVE AVERAGE', margin + boxWidth / 2, cursorY + 40, { align: 'center' });

  // Attendance Box
  const box2X = margin + boxWidth + 12;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(box2X, cursorY, boxWidth, boxHeight, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  const avgAttText = analysis?.averageAttendance != null ? `${analysis.averageAttendance.toFixed(1)}%` : 'N/A';
  doc.text(avgAttText, box2X + boxWidth / 2, cursorY + 24, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CLASS ATTENDANCE RATE', box2X + boxWidth / 2, cursorY + 40, { align: 'center' });

  // Risk Level Box with Accent Colors
  const box3X = box2X + boxWidth + 12;
  const risk = (analysis?.riskLevel || 'LOW').toUpperCase();
  let riskBg = [220, 252, 231]; // Green
  let riskText = [22, 101, 52];
  if (risk === 'HIGH') {
    riskBg = [254, 226, 226]; // Red
    riskText = [153, 27, 27];
  } else if (risk === 'MEDIUM') {
    riskBg = [254, 243, 199]; // Amber
    riskText = [146, 64, 14];
  }

  doc.setFillColor(riskBg[0], riskBg[1], riskBg[2]);
  doc.roundedRect(box3X, cursorY, boxWidth, boxHeight, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(riskText[0], riskText[1], riskText[2]);
  doc.text(`${risk} RISK`, box3X + boxWidth / 2, cursorY + 24, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('ACADEMIC RISK ASSESSMENT', box3X + boxWidth / 2, cursorY + 40, { align: 'center' });

  cursorY += boxHeight + 20;

  // 5. Subject-Wise Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Subject-Wise Performance & Attendance Records', margin, cursorY);
  cursorY += 8;

  const tableRows = performances.length > 0
    ? performances.map((p, idx) => [
        String(idx + 1),
        p.subject || 'Unknown Subject',
        `${p.marks != null ? p.marks : 0}%`,
        `${p.attendance != null ? p.attendance : 0}%`,
        Number(p.marks) < 60 ? 'Needs Focus' : 'Satisfactory'
      ])
    : [['-', 'No subject performance records logged', '-', '-', '-']];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['#', 'Subject Name', 'Marks Scored', 'Attendance', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 28, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 80, halign: 'center' },
      3: { cellWidth: 80, halign: 'center' },
      4: { cellWidth: 90, halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'Needs Focus') {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'Satisfactory') {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  cursorY = doc.lastAutoTable.finalY + 18;

  // 6. Weak Subjects Section
  if (cursorY + 60 > pageHeight - 50) {
    doc.addPage();
    cursorY = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Identified Areas for Improvement:', margin, cursorY);
  cursorY += 14;

  const weakSubjects = analysis?.weakSubjects || [];
  if (weakSubjects.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    const weakList = weakSubjects.join(', ');
    doc.text(`• Requires remedial attention in: ${weakList}`, margin + 6, cursorY);
    cursorY += 16;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text('• No critical subject weaknesses identified. Academic performance is currently satisfactory.', margin + 6, cursorY);
    cursorY += 16;
  }

  // 7. AI Recommendation Plan (if present)
  if (aiRecommendation && aiRecommendation.recommendation) {
    if (cursorY + 90 > pageHeight - 50) {
      doc.addPage();
      cursorY = margin;
    }

    cursorY += 10;
    doc.setFillColor(245, 243, 255); // Indigo/purple tint
    doc.setDrawColor(196, 181, 253);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(109, 40, 217);
    doc.text(`AI Remedial Roadmap (${aiRecommendation.aiSource || 'Google Gemini AI'})`, margin, cursorY);
    cursorY += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    const splitRec = doc.splitTextToSize(aiRecommendation.recommendation, contentWidth - 20);
    const boxHeightAi = Math.min(splitRec.length * 11 + 18, 180);

    doc.roundedRect(margin, cursorY, contentWidth, boxHeightAi, 4, 4, 'F');
    doc.roundedRect(margin, cursorY, contentWidth, boxHeightAi, 4, 4, 'S');

    doc.text(splitRec.slice(0, 14), margin + 10, cursorY + 16);
    if (splitRec.length > 14) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('(Roadmap summary abridged for report format. Refer to EduPulse AI Advisor for full interactive guide.)', margin + 10, cursorY + boxHeightAi - 6);
    }
    cursorY += boxHeightAi + 14;
  }

  // 8. Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('EduPulse Intelligence Platform • Confidential Student Academic Record', margin, pageHeight - 20);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  // Trigger Download
  const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStamp = new Date().toISOString().slice(0, 10);
  doc.save(`EduPulse_Report_${safeName}_${dateStamp}.pdf`);
}

/**
 * Generate and download a standard RFC-4180 CSV export of student performance.
 */
export function exportStudentCsv({ student, performances = [] }) {
  if (!student) {
    throw new Error('Please select a student before downloading CSV.');
  }

  const headers = [
    'Student ID',
    'Student Name',
    'Email Address',
    'Department / Course',
    'Academic Year',
    'Subject Name',
    'Marks Scored (%)',
    'Attendance (%)',
    'Academic Status'
  ];

  const rows = [];

  if (performances && performances.length > 0) {
    performances.forEach(p => {
      const status = Number(p.marks) < 60 ? 'Needs Focus' : 'Satisfactory';
      rows.push([
        student.id,
        `"${(student.name || '').replace(/"/g, '""')}"`,
        `"${(student.email || '').replace(/"/g, '""')}"`,
        `"${(student.course || '').replace(/"/g, '""')}"`,
        student.year || 1,
        `"${(p.subject || '').replace(/"/g, '""')}"`,
        p.marks != null ? p.marks : 0,
        p.attendance != null ? p.attendance : 0,
        `"${status}"`
      ]);
    });
  } else {
    rows.push([
      student.id,
      `"${(student.name || '').replace(/"/g, '""')}"`,
      `"${(student.email || '').replace(/"/g, '""')}"`,
      `"${(student.course || '').replace(/"/g, '""')}"`,
      student.year || 1,
      '"No subjects recorded"',
      '0',
      '0',
      '"N/A"'
    ]);
  }

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `EduPulse_Marks_${safeName}_${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
