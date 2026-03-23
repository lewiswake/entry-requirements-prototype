/* ==========================================================================
   ENGLISH PROFILES EDITOR | CORE LOGIC
   ========================================================================== */

// --- 1. STATE & CONFIG ---
const State = {
  db: [],
  activeIndex: -1,
  hasUnsavedChanges: false,
};

const CONFIG = {
  variantCategories: {
    d: "Direct Entry",
    o: "Online",
    s: "SELT (UKVI)",
    m: "Medicine",
    tables: "Reference Tables",
  },
  variantOrder: ["d", "o", "s", "m", "tables"],
};

// --- 2. DOM CACHE ---
const DOM = {
  sidebarList: document.getElementById("sidebar-list"),
  sidebarSearch: document.getElementById("sidebar-search"),
  appSidebar: document.getElementById("app-sidebar"),
  sidebarOverlay: document.querySelector(".sidebar-overlay"),
  emptyState: document.getElementById("empty-state"),
  editorPanel: document.getElementById("editor-panel"),
  inputId: document.getElementById("field-id"),
  inputVariant: document.getElementById("field-variant"),
  inputLabel: document.getElementById("field-label"),
  testsContainer: document.getElementById("tests-container"),
  notification: document.getElementById("notification"),
};

// --- 3. INITIALIZATION ---
function initApp() {
  const savedDraft = localStorage.getItem("english_draft_db");

  if (savedDraft) {
    State.db = JSON.parse(savedDraft);
    State.hasUnsavedChanges = true;
    renderSidebar();
    showToast('<span class="toast-icon">📝</span> Recovered unsaved draft');
  } else {
    fetch("data/english-profiles.json")
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
        DOM.emptyState.innerHTML = `<div class="empty-icon error-icon">⚠️</div><h2>Error Loading Data</h2><p>Could not load data/english-profiles.json. Check console.</p>`;
      });
  }
}

document.addEventListener("DOMContentLoaded", initApp);

// --- 4. RENDER LOGIC ---
function renderSidebar() {
  const grouped = {};

  // Group items by variant and track original indices
  State.db.forEach((p, index) => {
    const variant = p.variant || "tables";
    if (!grouped[variant]) grouped[variant] = [];
    grouped[variant].push({ ...p, originalIndex: index });
  });

  let htmlString = "";

  CONFIG.variantOrder.forEach((variantKey) => {
    if (grouped[variantKey] && grouped[variantKey].length > 0) {
      const categoryName = CONFIG.variantCategories[variantKey] || variantKey;
      htmlString += `<div class="category-header">${categoryName}</div>`;

      // Sort items logically within their group based on numeric ID
      grouped[variantKey]
        .sort((a, b) => {
          const numA = parseInt((a.id || "").match(/\d+/)) || 999;
          const numB = parseInt((b.id || "").match(/\d+/)) || 999;
          return numA - numB;
        })
        .forEach((p) => {
          const isActive =
            p.originalIndex === State.activeIndex ? "active" : "";
          htmlString += `
            <div class="profile-item ${isActive}" data-index="${p.originalIndex}">
              <span class="profile-code">${(p.id || "NEW").toUpperCase()}</span>
              <span class="profile-label">${p.label || "Unnamed Profile"}</span>
            </div>
          `;
        });
    }
  });

  DOM.sidebarList.innerHTML = htmlString;
  filterSidebar();
}

function loadEditor(index) {
  State.activeIndex = index;
  const data = State.db[index];

  DOM.emptyState.classList.add("hidden");
  DOM.editorPanel.classList.remove("hidden");

  // Highlight active sidebar item
  document
    .querySelectorAll(".profile-item")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelector(`.profile-item[data-index="${index}"]`)
    ?.classList.add("active");

  // Populate Fields
  DOM.inputId.value = data.id || "";
  DOM.inputVariant.value = data.variant || "tables";
  DOM.inputLabel.value = data.label || "";

  renderTests();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTests() {
  const data = State.db[State.activeIndex];

  // Data safety initialization
  if (!data.tests_undergraduate) data.tests_undergraduate = [];
  if (!data.tests_postgraduate) data.tests_postgraduate = [];
  if (!data.tests_general) data.tests_general = [];

  let htmlString = "";

  if (data.variant === "d") {
    htmlString += buildTestGroupHTML(
      "🎓 Undergraduate Requirements",
      "tests_undergraduate",
      data.tests_undergraduate,
    );
    htmlString += buildTestGroupHTML(
      "🎓 Postgraduate Requirements",
      "tests_postgraduate",
      data.tests_postgraduate,
    );
  } else {
    htmlString += buildTestGroupHTML(
      "📝 General Requirements",
      "tests_general",
      data.tests_general,
    );
  }

  DOM.testsContainer.innerHTML = htmlString;
}

function buildTestGroupHTML(title, arrayName, testsArray) {
  let sectionHTML = `
    <div>
      <div class="section-title">
          <span>${title}</span>
          <button class="btn-add-sm" data-action="add" data-array="${arrayName}">+ Add Test</button>
      </div>
  `;

  if (testsArray.length === 0) {
    sectionHTML += `<p class="empty-tests">No tests added to this section yet.</p></div>`;
    return sectionHTML;
  }

  const cardsHTML = testsArray
    .map(
      (t, i) => `
    <div class="test-card">
      <div class="test-title-row">
          <div class="test-title-wrapper">
              <input type="text" class="cms-test-title" data-array="${arrayName}" data-index="${i}" data-field="name" 
                  value="${t.name || ""}" placeholder="Test Name (e.g. IELTS Academic)">
          </div>
          <button class="btn-delete-test" data-action="remove" data-array="${arrayName}" data-index="${i}">✖ Remove</button>
      </div>
      <div class="score-grid">
          <div>
              <label class="modern-label">Overall</label>
              <input type="text" class="modern-input" data-array="${arrayName}" data-index="${i}" data-field="overall" value="${t.overall || ""}">
          </div>
          <div>
              <label class="modern-label">Listening</label>
              <input type="text" class="modern-input" data-array="${arrayName}" data-index="${i}" data-field="listening" value="${t.listening || ""}">
          </div>
          <div>
              <label class="modern-label">Reading</label>
              <input type="text" class="modern-input" data-array="${arrayName}" data-index="${i}" data-field="reading" value="${t.reading || ""}">
          </div>
          <div>
              <label class="modern-label">Writing</label>
              <input type="text" class="modern-input" data-array="${arrayName}" data-index="${i}" data-field="writing" value="${t.writing || ""}">
          </div>
          <div>
              <label class="modern-label">Speaking</label>
              <input type="text" class="modern-input" data-array="${arrayName}" data-index="${i}" data-field="speaking" value="${t.speaking || ""}">
          </div>
      </div>
    </div>
  `,
    )
    .join("");

  return sectionHTML + cardsHTML + "</div>";
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

// Sidebar Search
DOM.sidebarSearch?.addEventListener("input", filterSidebar);

// Top-level Profile Metadata Inputs
DOM.inputId.addEventListener("input", (e) => {
  State.db[State.activeIndex].id = e.target.value;
  markUnsaved();

  const activeCode = document.querySelector(
    ".profile-item.active .profile-code",
  );
  if (activeCode)
    activeCode.textContent = (e.target.value || "NEW").toUpperCase();
});

DOM.inputLabel.addEventListener("input", (e) => {
  State.db[State.activeIndex].label = e.target.value;
  markUnsaved();

  const activeLabel = document.querySelector(
    ".profile-item.active .profile-label",
  );
  if (activeLabel)
    activeLabel.textContent = e.target.value || "Unnamed Profile";
});

DOM.inputVariant.addEventListener("change", (e) => {
  State.db[State.activeIndex].variant = e.target.value;
  markUnsaved();
  renderSidebar(); // Variant changes category placement, requires re-render
  renderTests();
});

// Tests Array Delegation (Handles both inputs AND buttons)
DOM.testsContainer.addEventListener("input", (e) => {
  if (e.target.tagName === "INPUT") {
    const arrayName = e.target.dataset.array;
    const index = e.target.dataset.index;
    const field = e.target.dataset.field;

    State.db[State.activeIndex][arrayName][index][field] = e.target.value;
    markUnsaved();
  }
});

DOM.testsContainer.addEventListener("click", (e) => {
  const action = e.target.dataset.action;
  if (!action) return;

  const arrayName = e.target.dataset.array;

  if (action === "add") {
    State.db[State.activeIndex][arrayName].push({
      name: "New English Test",
      overall: "",
      listening: "",
      reading: "",
      writing: "",
      speaking: "",
    });
    markUnsaved();
    renderTests();
  } else if (action === "remove") {
    const index = parseInt(e.target.dataset.index, 10);
    if (confirm("Remove this test?")) {
      State.db[State.activeIndex][arrayName].splice(index, 1);
      markUnsaved();
      renderTests();
    }
  }
});

// --- 6. ACTIONS (Exposed to global window) ---

window.toggleSidebar = function () {
  DOM.appSidebar.classList.toggle("open");
  DOM.sidebarOverlay.classList.toggle("open");
};

window.addProfile = function () {
  State.db.push({
    id: "NEW",
    label: "New Profile",
    variant: "d",
    tests_undergraduate: [],
    tests_postgraduate: [],
    tests_general: [],
  });
  markUnsaved();
  loadEditor(State.db.length - 1);
  if (window.innerWidth < 992) window.toggleSidebar();
};

window.deleteProfile = function () {
  if (confirm("Are you sure you want to delete this entire profile?")) {
    State.db.splice(State.activeIndex, 1);
    State.activeIndex = -1;
    markUnsaved();
    DOM.editorPanel.classList.add("hidden");
    DOM.emptyState.classList.remove("hidden");
    renderSidebar();
  }
};

window.saveJSON = function () {
  // Clean empty test arrays based on variant type before exporting
  const dataToSave = State.db.map((p) => {
    const clean = { ...p };
    if (clean.variant === "d") {
      delete clean.tests_general;
    } else {
      delete clean.tests_undergraduate;
      delete clean.tests_postgraduate;
    }
    return clean;
  });

  const now = new Date();
  const pad = (num) => String(num).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `english-profiles-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);

  State.hasUnsavedChanges = false;
  localStorage.removeItem("english_draft_db");
  showToast('<span class="toast-icon">✓</span> Profiles saved successfully');
};

// --- 7. UTILITIES ---

function filterSidebar() {
  const term = DOM.sidebarSearch?.value.toLowerCase() || "";
  const items = document.querySelectorAll(".profile-item");

  items.forEach((item) => {
    // We grab the text straight from the DOM elements for real-time filtering
    const code = item.querySelector(".profile-code").textContent.toLowerCase();
    const label = item
      .querySelector(".profile-label")
      .textContent.toLowerCase();

    item.classList.toggle(
      "hidden",
      !(code.includes(term) || label.includes(term)),
    );
  });
}

function markUnsaved() {
  State.hasUnsavedChanges = true;
  localStorage.setItem("english_draft_db", JSON.stringify(State.db));
}

function showToast(message) {
  DOM.notification.innerHTML = message;
  DOM.notification.classList.add("show");
  setTimeout(() => DOM.notification.classList.remove("show"), 3000);
}
