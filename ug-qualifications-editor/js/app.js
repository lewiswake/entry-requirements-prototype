let db = null;
let currentView = "profiles";
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

// 3. Render Sidebar (WITH SCHOOL GROUPING)
function renderSidebar() {
  const list = document.getElementById("sidebar-list");
  list.innerHTML = "";

  if (currentView === "profiles") {
    // Group profiles by School
    const groups = {};
    Object.keys(db.Base_Profiles).forEach((key) => {
      const profile = db.Base_Profiles[key];
      const school = profile.school || "Unassigned";
      if (!groups[school]) groups[school] = [];
      groups[school].push({ key, name: profile.name });
    });

    // Sort schools alphabetically, but keep "Unassigned" at the top or bottom
    const sortedSchools = Object.keys(groups).sort();

    sortedSchools.forEach((school) => {
      // Add School Header
      const header = document.createElement("div");
      header.innerHTML = `<div style="padding: 15px 25px 5px; font-size:0.75rem; text-transform:uppercase; font-weight:800; color:var(--dpl-mid-grey); letter-spacing:0.5px;">${school}</div>`;
      list.appendChild(header);

      // Add Profiles under this school
      groups[school].forEach((item) => {
        let title = item.name;
        let subtitle = "";
        
        // Extract "Profile X" and whatever is in the parentheses
        const match = item.name.match(/^(Profile\s*\d+)\s*\((.*?)\)$/i);
        if (match) {
          title = match[1];
          subtitle = match[2];
        }

        const div = document.createElement("div");
        div.className = `profile-item ${item.key === activeItemKey ? "active" : ""}`;
        div.innerHTML = `
          <div class="profile-label">${title}</div>
          ${subtitle ? `<div class="profile-subtitle">${subtitle}</div>` : ""}
        `;
        div.onclick = () => {
          loadProfileEditor(item.key);
          if (window.innerWidth < 992) toggleSidebar();
        };
        list.appendChild(div);
      });
    });
  } else {
    // General Reqs (Flat List)
    Object.keys(db.General_Profiles).forEach((key) => {
      const div = document.createElement("div");
      div.className = `profile-item ${key === activeItemKey ? "active" : ""}`;
      div.innerHTML = `<span class="profile-label">${db.General_Profiles[key].name}</span>`;
      div.onclick = () => {
        loadGeneralEditor(key);
        if (window.innerWidth < 992) toggleSidebar();
      };
      list.appendChild(div);
    });
  }
}

// 4. Global Add/Delete actions
function addNewSidebarItem() {
  const collection =
    currentView === "profiles" ? db.Base_Profiles : db.General_Profiles;
  const prefix = currentView === "profiles" ? "Profile_" : "GenReq_";
  const num = Object.keys(collection).length + 1;

  let i = num;
  let newKey = `${prefix}${i.toString().padStart(2, "0")}`;
  while (collection[newKey]) {
    i++;
    newKey = `${prefix}${i.toString().padStart(2, "0")}`;
  }

  if (currentView === "profiles") {
    db.Base_Profiles[newKey] = {
      name: "New Base Profile",
      school: "Unassigned",
      qualifications: [],
    };
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

function duplicateCurrentItem() {
  if (currentView !== "profiles") return;

  const prefix = "Profile_";
  const num = Object.keys(db.Base_Profiles).length + 1;
  let i = num;
  let newKey = `${prefix}${i.toString().padStart(2, "0")}`;
  while (db.Base_Profiles[newKey]) {
    i++;
    newKey = `${prefix}${i.toString().padStart(2, "0")}`;
  }

  const original = db.Base_Profiles[activeItemKey];
  db.Base_Profiles[newKey] = JSON.parse(JSON.stringify(original));
  db.Base_Profiles[newKey].name = original.name + " (Copy)";

  loadProfileEditor(newKey);
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

// 5. Base Profile Editor
function loadProfileEditor(tierKey) {
  activeItemKey = tierKey;
  renderSidebar();

  document.getElementById("empty-state").style.display = "none";
  document
    .querySelectorAll(".editor-panel")
    .forEach((p) => (p.style.display = "none"));
  document.getElementById("editor-profiles").style.display = "block";

  const profile = db.Base_Profiles[tierKey];

  let title = profile.name;
  let subtitle = "";
  const match = profile.name.match(/^(Profile\s*\d+)\s*\((.*?)\)$/i);
  if (match) {
    title = match[1];
    subtitle = match[2];
  }

  const titleInput = document.getElementById("profile-title");
  const subtitleInput = document.getElementById("profile-subtitle");
  
  titleInput.value = title;
  subtitleInput.value = subtitle;

  const updateProfileName = () => {
    let newTitle = titleInput.value.trim();
    let newSubtitle = subtitleInput.value.trim();
    if (newSubtitle) {
      profile.name = `${newTitle} (${newSubtitle})`;
    } else {
      profile.name = newTitle;
    }
    renderSidebar();
  };

  titleInput.onchange = updateProfileName;
  subtitleInput.onchange = updateProfileName;

  // Bind School Dropdown
  const schoolSelect = document.getElementById("profile-school");
  schoolSelect.value = profile.school || "Unassigned";
  schoolSelect.onchange = (e) => {
    profile.school = e.target.value;
    renderSidebar(); // Re-render sidebar to move the profile to the correct group
  };

  document.getElementById("profile-id-display").innerText =
    `T4 Mapping ID: ${tierKey}`;

  const container = document.getElementById("profile-grades-container");
  container.innerHTML = "";

  if (profile.qualifications) {
    profile.qualifications.forEach((qual, index) => {
      const card = document.createElement("div");
      card.className = "test-card";
        card.classList.add("collapsed"); // Collapsed by default
      card.innerHTML = `
                <div class="test-title-row" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleQualification(this)">
                    <div style="flex-grow:1; display:flex; align-items:center; gap: 15px;">
                        <div class="accordion-toggle"></div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary); pointer-events: none;">${qual.name || 'New Qualification'}</div>
                    </div>
                </div>
                <div class="test-body">
                    <!-- Top section: Name -->
                    <div class="prereq-group" style="margin-bottom: 30px;">
                        <label class="modern-label">Qualification Name</label>
                        <input type="text" class="modern-input" value="${qual.name || ""}" placeholder="e.g. A-levels" 
                            onfocus="this.setAttribute('data-old', this.value)" 
                            onchange="updateQualName('${tierKey}', ${index}, this.getAttribute('data-old'), this.value)" 
                            style="font-weight: 700; font-size: 1.1rem;">
                    </div>

                    <!-- Grid for Standard Requirements -->
                    <div style="background: var(--dpl-light-grey-2); padding: 25px; border-radius: 8px; border: 1px solid var(--border-light); margin-bottom: 25px;">
                        <h4 style="font-size: 0.85rem; margin-top: 0; margin-bottom: 20px; color: var(--text-dark); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Standard Entry Route</h4>
                        <div style="display: grid; grid-template-columns: 1fr 2.5fr; gap: 20px; align-items: start;">
                            <div class="prereq-group" style="margin: 0;">
                                <label class="modern-label">Grade Requirement</label>
                                <input type="text" class="modern-input" value="${qual.standard || ""}" onchange="updateQual('${tierKey}', ${index}, 'standard', this.value)" placeholder="e.g. AAA">
                            </div>
                            <div class="prereq-group" style="margin: 0;">
                                <label class="modern-label">Subject Requirements</label>
                                <textarea class="modern-textarea" rows="2" placeholder="e.g. Must include A in Mathematics" onchange="updateQual('${tierKey}', ${index}, 'subject_requirements_standard', this.value)">${qual.subject_requirements_standard || qual.subject_requirements || ""}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Grid for Minimum Requirements -->
                    <div style="background: var(--dpl-light-grey-2); padding: 25px; border-radius: 8px; border: 1px solid var(--border-light); margin-bottom: 25px;">
                        <h4 style="font-size: 0.85rem; margin-top: 0; margin-bottom: 20px; color: var(--text-dark); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Minimum Entry Route (Widening Access)</h4>
                        <div style="display: grid; grid-template-columns: 1fr 2.5fr; gap: 20px; align-items: start;">
                            <div class="prereq-group" style="margin: 0;">
                                <label class="modern-label">Grade Requirement</label>
                                <input type="text" class="modern-input" value="${qual.minimum || ""}" onchange="updateQual('${tierKey}', ${index}, 'minimum', this.value)" placeholder="e.g. ABB">
                            </div>
                            <div class="prereq-group" style="margin: 0;">
                                <label class="modern-label">Subject Requirements</label>
                                <textarea class="modern-textarea" rows="2" placeholder="e.g. Must include B in Mathematics" onchange="updateQual('${tierKey}', ${index}, 'subject_requirements_minimum', this.value)">${qual.subject_requirements_minimum || ""}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Gateway Route -->
                    <div style="background: var(--dpl-light-grey-2); padding: 25px; border-radius: 8px; border: 1px solid var(--border-light); margin-bottom: 25px;">
                        <h4 style="font-size: 0.85rem; margin-top: 0; margin-bottom: 20px; color: var(--text-dark); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Gateway Entry Route (Optional)</h4>
                        <div class="prereq-group" style="margin: 0;">
                            <label class="modern-label">Gateway Grades</label>
                            <input type="text" class="modern-input" value="${qual.gateway || ""}" onchange="updateQual('${tierKey}', ${index}, 'gateway', this.value)" placeholder="e.g. BBBB">
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="margin-top: 15px; padding-top: 20px; border-top: 1px solid var(--border-light); text-align: right;">
                        <button class="btn-action btn-action-danger" style="display: inline-flex;" onclick="event.stopPropagation(); removeQualification('${tierKey}', ${index})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete Qualification
                        </button>
                    </div>
                </div>
            `;
      container.appendChild(card);
    });
  }
}

function updateQualName(tierKey, index, oldName, newName) {
  if (oldName && oldName !== newName) {
    let count = 0;
    for (const key in db.Base_Profiles) {
      if (key !== tierKey) {
        const hasQual = db.Base_Profiles[key].qualifications?.some(q => q.name === oldName);
        if (hasQual) count++;
      }
    }
    
    if (count > 0) {
      if (confirm(`Do you want to rename "${oldName}" to "${newName}" across ${count} other profiles as well?`)) {
        for (const key in db.Base_Profiles) {
          if (key !== tierKey && db.Base_Profiles[key].qualifications) {
            db.Base_Profiles[key].qualifications.forEach(q => {
              if (q.name === oldName) q.name = newName;
            });
          }
        }
      }
    }
  }
  
  db.Base_Profiles[tierKey].qualifications[index].name = newName;
  loadProfileEditor(tierKey); // Re-render to update the header
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
    subject_requirements_standard: "",
    subject_requirements_minimum: "",
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
  setTimeout(() => {
    note.classList.remove("show");
  }, 3000);
}

// 8. Navigation Improvements
function toggleQualification(headerElement) {
  const card = headerElement.closest('.test-card');
  if (card) {
    card.classList.toggle('collapsed');
  }
}

function filterQualifications() {
  const query = document.getElementById('qual-search').value.toLowerCase();
  const container = document.getElementById('profile-grades-container');
  const cards = container.getElementsByClassName('test-card');
  
  for (let i = 0; i < cards.length; i++) {
    const input = cards[i].querySelector('.cms-test-title');
    if (input) {
      const name = input.value.toLowerCase();
      if (name.includes(query)) {
        cards[i].style.display = '';
      } else {
        cards[i].style.display = 'none';
      }
    }
  }
}
