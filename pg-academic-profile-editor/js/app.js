let db = [];
let activeIndex = -1;

// --- FLAG HELPER ---
function getFlagPath(code) {
  if (!code) return "";
  const special = {
    scot: "1f3f4-e0067-e0062-e0073-e0063-e0074-e007f",
    wales: "1f3f4-e0067-e0062-e0077-e006c-e0073-e007f",
    eng: "1f3f4-e0067-e0062-e0065-e006e-e0067-e007f",
    ni: "1f1ec-1f1e7",
    uk: "1f1ec-1f1e7",
  };

  if (special[code.toLowerCase()])
    return `../flags/${special[code.toLowerCase()]}.svg`;

  const main = code.split("-")[0].toUpperCase();
  if (main.length === 2)
    return `../flags/${main
      .split("")
      .map((c) => (c.charCodeAt(0) + 127397).toString(16))
      .join("-")}.svg`;

  return null;
}

// 1. Initialize
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
      `<div class="empty-icon" style="color:var(--danger);">⚠️</div><h2>Error Loading Data</h2><p>Could not load data/pg_requirements.json.</p>`;
  });

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
      ? `<img src="${flagPath}" alt="" style="height:18px; border-radius:3px; box-shadow:0 1px 3px rgba(0,0,0,0.1); margin-right:12px;" onerror="this.style.display='none';">`
      : "";

    const div = document.createElement("div");
    div.className = `profile-item ${index === activeIndex ? "active" : ""}`;
    div.innerHTML = `
      <div style="display:flex; align-items:center;">
        ${imgHtml}
        <span style="font-size:1.05rem; font-weight:700; color:inherit;">${item.country || "Unnamed Country"}</span>
      </div>
      <span style="font-size:0.75rem; color:var(--text-light); text-transform:uppercase; margin-left: ${flagPath ? "30px" : "0"};">${item.code || "N/A"}</span>
    `;

    div.onclick = () => {
      loadEditor(index);
      if (window.innerWidth < 992) toggleSidebar();
    };
    list.appendChild(div);
  });
}

// 3. Load Editor
function loadEditor(index) {
  activeIndex = index;
  const countryData = db[index];

  document.getElementById("empty-state").style.display = "none";
  document.getElementById("editor-panel").style.display = "block";

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

// 4. Update Country Metadata
document.getElementById("field-country-name").addEventListener("input", (e) => {
  db[activeIndex].country = e.target.value;
  renderSidebar();
});
document.getElementById("field-country-code").addEventListener("input", (e) => {
  db[activeIndex].code = e.target.value.toLowerCase();
  renderSidebar(); // Re-render to update the flag dynamically!
});

// 5. Render Qualifications (Cards)
function renderQualifications() {
  const container = document.getElementById("qualifications-container");
  container.innerHTML = "";
  const countryData = db[activeIndex];

  if (countryData.postgraduate.qualifications.length === 0) {
    container.innerHTML = `<p style="color:var(--text-light); font-style:italic;">No postgraduate qualifications added for this country yet.</p>`;
    return;
  }

  countryData.postgraduate.qualifications.forEach((qual, i) => {
    const card = document.createElement("div");
    card.className = "test-card";

    card.innerHTML = `
      <div class="test-title-row">
          <div style="flex-grow:1; max-width: 600px;">
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
}

function addQualification() {
  db[activeIndex].postgraduate.qualifications.unshift({
    name: "New Qualification",
    detail: "",
  });
  renderQualifications();
}

function removeQual(index) {
  if (confirm("Remove this qualification?")) {
    db[activeIndex].postgraduate.qualifications.splice(index, 1);
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
  loadEditor(0); // Load the newly created country at the top
  if (window.innerWidth < 992) toggleSidebar();
}

function deleteCountry() {
  if (confirm("Are you sure you want to delete this entire country profile?")) {
    db.splice(activeIndex, 1);
    activeIndex = -1;
    document.getElementById("editor-panel").style.display = "none";
    document.getElementById("empty-state").style.display = "block";
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

  const note = document.getElementById("notification");
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 3000);
}
