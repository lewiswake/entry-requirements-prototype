// --- T4 COURSE CONFIGURATION VARIABLES ---
// In production, T4 will inject these IDs dynamically onto the page
const COURSE_BASE_TIER = "Tier_01"; 
const COURSE_GEN_REQ = "GenReq_01"; 
const COURSE_ENGLISH_PROFILE_ID = "3-d"; // Assuming standard arts english profile

// --- DOM ELEMENTS ---
const qualSel = document.getElementById("qual-selector");
const resultArea = document.getElementById("result-area");
const genReqsArea = document.getElementById("general-reqs-area");

const engSel = document.getElementById("english-selector");
const engResult = document.getElementById("english-result");

// --- STATE ---
let activeQualifications = []; 
let englishData = []; 

// --- BOOTSTRAP APP ---
async function initApp() {
  
  // 1. Fetch Academic Requirements (Base Profile & General Rules)
  try {
    const res = await fetch("data/data.json");
    const db = await res.json();

    // Populate the Base Profile Qualifications Dropdown
    if (db.Base_Profiles && db.Base_Profiles[COURSE_BASE_TIER]) {
      const profile = db.Base_Profiles[COURSE_BASE_TIER];
      activeQualifications = profile.qualifications || [];
      
      qualSel.innerHTML = '<option value="" disabled selected>Select Qualification...</option>';
      activeQualifications.forEach((qual, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = qual.name;
        qualSel.appendChild(opt);
      });
    } else {
      qualSel.innerHTML = "<option disabled>Error: Academic Profile Not Found</option>";
    }

    // Render the General Requirements Block
    if (db.General_Profiles && db.General_Profiles[COURSE_GEN_REQ]) {
      renderGeneralReqs(db.General_Profiles[COURSE_GEN_REQ]);
    }

  } catch (err) {
    console.error("Error loading entry requirements data:", err);
    qualSel.innerHTML = "<option disabled>Error loading data</option>";
  }

  // 2. Fetch English Language Profiles (Untouched)
  try {
    const engRes = await fetch("data/english-profiles.json");
    const profiles = await engRes.json();

    const profile = profiles.find((p) => p.id === COURSE_ENGLISH_PROFILE_ID);

    if (profile) {
      englishData = profile.tests_undergraduate || profile.tests_general || profile.tests || [];

      if (englishData.length > 0) {
        engSel.innerHTML = '<option value="" disabled selected>Select English Test...</option>';
        englishData.forEach((t, index) => {
          const opt = document.createElement("option");
          opt.value = index;
          opt.textContent = t.name;
          engSel.appendChild(opt);
        });
      } else {
        engSel.innerHTML = "<option disabled>No specific tests listed for this profile</option>";
      }
    } else {
      engSel.innerHTML = "<option disabled>Standard University Requirements Apply</option>";
    }
  } catch (err) {
    console.error("Error loading English Profiles:", err);
    engSel.innerHTML = "<option disabled>Error loading english requirements data</option>";
  }
}

// --- EVENT LISTENERS ---
qualSel.addEventListener("change", (e) => {
  const selectedQual = activeQualifications[e.target.value];
  showResult(selectedQual);
});

engSel.addEventListener("change", (e) => {
  const test = englishData[e.target.value];
  renderEnglishScores(test);
});

// --- RENDER FUNCTIONS ---
function showResult(qual) {
  let gradesHtml = "";
  
  if (qual.standard) {
    gradesHtml += `
      <div class="key-fact" style="border:none; padding-bottom:10px; margin-bottom:0;">
        <strong style="color:var(--text-main);">Standard entry grades</strong>
        <span style="font-size:1.05rem;">${qual.standard}</span>
      </div>`;
  }
  if (qual.minimum) {
    gradesHtml += `
      <div class="key-fact" style="border:none; padding-bottom:10px; margin-bottom:0;">
        <strong style="color:var(--text-main);">Minimum entry grades</strong>
        <span style="font-size:1.05rem;">${qual.minimum}</span>
      </div>`;
  }
  if (qual.gateway) {
    gradesHtml += `
      <div class="key-fact" style="border:none; padding-bottom:5px; margin-bottom:0;">
        <strong style="color:var(--text-main);">Gateway entry grades</strong>
        <span style="font-size:0.95rem; color:var(--text-light);">${qual.gateway}</span>
      </div>`;
  }

  resultArea.innerHTML = `
    <div class="result-box" style="margin-top: 20px;">
        <h3 style="margin-top:0; color:var(--primary); font-weight:800; font-size:1.3rem;">
            ${qual.name}
        </h3>
        ${gradesHtml || "<p>See general guidelines.</p>"}
    </div>
  `;
}

function renderGeneralReqs(genReq) {
  genReqsArea.innerHTML = `
    <h3 style="margin-top: 0;">General Entry Requirements</h3>
    <p class="text-muted" style="margin-bottom: 20px;">All applicants must have attained the following qualifications, or equivalent, in addition to the specific entry requirements for individual programmes.</p>
    
    <div class="result-box" style="background: white;">
        <div style="margin-bottom: 20px;">
            <h4 style="margin-top:0; color:var(--primary); font-weight:700; font-size:1.05rem;">SQA Qualifications</h4>
            <p style="font-size: 0.95rem; margin-bottom:0;">${genReq.sqa}</p>
        </div>
        <div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
            <h4 style="margin-top:0; color:var(--primary); font-weight:700; font-size:1.05rem;">GCSE Qualifications</h4>
            <p style="font-size: 0.95rem; margin-bottom:0;">${genReq.gcse}</p>
        </div>
    </div>
  `;
}

function renderEnglishScores(test) {
  engResult.innerHTML = `
    <div class="result-box" style="background:#fff9f0; border-color:#ffeeba; margin-top:20px;">
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
