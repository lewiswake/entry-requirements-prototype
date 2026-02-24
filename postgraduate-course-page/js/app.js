// --- CONFIGURATION ---
// Change this ID to link this specific PG course page to a different English profile.
const COURSE_PROFILE_ID = "3-d";

// --- DOM ELEMENTS ---
const countrySel = document.getElementById("country-selector");
const qualSel = document.getElementById("qual-selector");
const qualWrapper = document.getElementById("qual-wrapper");
const resultArea = document.getElementById("result-area");
const rememberToggle = document.getElementById("remember-toggle");

const engSel = document.getElementById("english-selector");
const engResult = document.getElementById("english-result");

// --- STATE ---
let db = [];
let currentCountry = null;
let englishData = []; // Store English profile data

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

  let fileName = "";
  if (special[code.toLowerCase()]) {
    fileName = special[code.toLowerCase()];
  } else {
    const main = code.split("-")[0].toUpperCase();
    if (main.length === 2) {
      fileName = main
        .split("")
        .map((c) => (c.charCodeAt(0) + 127397).toString(16))
        .join("-");
    }
  }

  if (fileName) {
    // Points exactly up one level, then into the flags folder
    return `../flags/${fileName}.svg`;
  }
  return null;
}

// --- BOOTSTRAP APP ---
async function initApp() {
  // 1. Fetch Academic Requirements
  try {
    const reqRes = await fetch("data/requirements.json");
    const data = await reqRes.json();
    db = data.sort((a, b) => a.country.localeCompare(b.country));

    db.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.country;
      countrySel.appendChild(opt);
    });

    // Check if user previously saved a country preference
    const saved = localStorage.getItem("user_country_preference");
    if (saved) {
      countrySel.value = saved;
      rememberToggle.checked = true;
      loadQualifications(saved);
    }
  } catch (err) {
    console.error("Error loading Academic Requirements:", err);
  }

  // 2. Fetch English Language Profiles
  try {
    const engRes = await fetch("data/english-profiles.json");
    const profiles = await engRes.json();

    const profile = profiles.find((p) => p.id === COURSE_PROFILE_ID);

    if (profile) {
      // Priority for PG: Try loading tests_postgraduate first, fallback to general, fallback to tests
      englishData =
        profile.tests_postgraduate ||
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
  // IMPORTANT: Look in the POSTGRADUATE object
  const qual = currentCountry.postgraduate.qualifications[index];
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
  currentCountry = db.find((c) => c.code === code);
  if (!currentCountry) return;

  qualWrapper.classList.remove("disabled-wrapper");
  qualSel.disabled = false;
  qualSel.innerHTML =
    '<option value="" disabled selected>Select Qualification...</option>';
  resultArea.innerHTML = "";

  // IMPORTANT: Look in the POSTGRADUATE object
  const quals = currentCountry.postgraduate
    ? currentCountry.postgraduate.qualifications
    : [];

  if (quals.length > 0) {
    quals.forEach((q, index) => {
      const opt = document.createElement("option");
      opt.value = index;
      opt.textContent = q.name;
      qualSel.appendChild(opt);
    });

    // Auto-select if there's only 1 qualification
    if (quals.length === 1) {
      qualSel.value = 0;
      showResult(quals[0]);
    }
  } else {
    qualSel.innerHTML =
      "<option disabled>No specific PG qualifications listed</option>";
  }
}

function showResult(qual) {
  const flagPath = getFlagPath(currentCountry.code);
  const imgHtml = flagPath
    ? `<img src="${flagPath}" class="flag-result" alt="" onerror="this.style.display='none';">`
    : "";

  resultArea.innerHTML = `
    <div class="result-box">
        <h3 style="margin-top:0; color:var(--primary); display:flex; align-items:center; font-weight:800; font-size:1.3rem;">
            ${imgHtml} ${qual.name}
        </h3>
        <p style="font-weight:500; color:var(--text-main); font-size:1.05rem; line-height:1.5;">${qual.detail}</p>
        <div style="margin-top:15px; padding-top:15px; border-top:1px dashed var(--border-color); font-size:0.9rem; color:var(--text-light);">
            <strong>Note:</strong> Postgraduate visa requirements may vary.
        </div>
    </div>
  `;
}

function renderEnglishScores(test) {
  engResult.innerHTML = `
    <div class="result-box" style="background:#fff9f0; border-color:#ffeeba;">
        <h4 style="margin-top:0; color:var(--primary); font-weight:800; font-size:1.1rem;">${test.name} Minimum Scores</h4>
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
