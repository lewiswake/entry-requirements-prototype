/* ==========================================================================
   PG ACADEMIC EDITOR | CORE LOGIC
   ========================================================================== */

// --- 1. STATE & CONFIG ---
const State = {
  db: [],
  activeIndex: -1,
  hasUnsavedChanges: false,
};

const CONFIG = {
  FLAGS_BASE_URL: "https://www.st-andrews.ac.uk/dpl/1.27.5/assets/core/images/flags",
  SPECIAL_FLAGS: {
    scot: "1f3f4-e0067-e0062-e0073-e0063-e0074-e007f",
    wales: "1f3f4-e0067-e0062-e0077-e006c-e0073-e007f",
    eng: "1f3f4-e0067-e0062-e0065-e006e-e0067-e007f",
    ni: "1f1ec-1f1e7",
    uk: "1f1ec-1f1e7",
  },
};

// --- 2. DOM CACHE ---
const DOM = {
  sidebarList: document.getElementById("sidebar-list"),
  sidebarSearch: document.getElementById("sidebar-search"),
  appSidebar: document.getElementById("app-sidebar"),
  sidebarOverlay: document.querySelector(".sidebar-overlay"),
  emptyState: document.getElementById("empty-state"),
  editorPanel: document.getElementById("editor-panel"),
  inputCountryName: document.getElementById("field-country-name"),
  inputCountryCode: document.getElementById("field-country-code"),
  qualContainer: document.getElementById("qualifications-container"),
  notification: document.getElementById("notification"),
};


// --- 3. INITIALIZATION ---
function initApp() {
  const savedDraft = localStorage.getItem("pg_draft_db");

  if (savedDraft) {
    State.db = JSON.parse(savedDraft);
    State.hasUnsavedChanges = true;
    renderSidebar();
    showToast('<span class="toast-icon">📝</span> Recovered unsaved draft');
  } else {
    fetch("data/pg_requirements.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not find json file.");
        return res.json();
      })
      .then((data) => {
        State.db = data;
        renderSidebar();
      })
      .catch((err) => {
        console.error("Error loading JSON", err);
        DOM.emptyState.innerHTML = `<div class="empty-icon error-icon">⚠️</div><h2>Error Loading Data</h2><p>Could not load data/pg_requirements.json.</p>`;
      });
  }
}

// Boot up the app
document.addEventListener("DOMContentLoaded", initApp);


// --- 4. RENDER LOGIC ---
function renderSidebar() {
  // Use map and join for much faster DOM injection
  DOM.sidebarList.innerHTML = State.db.map((item, index) => {
    const flagPath = getFlagPath(item.code);
    const imgHtml = flagPath 
      ? `<img src="${flagPath}" class="profile-flag" alt="" onerror="this.classList.add('hidden');">` 
      : "";

    return `
      <div class="profile-item ${index === State.activeIndex ? "active" : ""}" data-index="${index}">
        <div class="profile-item-header">
          ${imgHtml}
          <span class="profile-country-name">${item.country || "Unnamed Country"}</span>
        </div>
        <span class="profile-country-code ${flagPath ? "has-flag" : ""}">${item.code || "N/A"}</span>
      </div>
    `;
  }).join("");

  filterSidebar();
}

function loadEditor(index) {
  State.activeIndex = index;
  const countryData = State.db[index];

  DOM.emptyState.classList.add("hidden");
  DOM.editorPanel.classList.remove("hidden");

  // Highlight active sidebar item visually
  document.querySelectorAll('.profile-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`.profile-item[data-index="${index}"]`)?.classList.add('active');

  // Populate Fields
  DOM.inputCountryName.value = countryData.country || "";
  DOM.inputCountryCode.value = countryData.code || "";

  // Data safety checks
  if (!countryData.postgraduate) countryData.postgraduate = {};
  if (!countryData.postgraduate.qualifications) countryData.postgraduate.qualifications = [];

  renderQualifications();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQualifications() {
  const countryData = State.db[State.activeIndex];

  if (countryData.postgraduate.qualifications.length === 0) {
    DOM.qualContainer.innerHTML = `<p class="empty-qualifications">No postgraduate qualifications added for this country yet.</p>`;
    return;
  }

  // Using HTML5 data-attributes to bind indices instead of inline functions
  DOM.qualContainer.innerHTML = countryData.postgraduate.qualifications.map((qual, i) => `
    <div class="test-card">
      <div class="test-title-row">
          <div class="qual-title-wrapper">
              <input type="text" class="cms-test-title" data-index="${i}" data-field="name" 
                  value="${qual.name || ""}" placeholder="Qualification Name (e.g. Master's Degree)">
          </div>
          <button class="btn-delete-test" data-index="${i}">✖ Remove</button>
      </div>
      <div>
          <label class="modern-label">Grades / Details</label>
          <textarea class="modern-textarea" rows="2" data-index="${i}" data-field="detail" 
              placeholder="e.g. Min grade 85% or GPA 3.5/4.0">${qual.detail || ""}</textarea>
      </div>
    </div>
  `).join("");
}


// --- 5. EVENT LISTENERS & DELEGATION ---

// Unsaved changes warning
window.addEventListener("beforeunload", (e) => {
  if (State.hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = ""; 
  }
});

// Sidebar Click Delegation
DOM.sidebarList.addEventListener("click", (e) => {
  const item = e.target.closest(".profile-item");
  if (!item) return;
  
  loadEditor(parseInt(item.dataset.index, 10));
  if (window.innerWidth < 992) toggleSidebar();
});

// Sidebar Search (Using 'input' instead of 'keyup' for better paste support)
DOM.sidebarSearch?.addEventListener("input", filterSidebar);

// Top-level Country Metadata Inputs
DOM.inputCountryName.addEventListener("input", (e) => {
  State.db[State.activeIndex].country = e.target.value;
  markUnsaved();

  const activeItem = document.querySelector(".profile-item.active .profile-country-name");
  if (activeItem) activeItem.textContent = e.target.value || "Unnamed Country";
});

DOM.inputCountryCode.addEventListener("input", (e) => {
  const newCode = e.target.value.toLowerCase();
  State.db[State.activeIndex].code = newCode;
  markUnsaved();

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
        renderSidebar(); // Rebuild if adding a flag to a previously flag-less item
      }
      codeSpan.classList.add("has-flag");
    } else {
      if (flagImg) flagImg.classList.add("hidden");
      codeSpan.classList.remove("has-flag");
    }
  }
});

// Qualifications Delegation (Handles inputs AND deletes in one listener)
DOM.qualContainer.addEventListener("input", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    const index = e.target.dataset.index;
    const field = e.target.dataset.field;
    State.db[State.activeIndex].postgraduate.qualifications[index][field] = e.target.value;
    markUnsaved();
  }
});

DOM.qualContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete-test")) {
    const index = parseInt(e.target.dataset.index, 10);
    removeQual(index);
  }
});


// --- 6. ACTIONS (Exposed to global window for HTML buttons) ---

window.toggleSidebar = function() {
  DOM.appSidebar.classList.toggle("open");
  DOM.sidebarOverlay.classList.toggle("open");
};

window.addCountry = function() {
  State.db.unshift({
    code: "new",
    country: "New Country",
    postgraduate: { qualifications: [] },
  });
  markUnsaved();
  loadEditor(0);
  if (window.innerWidth < 992) window.toggleSidebar();
};

window.deleteCountry = function() {
  if (confirm("Are you sure you want to delete this entire country profile?")) {
    State.db.splice(State.activeIndex, 1);
    State.activeIndex = -1;
    markUnsaved();
    DOM.editorPanel.classList.add("hidden");
    DOM.emptyState.classList.remove("hidden");
    renderSidebar();
  }
};

window.addQualification = function() {
  State.db[State.activeIndex].postgraduate.qualifications.unshift({
    name: "New Qualification",
    detail: "",
  });
  markUnsaved();
  renderQualifications();
};

window.saveJSON = function() {
  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const blob = new Blob([JSON.stringify(State.db, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `pg_requirements-${timestamp}.json`;
  a.click();
  
  URL.revokeObjectURL(url);

  State.hasUnsavedChanges = false;
  localStorage.removeItem("pg_draft_db");
  showToast('<span class="toast-icon">✓</span> Database saved successfully');
};


// --- 7. UTILITIES ---

function filterSidebar() {
  const term = DOM.sidebarSearch?.value.toLowerCase() || "";
  const items = document.querySelectorAll(".profile-item");

  items.forEach((item, index) => {
    const countryName = (State.db[index].country || "").toLowerCase();
    const countryCode = (State.db[index].code || "").toLowerCase();
    
    item.classList.toggle("hidden", !(countryName.includes(term) || countryCode.includes(term)));
  });
}

function removeQual(index) {
  if (confirm("Remove this qualification?")) {
    State.db[State.activeIndex].postgraduate.qualifications.splice(index, 1);
    markUnsaved();
    renderQualifications();
  }
}

function markUnsaved() {
  State.hasUnsavedChanges = true;
  localStorage.setItem("pg_draft_db", JSON.stringify(State.db));
}

function showToast(message) {
  DOM.notification.innerHTML = message;
  DOM.notification.classList.add("show");
  setTimeout(() => DOM.notification.classList.remove("show"), 3000);
}

function getFlagPath(code) {
  if (!code) return "";
  const lowerCode = code.toLowerCase();

  if (CONFIG.SPECIAL_FLAGS[lowerCode]) {
    return `${CONFIG.FLAGS_BASE_URL}/${CONFIG.SPECIAL_FLAGS[lowerCode]}.svg`;
  }

  const main = code.split("-")[0].toUpperCase();
  if (main.length === 2) {
    const hexCode = main.split("").map((c) => (c.charCodeAt(0) + 127397).toString(16)).join("-");
    return `${CONFIG.FLAGS_BASE_URL}/${hexCode}.svg`;
  }

  return null;
}
