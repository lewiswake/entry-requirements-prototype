let db = null;
let currentView = "profiles"; // 'profiles' or 'general'
let activeItemKey = null;

// 1. Initialize
fetch("data/data.json")
  .then((res) => {
    if (!res.ok) throw new Error("Could not find json file.");
    return res.json();
  })
  .then((data) => {
    db = data;
    switchView("profiles");
  })
  .catch((err) => {
    console.error("Error loading JSON", err);
    document.getElementById("empty-state").innerHTML =
      `<div class="empty-icon" style="color:var(--danger);">⚠️</div><h2>Error Loading Data</h2><p>Check console for details.</p>`;
  });

function toggleSidebar() {
  document.getElementById("app-sidebar").classList.toggle("open");
  document.querySelector(".sidebar-overlay").classList.toggle("open");
}

// 2. View Switching
function switchView(viewName) {
  currentView = viewName;
  activeItemKey = null;

  document
    .querySelectorAll(".view-tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById(`tab-${viewName}`).classList.add("active");

  document.getElementById("empty-state").style.display = "block";
  document
    .querySelectorAll(".editor-panel")
    .forEach((p) => (p.style.display = "none"));

  const titles = { profiles: "Base Profiles", general: "General Reqs" };
  document.getElementById("sidebar-title").innerText = titles[viewName];

  renderSidebar();
}

// 3. Render Sidebar
function renderSidebar() {
  const list = document.getElementById("sidebar-list");
  list.innerHTML = "";

  const collection =
    currentView === "profiles" ? db.Base_Profiles : db.General_Profiles;

  Object.keys(collection).forEach((key) => {
    const div = document.createElement("div");
    div.className = `profile-item ${key === activeItemKey ? "active" : ""}`;
    div.innerHTML = `<span class="profile-label">${collection[key].name}</span>`;
    div.onclick = () => {
      if (currentView === "profiles") loadProfileEditor(key);
      if (currentView === "general") loadGeneralEditor(key);
      if (window.innerWidth < 992) toggleSidebar();
    };
    list.appendChild(div);
  });
}

// 4. Global Add/Delete actions
function addNewSidebarItem() {
  const collection =
    currentView === "profiles" ? db.Base_Profiles : db.General_Profiles;
  const prefix = currentView === "profiles" ? "Tier_" : "GenReq_";
  const num = Object.keys(collection).length + 1;
  const newKey = `${prefix}${num.toString().padStart(2, "0")}`;

  if (currentView === "profiles") {
    db.Base_Profiles[newKey] = { name: "New Base Profile", qualifications: [] };
    loadProfileEditor(newKey);
  } else {
    db.General_Profiles[newKey] = {
      name: "New General Profile",
      sqa: "",
      gcse: "",
    };
    loadGeneralEditor(newKey);
  }
}

function deleteCurrentItem() {
  if (
    confirm(
      "Are you sure you want to delete this profile? This could break T4 pages mapping to this ID.",
    )
  ) {
    if (currentView === "profiles") delete db.Base_Profiles[activeItemKey];
    if (currentView === "general") delete db.General_Profiles[activeItemKey];

    activeItemKey = null;
    document.getElementById("empty-state").style.display = "block";
    document
      .querySelectorAll(".editor-panel")
      .forEach((p) => (p.style.display = "none"));
    renderSidebar();
  }
}

// 5. Base Profile Editor (Dynamic Qualifications)
function loadProfileEditor(tierKey) {
  activeItemKey = tierKey;
  renderSidebar();

  document.getElementById("empty-state").style.display = "none";
  document
    .querySelectorAll(".editor-panel")
    .forEach((p) => (p.style.display = "none"));
  document.getElementById("editor-profiles").style.display = "block";

  const profile = db.Base_Profiles[tierKey];

  const titleInput = document.getElementById("profile-title");
  titleInput.value = profile.name;
  titleInput.onchange = (e) => {
    profile.name = e.target.value;
    renderSidebar();
  };

  document.getElementById("profile-id-display").innerText =
    `T4 Mapping ID: ${tierKey}`;

  const container = document.getElementById("profile-grades-container");
  container.innerHTML = "";

  // Loop through the dynamic array
  if (profile.qualifications) {
    profile.qualifications.forEach((qual, index) => {
      const card = document.createElement("div");
      card.className = "test-card";
      card.innerHTML = `
                <div class="test-title-row" style="margin-bottom:15px; border-bottom: 1px solid var(--border-light); padding-bottom: 15px;">
                    <div style="flex-grow:1;">
                        <input type="text" class="cms-test-title" value="${qual.name}" placeholder="Qualification Name (e.g. European Baccalaureate)" 
                            onchange="updateQual('${tierKey}', ${index}, 'name', this.value)">
                    </div>
                    <button class="btn-delete-test" onclick="removeQualification('${tierKey}', ${index})">✖ Remove</button>
                </div>
                <div class="prereq-group">
                    <label class="modern-label">Standard Entry Grades</label>
                    <input type="text" class="modern-input" value="${qual.standard || ""}" onchange="updateQual('${tierKey}', ${index}, 'standard', this.value)">
                </div>
                <div class="prereq-group">
                    <label class="modern-label">Minimum Entry Grades</label>
                    <input type="text" class="modern-input" value="${qual.minimum || ""}" onchange="updateQual('${tierKey}', ${index}, 'minimum', this.value)">
                </div>
                <div class="prereq-group">
                    <label class="modern-label">Subject Requirements</label>
                    <textarea class="modern-textarea" rows="2" placeholder="e.g. Must include A in Mathematics" onchange="updateQual('${tierKey}', ${index}, 'subject_requirements', this.value)">${qual.subject_requirements || ""}</textarea>
                </div>
                <div class="prereq-group">
                    <label class="modern-label">Gateway Entry Grades (Optional)</label>
                    <input type="text" class="modern-input" value="${qual.gateway || ""}" onchange="updateQual('${tierKey}', ${index}, 'gateway', this.value)">
                </div>
            `;
      container.appendChild(card);
    });
  }
}

function updateQual(tierKey, index, field, value) {
  db.Base_Profiles[tierKey].qualifications[index][field] = value;
}

function addNewQualification() {
  if (!db.Base_Profiles[activeItemKey].qualifications)
    db.Base_Profiles[activeItemKey].qualifications = [];
  db.Base_Profiles[activeItemKey].qualifications.unshift({
    name: "New Qualification",
    standard: "",
    minimum: "",
    subject_requirements: "",
    gateway: "",
  });
  loadProfileEditor(activeItemKey);
}

function removeQualification(tierKey, index) {
  if (confirm("Remove this qualification from the profile?")) {
    db.Base_Profiles[tierKey].qualifications.splice(index, 1);
    loadProfileEditor(tierKey);
  }
}

// 6. General Requirements Editor
function loadGeneralEditor(genKey) {
  activeItemKey = genKey;
  renderSidebar();

  document.getElementById("empty-state").style.display = "none";
  document
    .querySelectorAll(".editor-panel")
    .forEach((p) => (p.style.display = "none"));
  document.getElementById("editor-general").style.display = "block";

  const profile = db.General_Profiles[genKey];

  const titleInput = document.getElementById("general-title");
  titleInput.value = profile.name;
  titleInput.onchange = (e) => {
    profile.name = e.target.value;
    renderSidebar();
  };

  document.getElementById("general-id-display").innerText =
    `T4 Mapping ID: ${genKey}`;

  const sqaInput = document.getElementById("general-sqa");
  const gcseInput = document.getElementById("general-gcse");

  sqaInput.value = profile.sqa || "";
  gcseInput.value = profile.gcse || "";

  sqaInput.onchange = (e) => {
    db.General_Profiles[genKey].sqa = e.target.value;
  };
  gcseInput.onchange = (e) => {
    db.General_Profiles[genKey].gcse = e.target.value;
  };
}

// 7. Save JSON
function saveJSON() {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const blob = new Blob([JSON.stringify(db, null, 4)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);

  const note = document.getElementById("notification");
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 3000);
}
