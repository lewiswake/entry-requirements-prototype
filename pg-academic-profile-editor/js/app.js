let db = [];
let activeIndex = -1;
let hasUnsavedChanges = false;

// --- FLAG HELPER ---
function getFlagPath(code) {
  if (!code) return "";

  const baseUrl =
    "https://www.st-andrews.ac.uk/dpl/1.27.5/assets/core/images/flags";

  const special = {
    scot: "1f3f4-e0067-e0062-e0073-e0063-e0074-e007f",
    wales: "1f3f4-e0067-e0062-e0077-e006c-e0073-e007f",
    eng: "1f3f4-e0067-e0062-e0065-e006e-e0067-e007f",
    ni: "1f1ec-1f1e7",
    uk: "1f1ec-1f1e7",
  };

  if (special[code.toLowerCase()])
    return `${baseUrl}/${special[code.toLowerCase()]}.svg`;

  const main = code.split("-")[0].toUpperCase();
  if (main.length === 2)
    return `${baseUrl}/${main
      .split("")
      .map((c) => (c.charCodeAt(0) + 127397).toString(16))
      .join("-")}.svg`;

  return null;
}

// --- NOTIFICATION HELPER ---
function showToast(message) {
  const note = document.getElementById("notification");
  note.innerHTML = message;
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 3000);
}

// --- AUTOSAVE & UNSAVED CHANGES ---
window.addEventListener("beforeunload", (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = ""; // Triggers the browser's default warning prompt
  }
});

function markUnsaved() {
  hasUnsavedChanges = true;
  // Autosave to local storage so progress isn't lost if the browser crashes
  localStorage.setItem("pg_draft_db", JSON.stringify(db));
}

// 1. Initialize
function initApp() {
  const savedDraft = localStorage.getItem("pg_draft_db");

  if (savedDraft) {
    // Load from local storage if a draft exists
    db = JSON.parse(savedDraft);
    hasUnsavedChanges = true;
    renderSidebar();
    showToast('<span class="toast-icon">📝</span> Recovered unsaved draft');
  } else {
    // Otherwise, load fresh from the server
    fetch("data/pg_requirements.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not find json file.");
        return res.json();
      })
      .then((data) => {
        db = data;
        renderSidebar();
      })
      .catch((err) => {
        console.error("Error loading JSON", err);
        document.getElementById("empty-state").innerHTML =
          `<div class="empty-icon error-icon">⚠️</div><h2>Error Loading Data</h2><p>Could not load data/pg_requirements.json.</p>`;
      });
  }
}

// Call init on load
initApp();

function toggleSidebar() {
  document.getElementById("app-sidebar").classList.toggle("open");
  document.querySelector(".sidebar-overlay").classList.toggle("open");
}

// 2. Render Sidebar with Flags
function renderSidebar() {
  const list = document.getElementById("sidebar-list");
  list.innerHTML = "";

  db.forEach((item, index) => {
    const flagPath = getFlagPath(item.code);
    const imgHtml = flagPath
      ? `<img src="${flagPath}" class="profile-flag" alt="" onerror="this.classList.add('hidden');">`
      : "";

    const div = document.createElement("div");
    div.className = `profile-item ${index === activeIndex ? "active" : ""}`;
    div.innerHTML = `
      <div class="profile-item-header">
        ${imgHtml}
        <span class="profile-country-name">${item.country || "Unnamed Country"}</span>
      </div>
      <span class="profile-country-code ${flagPath ? "has-flag" : ""}">${item.code || "N/A"}</span>
    `;

    div.onclick = () => {
      loadEditor(index);
      if (window.innerWidth < 992) toggleSidebar();
    };
    list.appendChild(div);
  });

  // Re-apply filter if a search term is active
  filterSidebar();
}

// Sidebar Search Filter
function filterSidebar() {
  const term =
    document.getElementById("sidebar-search")?.value.toLowerCase() || "";
  const items = document.querySelectorAll(".profile-item");

  items.forEach((item, index) => {
    const countryName = (db[index].country || "").toLowerCase();
    const countryCode = (db[index].code || "").toLowerCase();

    if (countryName.includes(term) || countryCode.includes(term)) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
}

// 3. Load Editor
function loadEditor(index) {
  activeIndex = index;
  const countryData = db[index];

  document.getElementById("empty-state").classList.add("hidden");
  document.getElementById("editor-panel").classList.remove("hidden");

  renderSidebar();

  document.getElementById("field-country-name").value =
    countryData.country || "";
  document.getElementById("field-country-code").value = countryData.code || "";

  // Ensure nested objects exist to prevent errors
  if (!countryData.postgraduate) countryData.postgraduate = {};
  if (!countryData.postgraduate.qualifications)
    countryData.postgraduate.qualifications = [];

  renderQualifications();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 4. Update Country Metadata (Optimized - No full re-render)
document.getElementById("field-country-name").addEventListener("input", (e) => {
  db[activeIndex].country = e.target.value;
  markUnsaved(); // Triggers autosave

  const activeItem = document.querySelector(
    ".profile-item.active .profile-country-name",
  );
  if (activeItem) activeItem.textContent = e.target.value || "Unnamed Country";
});

document.getElementById("field-country-code").addEventListener("input", (e) => {
  const newCode = e.target.value.toLowerCase();
  db[activeIndex].code = newCode;
  markUnsaved(); // Triggers autosave

  const activeItem = document.querySelector(".profile-item.active");
  if (activeItem) {
    const codeSpan = activeItem.querySelector(".profile-country-code");
    codeSpan.textContent = newCode || "N/A";

    const flagImg = activeItem.querySelector("img");
    const newFlagPath = getFlagPath(newCode);

    if (newFlagPath) {
      if (flagImg) {
        flagImg.src = newFlagPath;
        flagImg.classList.remove("hidden");
      } else {
        renderSidebar();
      }
      codeSpan.classList.add("has-flag");
    } else {
      if (flagImg) flagImg.classList.add("hidden");
      codeSpan.classList.remove("has-flag");
    }
  }
});

// 5. Render Qualifications (Cards)
function renderQualifications() {
  const container = document.getElementById("qualifications-container");
  container.innerHTML = "";
  const countryData = db[activeIndex];

  if (countryData.postgraduate.qualifications.length === 0) {
    container.innerHTML = `<p class="empty-qualifications">No postgraduate qualifications added for this country yet.</p>`;
    return;
  }

  countryData.postgraduate.qualifications.forEach((qual, i) => {
    const card = document.createElement("div");
    card.className = "test-card";

    card.innerHTML = `
      <div class="test-title-row">
          <div class="qual-title-wrapper">
              <input type="text" class="cms-test-title" 
                  value="${qual.name || ""}" placeholder="Qualification Name (e.g. Master's Degree)" 
                  onchange="updateQual(${i}, 'name', this.value)">
          </div>
          <button class="btn-delete-test" onclick="removeQual(${i})">✖ Remove</button>
      </div>

      <div>
          <label class="modern-label">Grades / Details</label>
          <textarea class="modern-textarea" rows="2" placeholder="e.g. Min grade 85% or GPA 3.5/4.0" 
              onchange="updateQual(${i}, 'detail', this.value)">${qual.detail || ""}</textarea>
      </div>
    `;

    container.appendChild(card);
  });
}

function updateQual(index, field, value) {
  db[activeIndex].postgraduate.qualifications[index][field] = value;
  markUnsaved();
}

function addQualification() {
  db[activeIndex].postgraduate.qualifications.unshift({
    name: "New Qualification",
    detail: "",
  });
  markUnsaved();
  renderQualifications();
}

function removeQual(index) {
  if (confirm("Remove this qualification?")) {
    db[activeIndex].postgraduate.qualifications.splice(index, 1);
    markUnsaved();
    renderQualifications();
  }
}

// 6. Global Actions
function addCountry() {
  db.unshift({
    code: "new",
    country: "New Country",
    postgraduate: { qualifications: [] },
  });
  markUnsaved();
  loadEditor(0);
  if (window.innerWidth < 992) toggleSidebar();
}

function deleteCountry() {
  if (confirm("Are you sure you want to delete this entire country profile?")) {
    db.splice(activeIndex, 1);
    activeIndex = -1;
    markUnsaved();
    document.getElementById("editor-panel").classList.add("hidden");
    document.getElementById("empty-state").classList.remove("hidden");
    renderSidebar();
  }
}

function saveJSON() {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

  const blob = new Blob([JSON.stringify(db, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pg_requirements-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // Clear the unsaved changes warning and the draft since we just saved
  hasUnsavedChanges = false;
  localStorage.removeItem("pg_draft_db");

  showToast('<span class="toast-icon">✓</span> Database saved successfully');
}
