let db = [];
let activeIndex = -1;

const countryDict = {
  ad: "Andorra",
  ae: "United Arab Emirates",
  af: "Afghanistan",
  ag: "Antigua and Barbuda",
  ai: "Anguilla",
  al: "Albania",
  am: "Armenia",
  ao: "Angola",
  ar: "Argentina",
  at: "Austria",
  au: "Australia",
  az: "Azerbaijan",
  ba: "Bosnia and Herzegovina",
  bb: "Barbados",
  bd: "Bangladesh",
  be: "Belgium",
  bf: "Burkina Faso",
  bg: "Bulgaria",
  bh: "Bahrain",
  bi: "Burundi",
  bj: "Benin",
  bm: "Bermuda",
  bn: "Brunei",
  bo: "Bolivia",
  br: "Brazil",
  bs: "Bahamas",
  bt: "Bhutan",
  bw: "Botswana",
  by: "Belarus",
  bz: "Belize",
  ca: "Canada",
  cd: "DR Congo",
  cf: "Central African Republic",
  cg: "Congo",
  ch: "Switzerland",
  ci: "Côte d'Ivoire",
  cl: "Chile",
  cm: "Cameroon",
  cn: "China",
  co: "Colombia",
  cr: "Costa Rica",
  cu: "Cuba",
  cv: "Cape Verde",
  cy: "Cyprus",
  cz: "Czechia",
  de: "Germany",
  dj: "Djibouti",
  dk: "Denmark",
  dm: "Dominica",
  do: "Dominican Republic",
  dz: "Algeria",
  ec: "Ecuador",
  ee: "Estonia",
  eg: "Egypt",
  er: "Eritrea",
  es: "Spain",
  et: "Ethiopia",
  fi: "Finland",
  fj: "Fiji",
  fk: "Falkland Islands",
  fm: "Micronesia",
  fr: "France",
  ga: "Gabon",
  gd: "Grenada",
  ge: "Georgia",
  gh: "Ghana",
  gi: "Gibraltar",
  gm: "Gambia",
  gn: "Guinea",
  gq: "Equatorial Guinea",
  gr: "Greece",
  gs: "South Georgia",
  gt: "Guatemala",
  gw: "Guinea-Bissau",
  gy: "Guyana",
  hk: "Hong Kong",
  hn: "Honduras",
  hr: "Croatia",
  ht: "Haiti",
  hu: "Hungary",
  id: "Indonesia",
  ie: "Ireland",
  il: "Israel",
  im: "Isle of Man",
  in: "India",
  io: "British Indian Ocean Territory",
  iq: "Iraq",
  ir: "Iran",
  is: "Iceland",
  it: "Italy",
  je: "Jersey",
  jm: "Jamaica",
  jo: "Jordan",
  jp: "Japan",
  ke: "Kenya",
  kg: "Kyrgyzstan",
  kh: "Cambodia",
  ki: "Kiribati",
  km: "Comoros",
  kn: "St Kitts and Nevis",
  kp: "North Korea",
  kr: "South Korea",
  kw: "Kuwait",
  ky: "Cayman Islands",
  kz: "Kazakhstan",
  la: "Laos",
  lb: "Lebanon",
  lc: "St Lucia",
  li: "Liechtenstein",
  lk: "Sri Lanka",
  lr: "Liberia",
  ls: "Lesotho",
  lt: "Lithuania",
  lu: "Luxembourg",
  lv: "Latvia",
  ly: "Libya",
  ma: "Morocco",
  mc: "Monaco",
  md: "Moldova",
  me: "Montenegro",
  mg: "Madagascar",
  mh: "Marshall Islands",
  mk: "North Macedonia",
  ml: "Mali",
  mm: "Myanmar",
  mn: "Mongolia",
  mo: "Macau",
  mr: "Mauritania",
  ms: "Montserrat",
  mt: "Malta",
  mu: "Mauritius",
  mv: "Maldives",
  mw: "Malawi",
  mx: "Mexico",
  my: "Malaysia",
  mz: "Mozambique",
  na: "Namibia",
  nc: "New Caledonia",
  ne: "Niger",
  ng: "Nigeria",
  ni: "Nicaragua",
  nl: "Netherlands",
  no: "Norway",
  np: "Nepal",
  nr: "Nauru",
  nz: "New Zealand",
  om: "Oman",
  pa: "Panama",
  pe: "Peru",
  pg: "Papua New Guinea",
  ph: "Philippines",
  pk: "Pakistan",
  pl: "Poland",
  pn: "Pitcairn",
  pr: "Puerto Rico",
  ps: "Palestine",
  pt: "Portugal",
  pw: "Palau",
  py: "Paraguay",
  qa: "Qatar",
  ro: "Romania",
  rs: "Serbia",
  ru: "Russia",
  rw: "Rwanda",
  sa: "Saudi Arabia",
  sb: "Solomon Islands",
  sc: "Seychelles",
  sd: "Sudan",
  se: "Sweden",
  sg: "Singapore",
  sh: "St Helena",
  si: "Slovenia",
  sk: "Slovakia",
  sl: "Sierra Leone",
  sm: "San Marino",
  sn: "Senegal",
  so: "Somalia",
  sr: "Suriname",
  ss: "South Sudan",
  st: "Sao Tome and Principe",
  sv: "El Salvador",
  sy: "Syria",
  sz: "Eswatini",
  tc: "Turks and Caicos",
  td: "Chad",
  tg: "Togo",
  th: "Thailand",
  tj: "Tajikistan",
  tl: "Timor-Leste",
  tm: "Turkmenistan",
  tn: "Tunisia",
  to: "Tonga",
  tr: "Turkey",
  tt: "Trinidad and Tobago",
  tv: "Tuvalu",
  tw: "Taiwan",
  tz: "Tanzania",
  ua: "Ukraine",
  ug: "Uganda",
  uk: "United Kingdom",
  us: "United States",
  uy: "Uruguay",
  uz: "Uzbekistan",
  va: "Vatican City",
  vc: "St Vincent and the Grenadines",
  ve: "Venezuela",
  vg: "British Virgin Islands",
  vn: "Vietnam",
  vu: "Vanuatu",
  wf: "Wallis and Futuna",
  ws: "Samoa",
  xk: "Kosovo",
  ye: "Yemen",
  za: "South Africa",
  zm: "Zambia",
  zw: "Zimbabwe",
};

// 1. Initialize
fetch("data/academic_profiles.json")
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
      `<div class="empty-icon" style="color:var(--danger);">⚠️</div><h2>Error Loading Data</h2><p>Could not load data/academic_profiles.json.</p>`;
  });

function toggleSidebar() {
  document.getElementById("app-sidebar").classList.toggle("open");
  document.querySelector(".sidebar-overlay").classList.toggle("open");
}

// 2. Render Sidebar
function renderSidebar() {
  const list = document.getElementById("sidebar-list");
  list.innerHTML = "";

  db.forEach((profile, index) => {
    const div = document.createElement("div");
    div.className = `profile-item ${index === activeIndex ? "active" : ""}`;
    div.innerHTML = `
      <span class="profile-code">${profile.id || "NEW"}</span>
      <span class="profile-label">${profile.title || "Unnamed Profile"}</span>
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
  const profile = db[index];

  document.getElementById("empty-state").style.display = "none";
  document.getElementById("editor-panel").style.display = "block";

  renderSidebar();

  document.getElementById("field-profile-title").value = profile.title || "";
  document.getElementById("field-profile-id").value = profile.id || "";

  if (!profile.qualifications) db[activeIndex].qualifications = [];

  renderQualifications();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 4. Update Profile Metadata
document
  .getElementById("field-profile-title")
  .addEventListener("input", (e) => {
    db[activeIndex].title = e.target.value;
    renderSidebar();
  });
document.getElementById("field-profile-id").addEventListener("input", (e) => {
  db[activeIndex].id = e.target.value;
  renderSidebar();
});

// 5. Render Qualifications (Cards)
function renderQualifications() {
  const container = document.getElementById("qualifications-container");
  container.innerHTML = "";
  const profile = db[activeIndex];

  if (profile.qualifications.length === 0) {
    container.innerHTML = `<p class="text-muted">No qualifications added to this profile yet.</p>`;
    return;
  }

  profile.qualifications.forEach((qual, i) => {
    const card = document.createElement("div");
    card.className = "test-card";

    // Order requested: Title, Grades, Countries
    card.innerHTML = `
      <div class="test-title-row">
          <div style="flex-grow:1; max-width: 600px;">
              <input type="text" class="cms-test-title" 
                  value="${qual.name || ""}" placeholder="Qualification Title (e.g. A-Levels)" 
                  onchange="updateQual(${i}, 'name', this.value)">
          </div>
          <button class="btn-delete-test" onclick="removeQual(${i})">✖ Remove</button>
      </div>

      <div style="margin-bottom: 25px;">
          <label class="modern-label">Grades / Entry Requirements</label>
          <textarea class="modern-textarea" rows="3" placeholder="e.g. AAA including Mathematics..." 
              onchange="updateQual(${i}, 'grades', this.value)">${qual.grades || ""}</textarea>
      </div>

      <div>
          <label class="modern-label">Geographic Coverage (Countries)</label>
          <div class="tag-container" id="country-tags-${i}"></div>
          
          <div class="autocomplete-wrapper" style="position: relative; margin-top: 10px;">
              <input type="text" class="modern-input country-search-input" data-index="${i}" 
                  placeholder="+ Type a country name to assign it..." autocomplete="off">
              <ul class="autocomplete-list" id="autocomplete-dropdown-${i}"></ul>
          </div>
      </div>
    `;

    container.appendChild(card);
    renderTags(i); // Render tags for this specific qualification
  });

  // Attach dynamic autocomplete listeners to all inputs rendered
  document.querySelectorAll(".country-search-input").forEach((input) => {
    input.addEventListener("input", handleCountrySearch);

    // Hide dropdown if clicked away
    input.addEventListener("blur", (e) => {
      setTimeout(() => {
        const idx = e.target.getAttribute("data-index");
        const dropdown = document.getElementById(
          `autocomplete-dropdown-${idx}`,
        );
        if (dropdown) dropdown.style.display = "none";
      }, 200); // Delay allows click event on dropdown item to fire first
    });
  });
}

function updateQual(index, field, value) {
  db[activeIndex].qualifications[index][field] = value;
}

function addQualification() {
  db[activeIndex].qualifications.unshift({
    name: "New Qualification",
    grades: "",
    countries: "",
  });
  renderQualifications();
}

function removeQual(index) {
  if (confirm("Remove this qualification from the profile?")) {
    db[activeIndex].qualifications.splice(index, 1);
    renderQualifications();
  }
}

// 6. Smart Autocomplete & Tag Logic
function handleCountrySearch(e) {
  const input = e.target;
  const qualIndex = input.getAttribute("data-index");
  const val = input.value.toLowerCase();
  const dropdown = document.getElementById(
    `autocomplete-dropdown-${qualIndex}`,
  );
  dropdown.innerHTML = "";

  if (!val) {
    dropdown.style.display = "none";
    return;
  }

  const qual = db[activeIndex].qualifications[qualIndex];
  const currentCodes = (qual.countries || "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  // Find matches in dictionary, excluding already added tags
  const matches = Object.entries(countryDict).filter(([code, name]) => {
    return (
      !currentCodes.includes(code) &&
      (name.toLowerCase().includes(val) || code.includes(val))
    );
  });

  if (matches.length > 0) {
    matches.forEach(([code, name]) => {
      const li = document.createElement("li");
      li.className = "autocomplete-item";
      li.innerHTML = `<strong>${name}</strong> <span style="color:#94a3b8; font-size:0.8rem; margin-left:5px;">(${code.toUpperCase()})</span>`;

      // Using mousedown so it fires before the input 'blur' event hides the dropdown
      li.onmousedown = (event) => {
        event.preventDefault();
        addCountry(qualIndex, code);
        input.value = "";
        dropdown.style.display = "none";
      };
      dropdown.appendChild(li);
    });
    dropdown.style.display = "block";
  } else {
    dropdown.style.display = "none";
  }
}

function renderTags(qualIndex) {
  const container = document.getElementById(`country-tags-${qualIndex}`);
  container.innerHTML = "";

  const qual = db[activeIndex].qualifications[qualIndex];
  const currentCodes = (qual.countries || "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  if (currentCodes.length === 0) {
    container.innerHTML =
      "<p class='text-muted' style='font-size:0.85rem; font-style:italic; margin: 5px 0;'>No countries assigned yet.</p>";
    return;
  }

  currentCodes.forEach((code) => {
    const name = countryDict[code] || code.toUpperCase();
    const tag = document.createElement("div");
    tag.className = "country-tag";
    tag.innerHTML = `
          <span>${name}</span>
          <span class="tag-remove" onclick="removeCountry(${qualIndex}, '${code}')">✖</span>
      `;
    container.appendChild(tag);
  });
}

function addCountry(qualIndex, code) {
  const qual = db[activeIndex].qualifications[qualIndex];
  let currentCodes = (qual.countries || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  currentCodes.push(code.toLowerCase());
  qual.countries = currentCodes.join(",");
  renderTags(qualIndex);
}

function removeCountry(qualIndex, code) {
  const qual = db[activeIndex].qualifications[qualIndex];
  let currentCodes = (qual.countries || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  currentCodes = currentCodes.filter((c) => c !== code.toLowerCase());
  qual.countries = currentCodes.join(",");
  renderTags(qualIndex);
}

// 7. Global Actions
function addProfile() {
  db.push({
    id: "profile_" + (db.length + 1),
    title: "New Grade Profile",
    qualifications: [],
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
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

  const blob = new Blob([JSON.stringify(db, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `academic_profiles-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);

  const note = document.getElementById("notification");
  note.classList.add("show");
  setTimeout(() => note.classList.remove("show"), 3000);
}
