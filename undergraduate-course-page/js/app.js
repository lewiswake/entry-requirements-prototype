// --- CONFIGURATION ---
const COURSE_ACADEMIC_PROFILE_ID = "profile_1"; // Link to the specific academic profile
const COURSE_ENGLISH_PROFILE_ID = "5-d"; // Link to the specific English profile

// --- GLOBAL DICTIONARY ---
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

// --- DOM ELEMENTS ---
const countrySel = document.getElementById("country-selector");
const qualSel = document.getElementById("qual-selector");
const qualWrapper = document.getElementById("qual-wrapper");
const resultArea = document.getElementById("result-area");
const rememberToggle = document.getElementById("remember-toggle");

const engSel = document.getElementById("english-selector");
const engResult = document.getElementById("english-result");

// --- STATE ---
let academicData = []; // Stores the qualifications for the assigned profile
let currentCountryCode = null;
let filteredQuals = []; // Stores qualifications applicable to the selected country
let englishData = []; // Stores English profile data

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

// --- BOOTSTRAP APP ---
async function initApp() {
  // 1. Fetch Academic Profiles
  try {
    const acaRes = await fetch("data/academic_profiles.json");
    const profiles = await acaRes.json();

    // Find the specific profile assigned to this course
    const profile = profiles.find((p) => p.id === COURSE_ACADEMIC_PROFILE_ID);

    if (profile && profile.qualifications) {
      academicData = profile.qualifications;

      // Dynamically extract all unique country codes listed in this profile
      let uniqueCodes = new Set();
      academicData.forEach((qual) => {
        if (qual.countries) {
          qual.countries.split(",").forEach((c) => {
            if (c.trim()) uniqueCodes.add(c.trim().toLowerCase());
          });
        }
      });

      // Map codes to full country names and sort alphabetically
      let sortedCountries = Array.from(uniqueCodes)
        .map((code) => ({
          code: code,
          name: countryDict[code] || code.toUpperCase(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Populate Country Dropdown
      countrySel.innerHTML =
        '<option value="" disabled selected>Select Country...</option>';
      sortedCountries.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.code;
        opt.textContent = c.name;
        countrySel.appendChild(opt);
      });

      // Restore User Preference if saved
      const saved = localStorage.getItem("user_country_preference");
      if (saved && Array.from(uniqueCodes).includes(saved)) {
        countrySel.value = saved;
        rememberToggle.checked = true;
        loadQualifications(saved);
      }
    } else {
      countrySel.innerHTML =
        "<option disabled>Error: Academic Profile Not Found</option>";
    }
  } catch (err) {
    console.error("Error loading Academic Requirements:", err);
  }

  // 2. Fetch English Language Profiles
  try {
    const engRes = await fetch("data/english-profiles.json");
    const profiles = await engRes.json();

    const profile = profiles.find((p) => p.id === COURSE_ENGLISH_PROFILE_ID);

    if (profile) {
      // Priority: Try loading Undergraduate array first, fallback to General, fallback to old 'tests' array
      englishData =
        profile.tests_undergraduate ||
        profile.tests_general ||
        profile.tests ||
        [];

      if (englishData.length > 0) {
        engSel.innerHTML =
          '<option value="" disabled selected>Select English Test...</option>';
        englishData.forEach((t, index) => {
          const opt = document.createElement("option");
          opt.value = index;
          opt.textContent = t.name;
          engSel.appendChild(opt);
        });
      } else {
        engSel.innerHTML =
          "<option disabled>No specific tests listed for this profile</option>";
      }
    } else {
      engSel.innerHTML =
        "<option disabled>Standard University Requirements Apply</option>";
    }
  } catch (err) {
    console.error("Error loading English Profiles:", err);
    engSel.innerHTML =
      "<option disabled>Error loading english requirements data</option>";
  }
}

// --- EVENT LISTENERS ---
countrySel.addEventListener("change", (e) => {
  loadQualifications(e.target.value);
  if (rememberToggle.checked) {
    localStorage.setItem("user_country_preference", e.target.value);
  }
});

qualSel.addEventListener("change", (e) => {
  const index = e.target.value;
  const qual = filteredQuals[index]; // Pull from filtered array
  showResult(qual);
});

rememberToggle.addEventListener("change", (e) => {
  if (e.target.checked && countrySel.value) {
    localStorage.setItem("user_country_preference", countrySel.value);
  } else {
    localStorage.removeItem("user_country_preference");
  }
});

engSel.addEventListener("change", (e) => {
  const testIndex = e.target.value;
  const test = englishData[testIndex];
  renderEnglishScores(test);
});

// --- LOGIC ---
function loadQualifications(code) {
  currentCountryCode = code;

  qualWrapper.classList.remove("disabled-wrapper");
  qualSel.disabled = false;
  qualSel.innerHTML =
    '<option value="" disabled selected>Select Qualification...</option>';
  resultArea.innerHTML = "";

  // Filter qualifications to ONLY show those that apply to the selected country
  filteredQuals = academicData.filter((q) => {
    if (!q.countries) return false;
    const codes = q.countries.split(",").map((c) => c.trim().toLowerCase());
    return codes.includes(code.toLowerCase());
  });

  if (filteredQuals.length > 0) {
    filteredQuals.forEach((q, index) => {
      const opt = document.createElement("option");
      opt.value = index; // Store its index relative to the filtered array
      opt.textContent = q.name;
      qualSel.appendChild(opt);
    });

    // Auto-select if there's only 1 qualification
    if (filteredQuals.length === 1) {
      qualSel.value = 0;
      showResult(filteredQuals[0]);
    }
  } else {
    qualSel.innerHTML =
      "<option disabled>No specific qualifications listed</option>";
  }
}

function showResult(qual) {
  const flagPath = getFlagPath(currentCountryCode);
  const imgHtml = flagPath
    ? `<img src="${flagPath}" class="flag-result" alt="" onerror="this.style.display='none';">`
    : "";

  // Convert JSON line breaks (\n) into HTML line breaks (<br>)
  const formattedGrades = qual.grades
    ? qual.grades.replace(/\n/g, "<br>")
    : "See general guidelines.";

  resultArea.innerHTML = `
    <div class="result-box">
        <h3 style="margin-top:0; color:var(--primary); display:flex; align-items:center; font-weight:800; font-size:1.3rem;">
            ${imgHtml} ${qual.name}
        </h3>
        <p style="font-weight:500; color:var(--text-main); font-size:1.05rem; line-height:1.5;">${formattedGrades}</p>
        <div style="margin-top:15px; padding-top:15px; border-top:1px dashed var(--border-color); font-size:0.9rem; color:var(--text-light);">
            <strong>Note:</strong> Standard entry requirements apply. Please check our visa guidelines if applicable.
        </div>
    </div>
  `;
}

function renderEnglishScores(test) {
  engResult.innerHTML = `
    <div class="result-box" style="background:#fff9f0; border-color:#ffeeba;">
        <h4 style="margin-top:0; color:#8a6d3b; font-weight:800; font-size:1.1rem;">${test.name} Minimum Scores</h4>
        <div class="eng-score-grid">
            <div class="eng-score-item"><span>Overall</span><strong>${test.overall || "-"}</strong></div>
            <div class="eng-score-item"><span>Reading</span><strong>${test.reading || "-"}</strong></div>
            <div class="eng-score-item"><span>Writing</span><strong>${test.writing || "-"}</strong></div>
            <div class="eng-score-item"><span>Listening</span><strong>${test.listening || "-"}</strong></div>
            <div class="eng-score-item"><span>Speaking</span><strong>${test.speaking || "-"}</strong></div>
        </div>
    </div>
  `;
}

// Start Application
document.addEventListener("DOMContentLoaded", initApp);
