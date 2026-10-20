const CATEGORIES = ["Infrastructure","Accommodation","Finance","Student Relations","Health","Academics","Sports"];
const STORAGE_KEY = "bacConnectReportsV1";
const FEEDBACK_KEY = "bacConnectFeedbackV1";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let currentRole = "Student";
let selectedFile = null;
let toastTimer;

function readStorage(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { showToast("Browser storage is unavailable. Your changes may not persist."); }
}
function seedReports() {
  const existing = readStorage(STORAGE_KEY, null);
  if (existing) return existing;
  const samples = [
    {id:"BAC-1001",title:"Lights not working in Block B",category:"Infrastructure",details:"Several lights in the second-floor corridor are not working, making it difficult to see in the evening.",location:"Block B, second floor",reporter:"Student",email:"",format:"Flash card",status:"Under review",response:"The issue has been received and referred for inspection.",createdAt:new Date(Date.now()-86400000*2).toISOString(),feedback:[]},
    {id:"BAC-1002",title:"Request for clearer assessment timetable",category:"Academics",details:"Students would appreciate earlier updates when assessment dates change.",location:"Academic office",reporter:"Student",email:"",format:"Formal letter",status:"In progress",response:"The academic team is reviewing the communication process.",createdAt:new Date(Date.now()-86400000*4).toISOString(),feedback:[]},
    {id:"BAC-1003",title:"Sports equipment maintenance",category:"Sports",details:"Some shared training equipment needs checking before the next practice session.",location:"Sports area",reporter:"Student",email:"",format:"Flash card",status:"Submitted",response:"",createdAt:new Date(Date.now()-3600000*8).toISOString(),feedback:[]}
  ];
  saveStorage(STORAGE_KEY, samples);
  return samples;
}
let reports = seedReports();
function persistReports() { saveStorage(STORAGE_KEY, reports); }
function escapeHTML(value="") {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}
function formatDate(iso) {
  try { return new Intl.DateTimeFormat(undefined,{day:"numeric",month:"short",year:"numeric"}).format(new Date(iso)); }
  catch { return "Recently"; }
}
function statusClass(status) {
  return ({"Submitted":"status-submitted","Under review":"status-review","In progress":"status-progress","Resolved":"status-resolved"})[status] || "status-submitted";
}
function referenceId() { return "BAC-" + String(Math.floor(1000 + Math.random()*9000)); }

function renderReports() {
  const query = ($("#reportSearch").value || "").trim().toLowerCase();
  const list = $("#reportsList");
  const visible = reports.filter(report => {
    const matchesQuery = [report.id,report.title,report.category,report.details,report.location,report.status].join(" ").toLowerCase().includes(query);
    // This demo keeps all reports visible to illustrate the shared workflow.
    return matchesQuery;
  }).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
  $("#roleDescription").textContent = currentRole === "Student"
    ? "Student view: view submitted reports and check their status."
    : currentRole === "SRC"
      ? "SRC view: review reports and update their status as you follow up."
      : "School Management view: update progress and add an official response.";
  list.innerHTML = visible.map(report => {
    const canManage = currentRole === "SRC" || currentRole === "Management";
    const response = report.response ? `<div class="response-box"><strong>${currentRole === "Management" ? "Management response" : "Latest response"}</strong>${escapeHTML(report.response)}</div>` : "";
    const statusEditor = canManage ? `<label class="sr-only" for="status-${report.id}">Update status for ${escapeHTML(report.title)}</label><select class="status-select" id="status-${report.id}" data-status-id="${report.id}"><option ${report.status==="Submitted"?"selected":""}>Submitted</option><option ${report.status==="Under review"?"selected":""}>Under review</option><option ${report.status==="In progress"?"selected":""}>In progress</option><option ${report.status==="Resolved"?"selected":""}>Resolved</option></select>` : `<span class="status-pill ${statusClass(report.status)}">${escapeHTML(report.status)}</span>`;
    const responseEditor = currentRole === "Management" ? `<div class="response-edit"><input type="text" maxlength="500" id="response-${report.id}" placeholder="Write an official response..." value="${escapeHTML(report.response || "")}" aria-label="Management response for ${escapeHTML(report.title)}" /><button type="button" data-response-id="${report.id}">Save response</button></div>` : "";
    return `<article class="report-row"><div class="report-main"><div class="report-meta"><span class="ref-tag">${escapeHTML(report.id)}</span><span class="category-tag">${escapeHTML(report.category)}</span><span class="category-tag">· ${formatDate(report.createdAt)}</span></div><h3>${escapeHTML(report.title)}</h3><p>${escapeHTML(report.details)}</p><div class="report-extra">${report.location ? "Location: "+escapeHTML(report.location)+" · " : ""}Format: ${escapeHTML(report.format || "Flash card")}${report.fileName ? " · Attachment: "+escapeHTML(report.fileName) : ""}</div>${response}${responseEditor}</div><div class="report-actions">${statusEditor}</div></article>`;
  }).join("");
  $("#emptyState").hidden = visible.length !== 0;
  updateFeedbackOptions();
}
function updateFeedbackOptions() {
  const select = $("#feedbackReport");
  const old = select.value;
  select.innerHTML = '<option value="">Choose a report (optional)</option>' + reports.map(r => `<option value="${escapeHTML(r.id)}">${escapeHTML(r.id)} — ${escapeHTML(r.title)}</option>`).join("");
  if (reports.some(r => r.id === old)) select.value = old;
}

$("#menuToggle").addEventListener("click", () => {
  const nav = $("#mainNav");
  const open = nav.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
});
$$(".nav-link").forEach(link => link.addEventListener("click", () => {
  $$(".nav-link").forEach(item => item.classList.remove("active"));
  link.classList.add("active");
  $("#mainNav").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded","false");
}));
$$(".category-card").forEach(card => card.addEventListener("click", () => {
  $$(".category-card").forEach(item => item.classList.remove("selected"));
  card.classList.add("selected");
  $("#reportCategory").value = card.dataset.category;
  $("#report").scrollIntoView({behavior:"smooth"});
  $("#reportTitle").focus({preventScroll:true});
}));
$("#userRole").addEventListener("change", event => {
  currentRole = event.target.value;
  renderReports();
  showToast(`${currentRole} view selected.`);
});
$("#reportDetails").addEventListener("input", event => {
  $("#charCount").textContent = `${event.target.value.length} / 3000`;
});
$("#reportFile").addEventListener("change", event => {
  const file = event.target.files[0];
  const fileName = $("#fileName");
  selectedFile = null;
  if (!file) { fileName.textContent = "No file selected"; return; }
  const allowedExtensions = /\.(pdf|doc|docx)$/i;
  if (!allowedExtensions.test(file.name)) {
    event.target.value = "";
    fileName.textContent = "Unsupported file type";
    showToast("Please select a PDF, DOC, or DOCX file.");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    event.target.value = "";
    fileName.textContent = "File is larger than 5 MB";
    showToast("Please choose a file smaller than 5 MB.");
    return;
  }
  selectedFile = file;
  fileName.textContent = `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
});

$("#reportForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const title = $("#reportTitle").value.trim();
  const details = $("#reportDetails").value.trim();
  const category = $("#reportCategory").value;
  if (!title || !details || !CATEGORIES.includes(category)) {
    setMessage($("#formMessage"), "Please complete the required fields.", "error");
    return;
  }
  const report = {
    id: referenceId(), title, details, category,
    location: $("#reportLocation").value.trim(),
    reporter: $("#reportName").value.trim() || currentRole,
    email: $("#reportEmail").value.trim(),
    format: form.querySelector('input[name="format"]:checked').value,
    fileName: selectedFile ? selectedFile.name : "",
    // File contents are intentionally not saved; this front-end demo has no server.
    status: "Submitted", response: "", createdAt: new Date().toISOString(), feedback: []
  };
  reports.unshift(report);
  persistReports();
  renderReports();
  setMessage($("#formMessage"), `Thank you. Your report reference is ${report.id}. Save this reference to follow up.`, "success");
  form.reset();
  selectedFile = null;
  $("#fileName").textContent = "No file selected";
  $("#charCount").textContent = "0 / 3000";
  $$(".category-card").forEach(item => item.classList.remove("selected"));
  showToast("Report added to this browser demo.");
  $("#my-reports").scrollIntoView({behavior:"smooth"});
});
function setMessage(element, text, kind) {
  element.textContent = text;
  element.className = `form-message ${kind}`;
}

$("#reportSearch").addEventListener("input", renderReports);
$("#reportsList").addEventListener("change", event => {
  const id = event.target.dataset.statusId;
  if (!id) return;
  const report = reports.find(item => item.id === id);
  if (!report || !["SRC","Management"].includes(currentRole)) return;
  report.status = event.target.value;
  if (report.status === "Resolved" && !report.response) report.response = "This report has been marked as resolved.";
  persistReports();
  renderReports();
  showToast(`Status updated for ${id}.`);
});
$("#reportsList").addEventListener("click", event => {
  const id = event.target.dataset.responseId;
  if (!id) return;
  if (currentRole !== "Management") { showToast("Switch to School Management to add an official response."); return; }
  const report = reports.find(item => item.id === id);
  const response = $(`#response-${id}`).value.trim();
  if (!response) { showToast("Please write a response before saving."); return; }
  report.response = response;
  persistReports();
  renderReports();
  showToast(`Response saved for ${id}.`);
});
$("#feedbackForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const rating = form.querySelector('input[name="rating"]:checked');
  const message = $("#feedbackMessage").value.trim();
  if (!rating || !message) {
    setMessage($("#feedbackMessageStatus"), "Please choose a rating and enter your comments.", "error");
    return;
  }
  const feedback = readStorage(FEEDBACK_KEY, []);
  feedback.push({reportId:$("#feedbackReport").value, rating:Number(rating.value), message, createdAt:new Date().toISOString()});
  saveStorage(FEEDBACK_KEY, feedback);
  setMessage($("#feedbackMessageStatus"), "Thank you for your feedback. It has been saved in this browser demo.", "success");
  form.reset();
  showToast("Feedback recorded in this browser demo.");
});
renderReports();
