// --- STATE ---
let db = [];
let parsedProfiles = []; // A flattened, user-friendly array
let currentType = null;
let currentProfile = null;
let currentTest = null;

// DOM Elements
const selCategory = document.getElementById("select-category");
const selProfile = document.getElementById("select-profile");
const selTest = document.getElementById("select-test");

const groupProfile = document.getElementById("group-profile");
const groupTest = document.getElementById("group-test");

const resultArea = document.getElementById("result-area");
const shareArea = document.getElementById("share-area");
const shareInput = document.getElementById("share-url-input");

// Definition of user-facing categories and how they map to the JSON
const studyTypes = [
  {
    id: "ug",
    label: "Undergraduate (Direct Entry)",
    variant: "d",
    arrayKey: "tests_undergraduate",
  },
  {
    id: "pg",
    label: "Postgraduate (Direct Entry)",
    variant: "d",
    arrayKey: "tests_postgraduate",
  },
  {
    id: "online",
    label: "Online Programmes",
    variant: "o",
    arrayKey: "tests_general",
  },
  { id: "selt", label: "SELT (UKVI)", variant: "s", arrayKey: "tests_general" },
  { id: "med", label: "Medicine", variant: "m", arrayKey: "tests_general" },
];

// --- INITIALIZATION ---
async function initApp() {
  try {
    const res = await fetch("data/english-profiles.json");
    if (!res.ok) throw new Error("Failed to fetch profiles");
    db = await res.json();

    populateCategoryDropdown();
    handleURLParameters();
  } catch (err) {
    console.error("Error loading JSON:", err);
    selCategory.innerHTML = `<option disabled>Error loading data. Try again later.</option>`;
  }
}

// --- POPULATE DROPDOWNS ---
function populateCategoryDropdown() {
  selCategory.innerHTML =
    '<option value="" disabled selected>Select study type...</option>';
  studyTypes.forEach((type) => {
    selCategory.innerHTML += `<option value="${type.id}">${type.label}</option>`;
  });
}

function populateProfileDropdown(typeId) {
  const typeDef = studyTypes.find((t) => t.id === typeId);
  if (!typeDef) return;

  // Filter DB for profiles matching the variant AND containing tests in the required array
  const validProfiles = db.filter(
    (p) =>
      p.variant === typeDef.variant &&
      p[typeDef.arrayKey] &&
      p[typeDef.arrayKey].length > 0,
  );

  // Sort numerically based on profile ID
  validProfiles.sort((a, b) => {
    const numA = parseInt(a.id.match(/\d+/)) || 999;
    const numB = parseInt(b.id.match(/\d+/)) || 999;
    return numA - numB;
  });

  selProfile.innerHTML =
    '<option value="" disabled selected>Select your profile...</option>';
  validProfiles.forEach((p) => {
    selProfile.innerHTML += `<option value="${p.id}">${p.label} (${p.id.toUpperCase()})</option>`;
  });

  groupProfile.classList.remove("disabled-group");
  selProfile.disabled = false;
}

function populateTestDropdown(typeId, profileId) {
  const typeDef = studyTypes.find((t) => t.id === typeId);
  const profile = db.find((p) => p.id === profileId);

  if (!typeDef || !profile) return;

  const tests = profile[typeDef.arrayKey] || [];

  selTest.innerHTML =
    '<option value="" disabled selected>Select your test...</option>';
  tests.forEach((t, index) => {
    // We use the index as the value so we can easily retrieve the exact object later
    selTest.innerHTML += `<option value="${index}">${t.name}</option>`;
  });

  groupTest.classList.remove("disabled-group");
  selTest.disabled = false;
}

// --- EVENT LISTENERS ---

selCategory.addEventListener("change", (e) => {
  currentType = e.target.value;
  currentProfile = null;
  currentTest = null;

  // Reset dependent fields
  groupTest.classList.add("disabled-group");
  selTest.disabled = true;
  selTest.innerHTML =
    '<option value="" disabled selected>Awaiting profile...</option>';
  hideResults();

  populateProfileDropdown(currentType);
  updateURL();
});

selProfile.addEventListener("change", (e) => {
  currentProfile = e.target.value;
  currentTest = null;

  hideResults();
  populateTestDropdown(currentType, currentProfile);
  updateURL();
});

selTest.addEventListener("change", (e) => {
  currentTest = e.target.value;
  renderResults();
  updateURL();
});

// --- RESULT RENDERING ---
function renderResults() {
  const typeDef = studyTypes.find((t) => t.id === currentType);
  const profile = db.find((p) => p.id === currentProfile);
  const test = profile[typeDef.arrayKey][currentTest];

  if (!test) return;

  resultArea.innerHTML = `
        <div class="result-box">
            <h3 class="result-title">${test.name}</h3>
            <p style="color:var(--text-light); font-size:0.9rem; margin-bottom: 20px;">
                Requirements for <strong>${profile.label}</strong> (${typeDef.label})
            </p>
            <div class="eng-score-grid">
                <div class="eng-score-item"><span>Overall</span><strong>${test.overall || "-"}</strong></div>
                <div class="eng-score-item"><span>Reading</span><strong>${test.reading || "-"}</strong></div>
                <div class="eng-score-item"><span>Writing</span><strong>${test.writing || "-"}</strong></div>
                <div class="eng-score-item"><span>Listening</span><strong>${test.listening || "-"}</strong></div>
                <div class="eng-score-item"><span>Speaking</span><strong>${test.speaking || "-"}</strong></div>
            </div>
        </div>
    `;

  resultArea.style.display = "block";
  shareArea.style.display = "block";

  // Reset copy button if it was previously clicked
  const btnCopy = document.getElementById("btn-copy");
  btnCopy.innerText = "Copy Link";
  btnCopy.classList.remove("copied");
}

function hideResults() {
  resultArea.style.display = "none";
  shareArea.style.display = "none";
}

// --- URL & SHARING LOGIC ---
function updateURL() {
  const params = new URLSearchParams();
  if (currentType) params.set("type", currentType);
  if (currentProfile) params.set("profile", currentProfile);
  if (currentTest) params.set("test", currentTest);

  const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({ path: newUrl }, "", newUrl);

  shareInput.value = newUrl;
}

function handleURLParameters() {
  const params = new URLSearchParams(window.location.search);

  const urlType = params.get("type");
  const urlProfile = params.get("profile");
  const urlTest = params.get("test");

  if (urlType) {
    selCategory.value = urlType;
    currentType = urlType;
    populateProfileDropdown(urlType);

    if (urlProfile) {
      // Need a slight delay to let the DOM update the select options before setting value
      setTimeout(() => {
        selProfile.value = urlProfile;
        currentProfile = urlProfile;
        populateTestDropdown(urlType, urlProfile);

        if (urlTest) {
          setTimeout(() => {
            selTest.value = urlTest;
            currentTest = urlTest;
            renderResults();
            updateURL();
          }, 50);
        }
      }, 50);
    }
  }
}

function copyShareLink() {
  shareInput.select();
  shareInput.setSelectionRange(0, 99999); // For mobile devices
  navigator.clipboard.writeText(shareInput.value);

  const btn = document.getElementById("btn-copy");
  btn.innerText = "Copied!";
  btn.classList.add("copied");
}

// Boot up
document.addEventListener("DOMContentLoaded", initApp);
