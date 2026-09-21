/**
 * EduPulse — Adaptive Student Intelligence Platform
 * app.js | Vanilla JavaScript, Fetch API only
 *
 * Architecture:
 *   API Layer    → functions that call Spring Boot REST endpoints
 *   State        → single state object tracks current app data
 *   Nav          → section-switching without page reload
 *   Render       → pure render functions update the DOM
 *   Events       → event listeners wire UI interactions
 */

'use strict';

// ============================================================
// 1. API LAYER — Calls the existing Spring Boot backend only
// ============================================================

const API_BASE = '';   // same origin as Spring Boot (localhost:8080)

/**
 * Fetch all students.
 * GET /api/students
 * Returns: [{id, name, email, course, year}, ...]
 */
async function apiGetAllStudents() {
    const res = await fetch(`${API_BASE}/api/students`);
    if (!res.ok) throw new Error(`Failed to load students (HTTP ${res.status})`);
    return res.json();
}

/**
 * Fetch analytics for a specific student.
 * GET /api/analysis/student/{studentId}
 * Returns: {studentId, studentName, averageMarks, weakSubjects,
 *           averageAttendance, riskLevel, totalSubjects}
 */
async function apiGetAnalysis(studentId) {
    const res = await fetch(`${API_BASE}/api/analysis/student/${studentId}`);
    if (!res.ok) throw new Error(`Failed to load analytics (HTTP ${res.status})`);
    return res.json();
}

/**
 * Request an AI study plan for a student.
 * POST /api/ai/recommendation/{studentId}
 * Returns: {studentId, studentName, riskLevel, averageMarks,
 *           averageAttendance, weakSubjects, recommendation, aiSource}
 */
async function apiGetRecommendation(studentId) {
    const res = await fetch(`${API_BASE}/api/ai/recommendation/${studentId}`, {
        method: 'POST'
    });
    if (!res.ok) throw new Error(`AI recommendation failed (HTTP ${res.status})`);
    return res.json();
}

// ============================================================
// 2. APP STATE — Central source of truth
// ============================================================

const state = {
    students:           [],     // [{id, name, email, course, year}]
    selectedId:         null,   // Dashboard/Analytics selected student ID
    analysis:           null,   // PerformanceAnalysisDTO for Dashboard student
    aiPlan:             null,   // AiRecommendationResponseDTO (Dashboard AI)
    aiLoading:          false,
    overviewLoaded:     false,
    selectedIdAnalytics: null,  // Analytics section selected student ID
    selectedIdAi:        null,  // AI Advisor section selected student ID
    aiPlanAdvisor:       null,  // AiRecommendationResponseDTO (AI Advisor section)
    currentSection:      'dashboard'
};

// ============================================================
// 3. DOM REFERENCES — Cache once, reuse often
// ============================================================

const dom = {
    // Topbar
    topbarTitle:     document.getElementById('topbar-title'),

    // Stats cards (Dashboard)
    statTotal:       document.getElementById('stat-total'),
    statAvgMarks:    document.getElementById('stat-avg-marks'),
    statAtRisk:      document.getElementById('stat-at-risk'),
    statAvgAtten:    document.getElementById('stat-avg-attendance'),

    // Dashboard: Selector
    studentSelect:   document.getElementById('student-select'),
    studentMini:     document.getElementById('student-mini'),
    miniName:        document.getElementById('mini-name'),
    miniMeta:        document.getElementById('mini-meta'),

    // Dashboard: Analytics panel
    analyticsPanel:       document.getElementById('analytics-panel'),
    analyticsPlaceholder: document.getElementById('analytics-placeholder'),
    analyticsContent:     document.getElementById('analytics-content'),
    metricMarks:          document.getElementById('metric-marks'),
    metricAtten:          document.getElementById('metric-attendance'),
    metricSubjects:       document.getElementById('metric-subjects'),
    progressMarks:        document.getElementById('progress-marks'),
    progressAtten:        document.getElementById('progress-atten'),
    pctMarks:             document.getElementById('pct-marks'),
    pctAtten:             document.getElementById('pct-atten'),
    riskBadge:            document.getElementById('risk-badge'),
    weakList:             document.getElementById('weak-list'),

    // Dashboard: AI section
    aiSection:       document.getElementById('ai-section'),
    btnAi:           document.getElementById('btn-ai'),
    aiResult:        document.getElementById('ai-result'),
    aiLoading:       document.getElementById('ai-loading'),
    aiPlanCard:      document.getElementById('ai-plan-card'),
    aiPlanText:      document.getElementById('ai-plan-text'),
    aiSourceBadge:   document.getElementById('ai-source-badge'),
    aiError:         document.getElementById('ai-error'),

    // Clock
    clock:           document.getElementById('topbar-time'),

    // Students section
    studentsTableWrap:   document.getElementById('students-table-wrap'),
    studentsCountBadge:  document.getElementById('students-count-badge'),

    // Analytics section (standalone)
    studentSelectAnalytics:    document.getElementById('student-select-analytics'),
    studentMiniAnalytics:      document.getElementById('student-mini-analytics'),
    miniNameAnalytics:         document.getElementById('mini-name-analytics'),
    miniMetaAnalytics:         document.getElementById('mini-meta-analytics'),
    analyticsPanel2:           document.getElementById('analytics-panel-2'),
    analyticsPlaceholder2:     document.getElementById('analytics-placeholder-2'),
    analyticsContent2:         document.getElementById('analytics-content-2'),
    metricMarks2:              document.getElementById('metric-marks-2'),
    metricAtten2:              document.getElementById('metric-attendance-2'),
    metricSubjects2:           document.getElementById('metric-subjects-2'),
    progressMarks2:            document.getElementById('progress-marks-2'),
    progressAtten2:            document.getElementById('progress-atten-2'),
    pctMarks2:                 document.getElementById('pct-marks-2'),
    pctAtten2:                 document.getElementById('pct-atten-2'),
    riskBadge2:                document.getElementById('risk-badge-2'),
    weakList2:                 document.getElementById('weak-list-2'),

    // AI Advisor section
    studentSelectAi:      document.getElementById('student-select-ai'),
    studentMiniAi:        document.getElementById('student-mini-ai'),
    miniNameAi:           document.getElementById('mini-name-ai'),
    miniMetaAi:           document.getElementById('mini-meta-ai'),
    btnAiAdvisor:         document.getElementById('btn-ai-advisor'),
    aiResultAdvisor:      document.getElementById('ai-result-advisor'),
    aiLoadingAdvisor:     document.getElementById('ai-loading-advisor'),
    aiPlanCardAdvisor:    document.getElementById('ai-plan-card-advisor'),
    aiPlanTextAdvisor:    document.getElementById('ai-plan-text-advisor'),
    aiSourceBadgeAdvisor: document.getElementById('ai-source-badge-advisor'),
    aiErrorAdvisor:       document.getElementById('ai-error-advisor')
};

// ============================================================
// 4. NAVIGATION — Section switching without page reload
// ============================================================

/**
 * Map of section id → topbar title text.
 */
const SECTION_TITLES = {
    'dashboard':  '📊 Student Performance Dashboard',
    'students':   '👥 All Students',
    'analytics':  '📈 Student Analytics',
    'ai-advisor': '✦ AI Study Plan Advisor',
    'settings':   '⚙ Settings'
};

/**
 * Switch the visible page section.
 * Hides all .page-section elements, shows the target one,
 * and updates the active state on the sidebar nav.
 *
 * @param {string} sectionId  - e.g. 'dashboard', 'students', 'analytics'
 */
function switchSection(sectionId) {
    // 1. Hide all sections
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.add('hidden');
    });

    // 2. Show the target section
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.remove('hidden');

    // 3. Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });

    // 4. Update topbar title
    if (dom.topbarTitle) {
        dom.topbarTitle.textContent = SECTION_TITLES[sectionId] || 'EduPulse';
    }

    // 5. Track current section
    state.currentSection = sectionId;

    // 6. Run section-specific setup the first time
    if (sectionId === 'students') {
        renderStudentsTable();
    }
}

// ============================================================
// 5. RENDER FUNCTIONS — Update DOM from state
// ============================================================

/** Show skeleton placeholders while stats are loading */
function renderStatsLoading() {
    [dom.statTotal, dom.statAvgMarks, dom.statAtRisk, dom.statAvgAtten].forEach(el => {
        el.innerHTML = '<span class="skeleton">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
    });
}

/**
 * Compute overview stats from all students' analyses and render.
 * Fetches analysis for each student to compute real aggregated numbers.
 */
async function renderOverviewStats(students) {
    if (state.overviewLoaded) return;
    renderStatsLoading();

    try {
        const analyses = await Promise.all(
            students.map(s => apiGetAnalysis(s.id).catch(() => null))
        );

        const valid    = analyses.filter(Boolean);
        const total    = students.length;
        const avgMarks = valid.length
            ? (valid.reduce((sum, a) => sum + a.averageMarks, 0) / valid.length).toFixed(1)
            : '—';
        const atRisk   = valid.filter(a => a.riskLevel === 'HIGH').length;
        const avgAtten = valid.length
            ? (valid.reduce((sum, a) => sum + a.averageAttendance, 0) / valid.length).toFixed(1)
            : '—';

        dom.statTotal.textContent    = total;
        dom.statAvgMarks.textContent = avgMarks !== '—' ? `${avgMarks}%` : '—';
        dom.statAtRisk.textContent   = atRisk;
        dom.statAvgAtten.textContent = avgAtten !== '—' ? `${avgAtten}%` : '—';

        state.overviewLoaded = true;
    } catch (err) {
        [dom.statTotal, dom.statAvgMarks, dom.statAtRisk, dom.statAvgAtten].forEach(el => {
            el.textContent = 'Error';
        });
        console.error('Overview stats error:', err);
    }
}

/**
 * Populate a <select> element with student options from state.students.
 * @param {HTMLSelectElement} selectEl
 */
function populateSelect(selectEl) {
    selectEl.innerHTML = '<option value="">— Select a student —</option>';
    state.students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.name} (${s.course}, Year ${s.year})`;
        selectEl.appendChild(opt);
    });
}

/** Populate all student dropdowns in the app */
function renderAllDropdowns() {
    populateSelect(dom.studentSelect);
    populateSelect(dom.studentSelectAnalytics);
    populateSelect(dom.studentSelectAi);
}

/** Show or hide a student mini-card */
function renderMiniCard(nameEl, metaEl, wrapEl, student) {
    if (!student) {
        wrapEl.classList.remove('visible');
        return;
    }
    nameEl.textContent = student.name;
    metaEl.innerHTML =
        `<span>📚 ${student.course}</span>` +
        `<span>🎓 Year ${student.year}</span>` +
        `<span>✉ ${student.email}</span>`;
    wrapEl.classList.add('visible');
}

// ---- Dashboard mini-card helper (original behaviour) ----
function renderStudentMini(student) {
    renderMiniCard(dom.miniName, dom.miniMeta, dom.studentMini, student);
}

/** Show the analytics placeholder (no student selected) — Dashboard */
function renderAnalyticsPlaceholder() {
    dom.analyticsPlaceholder.classList.remove('hidden');
    dom.analyticsContent.classList.add('hidden');
    dom.aiSection.classList.add('hidden');
}

/**
 * Generic analytics renderer — fills any set of analytics DOM elements.
 * Used for both Dashboard and Analytics section.
 */
function renderAnalyticsInto(analysis, els) {
    els.placeholder.classList.add('hidden');
    els.content.classList.remove('hidden');

    els.metricMarks.textContent    = `${analysis.averageMarks.toFixed(1)}%`;
    els.metricAtten.textContent    = `${analysis.averageAttendance.toFixed(1)}%`;
    els.metricSubjects.textContent = analysis.totalSubjects;

    els.progressMarks.style.width  = `${Math.min(100, analysis.averageMarks)}%`;
    els.progressAtten.style.width  = `${Math.min(100, analysis.averageAttendance)}%`;
    els.pctMarks.textContent       = `${analysis.averageMarks.toFixed(1)}%`;
    els.pctAtten.textContent       = `${analysis.averageAttendance.toFixed(1)}%`;

    const risk = (analysis.riskLevel || 'UNKNOWN').toUpperCase();
    els.riskBadge.textContent = riskLabel(risk);
    els.riskBadge.className   = `risk-badge ${risk}`;

    renderWeakSubjectsInto(els.weakList, analysis.weakSubjects);
}

/** Render analytics into the Dashboard panel */
function renderAnalytics(analysis) {
    renderAnalyticsInto(analysis, {
        placeholder:    dom.analyticsPlaceholder,
        content:        dom.analyticsContent,
        metricMarks:    dom.metricMarks,
        metricAtten:    dom.metricAtten,
        metricSubjects: dom.metricSubjects,
        progressMarks:  dom.progressMarks,
        progressAtten:  dom.progressAtten,
        pctMarks:       dom.pctMarks,
        pctAtten:       dom.pctAtten,
        riskBadge:      dom.riskBadge,
        weakList:       dom.weakList
    });
    dom.aiSection.classList.remove('hidden');
    resetAiPanel();
}

/** Render analytics into the standalone Analytics section panel */
function renderAnalytics2(analysis) {
    renderAnalyticsInto(analysis, {
        placeholder:    dom.analyticsPlaceholder2,
        content:        dom.analyticsContent2,
        metricMarks:    dom.metricMarks2,
        metricAtten:    dom.metricAtten2,
        metricSubjects: dom.metricSubjects2,
        progressMarks:  dom.progressMarks2,
        progressAtten:  dom.progressAtten2,
        pctMarks:       dom.pctMarks2,
        pctAtten:       dom.pctAtten2,
        riskBadge:      dom.riskBadge2,
        weakList:       dom.weakList2
    });
}

function riskLabel(risk) {
    const labels = { LOW: '✓ LOW RISK', MEDIUM: '⚡ MEDIUM RISK', HIGH: '✕ HIGH RISK' };
    return labels[risk] || risk;
}

function renderWeakSubjectsInto(container, subjects) {
    container.innerHTML = '';
    if (!subjects || subjects.length === 0) {
        container.innerHTML = '<div class="no-weak">No weak subjects identified. Excellent performance!</div>';
    } else {
        subjects.forEach(subj => {
            const tag = document.createElement('span');
            tag.className   = 'subject-tag';
            tag.textContent = subj;
            container.appendChild(tag);
        });
    }
}

function renderWeakSubjects(subjects) {
    renderWeakSubjectsInto(dom.weakList, subjects);
}

// ---- Students Table (Students section) ----

/**
 * Render the full students table from state.students.
 * Shows a loading state if students haven't loaded yet.
 */
function renderStudentsTable() {
    if (!state.students.length) {
        dom.studentsTableWrap.innerHTML =
            '<div class="analytics-placeholder"><div class="placeholder-icon">👥</div>' +
            '<p>No students loaded.</p></div>';
        return;
    }

    dom.studentsCountBadge.textContent = `${state.students.length} student${state.students.length !== 1 ? 's' : ''}`;

    const rows = state.students.map(s => `
      <tr>
        <td>${s.id}</td>
        <td><strong>${s.name}</strong></td>
        <td>${s.email}</td>
        <td>${s.course}</td>
        <td>Year ${s.year}</td>
      </tr>
    `).join('');

    dom.studentsTableWrap.innerHTML = `
      <table class="students-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Course</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
}

// ---- Dashboard AI Panel ----

function resetAiPanel() {
    state.aiPlan = null;
    dom.aiResult.classList.remove('visible');
    dom.aiLoading.classList.add('hidden');
    dom.aiPlanCard.classList.add('hidden');
    dom.aiError.classList.add('hidden');
    dom.btnAi.disabled = false;
    dom.btnAi.innerHTML = '<span class="btn-icon">✦</span> Generate AI Study Plan';
}

function renderAiLoading() {
    dom.aiResult.classList.add('visible');
    dom.aiLoading.classList.remove('hidden');
    dom.aiPlanCard.classList.add('hidden');
    dom.aiError.classList.add('hidden');
    dom.btnAi.disabled = true;
    dom.btnAi.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff;display:inline-block;border-radius:50%;animation:spin .7s linear infinite;"></span> Generating…';
}

function renderAiPlan(data) {
    dom.aiLoading.classList.add('hidden');
    dom.aiPlanCard.classList.remove('hidden');
    dom.aiError.classList.add('hidden');
    dom.aiPlanText.textContent    = data.recommendation;
    dom.aiSourceBadge.textContent = data.aiSource || 'AI Advisor';
    dom.btnAi.disabled = false;
    dom.btnAi.innerHTML = '<span class="btn-icon">✦</span> Regenerate Study Plan';
}

function renderAiError(message) {
    dom.aiLoading.classList.add('hidden');
    dom.aiPlanCard.classList.add('hidden');
    dom.aiError.classList.remove('hidden');
    dom.aiError.textContent = message;
    dom.btnAi.disabled = false;
    dom.btnAi.innerHTML = '<span class="btn-icon">✦</span> Generate AI Study Plan';
}

// ---- AI Advisor section ----

function resetAiAdvisorPanel() {
    state.aiPlanAdvisor = null;
    dom.aiResultAdvisor.classList.remove('visible');
    dom.aiLoadingAdvisor.classList.add('hidden');
    dom.aiPlanCardAdvisor.classList.add('hidden');
    dom.aiErrorAdvisor.classList.add('hidden');
    dom.btnAiAdvisor.disabled = false;
    dom.btnAiAdvisor.innerHTML = '<span class="btn-icon">✦</span> Generate AI Study Plan';
}

function renderAiLoadingAdvisor() {
    dom.aiResultAdvisor.classList.add('visible');
    dom.aiLoadingAdvisor.classList.remove('hidden');
    dom.aiPlanCardAdvisor.classList.add('hidden');
    dom.aiErrorAdvisor.classList.add('hidden');
    dom.btnAiAdvisor.disabled = true;
    dom.btnAiAdvisor.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:#fff;display:inline-block;border-radius:50%;animation:spin .7s linear infinite;"></span> Generating…';
}

function renderAiPlanAdvisor(data) {
    dom.aiLoadingAdvisor.classList.add('hidden');
    dom.aiPlanCardAdvisor.classList.remove('hidden');
    dom.aiErrorAdvisor.classList.add('hidden');
    dom.aiPlanTextAdvisor.textContent    = data.recommendation;
    dom.aiSourceBadgeAdvisor.textContent = data.aiSource || 'AI Advisor';
    dom.btnAiAdvisor.disabled = false;
    dom.btnAiAdvisor.innerHTML = '<span class="btn-icon">✦</span> Regenerate Study Plan';
}

function renderAiErrorAdvisor(message) {
    dom.aiLoadingAdvisor.classList.add('hidden');
    dom.aiPlanCardAdvisor.classList.add('hidden');
    dom.aiErrorAdvisor.classList.remove('hidden');
    dom.aiErrorAdvisor.textContent = message;
    dom.btnAiAdvisor.disabled = false;
    dom.btnAiAdvisor.innerHTML = '<span class="btn-icon">✦</span> Generate AI Study Plan';
}

// ============================================================
// 6. CLOCK
// ============================================================

function updateClock() {
    const now = new Date();
    dom.clock.textContent = now.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
}

// ============================================================
// 7. LOADING SPINNER HELPER (inline, reusable)
// ============================================================

function makeSpinnerMsg(text) {
    const div = document.createElement('div');
    div.className = 'analytics-placeholder';
    div.style.cssText = 'display:flex;gap:12px;align-items:center;justify-content:center;';
    div.innerHTML =
        '<div class="spinner" style="width:24px;height:24px;border-width:3px;' +
        'border-color:#e2e8f0;border-top-color:var(--primary);border-radius:50%;' +
        'animation:spin .7s linear infinite;"></div>' +
        `<span style="color:var(--text-secondary);font-size:.875rem">${text}</span>`;
    return div;
}

// ============================================================
// 8. EVENT HANDLERS
// ============================================================

/** Dashboard: student dropdown changed */
async function onStudentChange() {
    const id = dom.studentSelect.value;
    if (!id) {
        state.selectedId = null;
        state.analysis   = null;
        renderMiniCard(dom.miniName, dom.miniMeta, dom.studentMini, null);
        renderAnalyticsPlaceholder();
        return;
    }

    state.selectedId = Number(id);
    const student = state.students.find(s => s.id === state.selectedId);
    renderStudentMini(student);

    dom.analyticsPlaceholder.classList.add('hidden');
    dom.analyticsContent.classList.add('hidden');
    dom.aiSection.classList.add('hidden');

    const panelBody = dom.analyticsPanel.querySelector('.card-body');
    const tempMsg   = makeSpinnerMsg('Loading analytics…');
    panelBody.appendChild(tempMsg);

    try {
        const analysis   = await apiGetAnalysis(state.selectedId);
        state.analysis   = analysis;
        panelBody.removeChild(tempMsg);
        renderAnalytics(analysis);
    } catch (err) {
        panelBody.removeChild(tempMsg);
        dom.analyticsPlaceholder.classList.remove('hidden');
        dom.analyticsPlaceholder.innerHTML =
            `<div class="placeholder-icon">⚠</div>` +
            `<p>Could not load analytics for this student.<br><small>${err.message}</small></p>`;
        dom.analyticsContent.classList.add('hidden');
        dom.aiSection.classList.add('hidden');
    }
}

/** Dashboard: Generate AI Study Plan button */
async function onGenerateAi() {
    if (!state.selectedId) return;
    renderAiLoading();
    try {
        const data   = await apiGetRecommendation(state.selectedId);
        state.aiPlan = data;
        renderAiPlan(data);
    } catch (err) {
        renderAiError(`Unable to generate study plan. ${err.message}`);
    }
}

/** Analytics section: student dropdown changed */
async function onStudentChangeAnalytics() {
    const id = dom.studentSelectAnalytics.value;
    if (!id) {
        state.selectedIdAnalytics = null;
        renderMiniCard(dom.miniNameAnalytics, dom.miniMetaAnalytics, dom.studentMiniAnalytics, null);
        dom.analyticsPlaceholder2.classList.remove('hidden');
        dom.analyticsContent2.classList.add('hidden');
        dom.riskBadge2.className = 'risk-badge hidden';
        return;
    }

    state.selectedIdAnalytics = Number(id);
    const student = state.students.find(s => s.id === state.selectedIdAnalytics);
    renderMiniCard(dom.miniNameAnalytics, dom.miniMetaAnalytics, dom.studentMiniAnalytics, student);

    dom.analyticsPlaceholder2.classList.add('hidden');
    dom.analyticsContent2.classList.add('hidden');

    const panelBody = dom.analyticsPanel2.querySelector('.card-body');
    const tempMsg   = makeSpinnerMsg('Loading analytics…');
    panelBody.appendChild(tempMsg);

    try {
        const analysis = await apiGetAnalysis(state.selectedIdAnalytics);
        panelBody.removeChild(tempMsg);
        renderAnalytics2(analysis);
    } catch (err) {
        panelBody.removeChild(tempMsg);
        dom.analyticsPlaceholder2.classList.remove('hidden');
        dom.analyticsPlaceholder2.innerHTML =
            `<div class="placeholder-icon">⚠</div>` +
            `<p>Could not load analytics.<br><small>${err.message}</small></p>`;
        dom.analyticsContent2.classList.add('hidden');
    }
}

/** AI Advisor section: student dropdown changed */
function onStudentChangeAi() {
    const id = dom.studentSelectAi.value;
    if (!id) {
        state.selectedIdAi = null;
        renderMiniCard(dom.miniNameAi, dom.miniMetaAi, dom.studentMiniAi, null);
        resetAiAdvisorPanel();
        return;
    }
    state.selectedIdAi = Number(id);
    const student = state.students.find(s => s.id === state.selectedIdAi);
    renderMiniCard(dom.miniNameAi, dom.miniMetaAi, dom.studentMiniAi, student);
    resetAiAdvisorPanel();
}

/** AI Advisor section: Generate button clicked */
async function onGenerateAiAdvisor() {
    if (!state.selectedIdAi) {
        dom.aiErrorAdvisor.classList.remove('hidden');
        dom.aiResultAdvisor.classList.add('visible');
        dom.aiErrorAdvisor.textContent = 'Please select a student first.';
        return;
    }
    renderAiLoadingAdvisor();
    try {
        const data         = await apiGetRecommendation(state.selectedIdAi);
        state.aiPlanAdvisor = data;
        renderAiPlanAdvisor(data);
    } catch (err) {
        renderAiErrorAdvisor(`Unable to generate study plan. ${err.message}`);
    }
}

// ============================================================
// 9. INITIALISATION — Runs once on page load
// ============================================================

async function init() {
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);

    // Wire sidebar nav — section switching
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            switchSection(item.dataset.section);
        });
    });

    // Wire dropdown events
    dom.studentSelect.addEventListener('change', onStudentChange);
    dom.studentSelectAnalytics.addEventListener('change', onStudentChangeAnalytics);
    dom.studentSelectAi.addEventListener('change', onStudentChangeAi);

    // Wire AI buttons
    dom.btnAi.addEventListener('click', onGenerateAi);
    dom.btnAiAdvisor.addEventListener('click', onGenerateAiAdvisor);

    // Show default placeholder
    renderAnalyticsPlaceholder();

    // Load students from backend
    try {
        const students = await apiGetAllStudents();
        state.students = students;

        renderAllDropdowns();
        renderOverviewStats(students);   // async — fills in stats cards

    } catch (err) {
        [dom.statTotal, dom.statAvgMarks, dom.statAtRisk, dom.statAvgAtten].forEach(el => {
            el.textContent = 'N/A';
        });
        [dom.studentSelect, dom.studentSelectAnalytics, dom.studentSelectAi].forEach(sel => {
            sel.innerHTML = '<option value="">⚠ Could not load students</option>';
        });
        console.error('Initialisation failed:', err);
    }
}

// Boot the app when the DOM is ready
document.addEventListener('DOMContentLoaded', init);
