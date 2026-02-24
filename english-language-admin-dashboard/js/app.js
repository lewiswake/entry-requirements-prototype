let db = [];
let activeIndex = -1;

const variantCategories = {
  d: "Direct Entry",
  o: "Online",
  s: "SELT (UKVI)",
  m: "Medicine",
  tables: "Reference Tables",
};

fetch("data/english-profiles.json")
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
      `<div class="empty-icon" style="color:red;">⚠️</div><h2>Error Loading Data</h2><p>Could not load data/english-profiles.json. Check console.</p>`;
  });

function toggleSidebar() {
  const sidebar = document.getElementById("app-sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
}

function renderSidebar() {
  const list = document.getElementById("sidebar-list");
  list.innerHTML = "";

  const grouped = {};
  db.forEach((p, index) => {
    const variant = p.variant || "tables";
    if (!grouped[variant]) grouped[variant] = [];
    grouped[variant].push({ ...p, originalIndex: index });
  });

  const order = ["d", "o", "s", "m", "tables"];

  order.forEach((variantKey) => {
    if (grouped[variantKey] && grouped[variantKey].length > 0) {
      const header = document.createElement("div");
      header.className = "category-header";
      header.textContent = variantCategories[variantKey] || variantKey;
      list.appendChild(header);

      grouped[variantKey]
        .sort((a, b) => {
          const numA = parseInt(a.id.match(/\d+/)) || 999;
          const numB = parseInt(b.id.match(/\d+/)) || 999;
          return numA - numB;
        })
        .forEach((p) => {
          const div = document.createElement("div");
          div.className = `profile-item ${p.originalIndex === activeIndex ? "active" : ""}`;
          div.innerHTML = `
          <span class="profile-code">${(p.id || "NEW").toUpperCase()}</span>
          <span class="profile-label">${p.label || "Unnamed Profile"}</span>
        `;
          div.onclick = () => {
            loadEditor(p.originalIndex);
            if (window.innerWidth < 992) toggleSidebar();
          };
          list.appendChild(div);
        });
    }
  });
}

function loadEditor(index) {
  activeIndex = index;
  const data = db[index];

  document.getElementById("empty-state").style.display = "none";
  document.getElementById("editor-panel").style.display = "block";

  renderSidebar();

  document.getElementById("field-id").value = data.id || "";
  document.getElementById("field-variant").value = data.variant || "tables";
  document.getElementById("field-label").value = data.label || "";

  renderTests();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTests() {
  const container = document.getElementById("tests-container");
  container.innerHTML = "";
  const data = db[activeIndex];

  if (!data.tests_undergraduate) data.tests_undergraduate = [];
  if (!data.tests_postgraduate) data.tests_postgraduate = [];
  if (!data.tests_general) data.tests_general = [];

  if (data.variant === "d") {
    renderTestGroup(
      "🎓 Undergraduate Requirements",
      "tests_undergraduate",
      data.tests_undergraduate,
      container,
    );
    renderTestGroup(
      "🎓 Postgraduate Requirements",
      "tests_postgraduate",
      data.tests_postgraduate,
      container,
    );
  } else {
    renderTestGroup(
      "📝 General Requirements",
      "tests_general",
      data.tests_general,
      container,
    );
  }
}

function renderTestGroup(title, arrayName, testsArray, container) {
  const section = document.createElement("div");

  section.innerHTML = `
      <div class="section-title">
          <span>${title}</span>
          <button class="btn-add-sm" onclick="addTest('${arrayName}')">+ Add Test</button>
      </div>
  `;

  if (testsArray.length === 0) {
    section.innerHTML += `<p style="color:var(--text-light); font-size:0.95rem; margin-bottom:20px; font-style:italic;">No tests added to this section yet.</p>`;
  }

  testsArray.forEach((t, i) => {
    const card = document.createElement("div");
    card.className = "test-card";

    card.innerHTML = `
        <div class="test-title-row">
            <div style="flex-grow:1; max-width: 600px;">
                <input type="text" class="cms-test-title" 
                    value="${t.name || ""}" placeholder="Test Name (e.g. IELTS Academic)" 
                    onchange="updateTest('${arrayName}', ${i}, 'name', this.value)">
            </div>
            <button class="btn-delete-test" onclick="removeTest('${arrayName}', ${i})">✖ Remove</button>
        </div>
        <div class="score-grid">
            <div>
                <label class="modern-label">Overall</label>
                <input type="text" class="modern-input" value="${t.overall || ""}" onchange="updateTest('${arrayName}', ${i}, 'overall', this.value)">
            </div>
            <div>
                <label class="modern-label">Listening</label>
                <input type="text" class="modern-input" value="${t.listening || ""}" onchange="updateTest('${arrayName}', ${i}, 'listening', this.value)">
            </div>
            <div>
                <label class="modern-label">Reading</label>
                <input type="text" class="modern-input" value="${t.reading || ""}" onchange="updateTest('${arrayName}', ${i}, 'reading', this.value)">
            </div>
            <div>
                <label class="modern-label">Writing</label>
                <input type="text" class="modern-input" value="${t.writing || ""}" onchange="updateTest('${arrayName}', ${i}, 'writing', this.value)">
            </div>
            <div>
                <label class="modern-label">Speaking</label>
                <input type="text" class="modern-input" value="${t.speaking || ""}" onchange="updateTest('${arrayName}', ${i}, 'speaking', this.value)">
            </div>
        </div>
    `;
    section.appendChild(card);
  });

  container.appendChild(section);
}

document.getElementById("field-id").addEventListener("input", (e) => {
  db[activeIndex].id = e.target.value;
  renderSidebar();
});

document.getElementById("field-label").addEventListener("input", (e) => {
  db[activeIndex].label = e.target.value;
  renderSidebar();
});

document.getElementById("field-variant").addEventListener("change", (e) => {
  db[activeIndex].variant = e.target.value;
  renderSidebar();
  renderTests();
});

function updateTest(arrayName, testIndex, field, value) {
  db[activeIndex][arrayName][testIndex][field] = value;
}

function addTest(arrayName) {
  db[activeIndex][arrayName].push({
    name: "New English Test",
    overall: "",
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
  });
  renderTests();
}

function removeTest(arrayName, index) {
  if (confirm("Remove this test?")) {
    db[activeIndex][arrayName].splice(index, 1);
    renderTests();
  }
}

function addProfile() {
  db.push({
    id: "NEW",
    label: "New Profile",
    variant: "d",
    tests_undergraduate: [],
    tests_postgraduate: [],
    tests_general: [],
  });
  loadEditor(db.length - 1);
  if (window.innerWidth < 992) toggleSidebar();
}

function deleteProfile() {
  if (confirm("Are you sure you want to delete this entire profile?")) {
    db.splice(activeIndex, 1);
    activeIndex = -1;
    document.getElementById("editor-panel").style.display = "none";
    document.getElementById("empty-state").style.display = "block";
    renderSidebar();
  }
}

function saveJSON() {
  const dataToSave = db.map((p) => {
    const clean = { ...p };
    if (clean.variant === "d") {
      delete clean.tests_general;
    } else {
      delete clean.tests_undergraduate;
      delete clean.tests_postgraduate;
    }
    return clean;
  });

  // Calculate dynamic timestamp: YYYY-MM-DD-HHMMSS
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const timestamp = `${yyyy}-${mm}-${dd}-${hh}${mins}${ss}`;

  // Generate and download file
  const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `english-profiles-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // Trigger Toast Notification
  const note = document.getElementById("notification");
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 3000);
}
