const COURSE_PROFILE_ID = "Profile_19";
const GEN_REQ_ID = "GenReq_01";

// State Management decoupled from rendering logic
const state = {
  activeQuals: [],
  filteredQuals: [],
  currentFocus: -1,
  query: "",
  isLoading: true,
};

// Centralized DOM Element references
const elements = {
  searchInput: document.getElementById("qual-search"),
  clearBtn: document.getElementById("clear-search"),
  dropdown: document.getElementById("autocomplete-list"),
  resultDiv: document.getElementById("calc-result"),
  genContainer: document.getElementById("general-requirements-container"),
};

// Generic debounce utility for UI performance
const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error("Could not find data.json");

    const db = await res.json();
    const profile = db?.Base_Profiles?.[COURSE_PROFILE_ID];
    const genReqData = db?.General_Profiles?.[GEN_REQ_ID];

    // 1. Render static General Requirements section
    if (genReqData && elements.genContainer) {
      renderGeneralRequirements(genReqData);
    }

    // 2. Initialize Calculator
    if (profile?.qualifications) {
      state.activeQuals = profile.qualifications.filter((qual) => {
        const name = qual?.name?.toLowerCase();
        return name && !["buffer row", "end row", "0"].includes(name);
      });
      setupEventListeners();
    }
  } catch (error) {
    console.error("Error loading Entry Requirements:", error);
    if (elements.resultDiv) {
      elements.resultDiv.innerHTML = `<p style="color:var(--danger, #d32f2f); font-weight:600; padding:15px; background:white;">Error loading entry requirements data. Please try refreshing the page.</p>`;
      elements.resultDiv.hidden = false;
    }
  } finally {
    state.isLoading = false;
  }
}

function formatGenReq(text) {
  if (!text) return "";
  const [introPart, subjectsPart] = text.split("following:");

  if (subjectsPart) {
    const intro = `${introPart}following:`;
    let subjectsRaw = subjectsPart.replace(".", "").trim();

    // Modern object mapping replacing string.replace chains
    const subjectMap = {
      Biology: "<li>Biology</li>",
      Chemistry: "<li>Chemistry</li>",
      "Computing Science": "<li>Computing Science</li>",
      "Computing science": "<li>Computing Science</li>",
      Geography: "<li>Geography</li>",
      "Applications of Mathematics": "<li>Applications of Mathematics</li>",
      Physics: "<li>Physics</li>",
      Psychology: "<li>Psychology</li>",
    };

    let subjectsList = subjectsRaw;
    for (const [key, value] of Object.entries(subjectMap)) {
      subjectsList = subjectsList.replaceAll(key, value);
    }
    // Safely replace Mathematics not preceded by "Applications of" via Negative Lookbehind
    subjectsList = subjectsList.replace(
      /(?<!Applications of )Mathematics/g,
      "<li>Mathematics</li>",
    );

    return `<p style="margin-block-start:0;">${intro}</p><ul class="formatted-req-list">${subjectsList}</ul>`;
  }
  return `<p style="margin-block-start:0;">${text}</p>`;
}

function renderGeneralRequirements(genReqData) {
  const fragment = document.createDocumentFragment();

  const createRow = (title, contentKey) => {
    if (!genReqData[contentKey]) return;
    const row = document.createElement("div");
    row.className = "paired-row";
    row.innerHTML = `
      <div class="paired-title">${title}</div>
      <div class="paired-content">${formatGenReq(genReqData[contentKey])}</div>
    `;
    fragment.appendChild(row);
  };

  createRow("SQA National 5", "sqa");
  createRow("GCSE", "gcse");

  elements.genContainer.appendChild(fragment);
}

function setupEventListeners() {
  const handleInput = debounce((e) => {
    state.query = e.target.value.toLowerCase().trim();
    elements.clearBtn.hidden = state.query.length === 0;

    state.filteredQuals = state.query
      ? state.activeQuals.filter((q) =>
          q.name.toLowerCase().includes(state.query),
        )
      : state.activeQuals;

    state.currentFocus = -1;
    renderDropdown();
  }, 150);

  elements.searchInput.addEventListener("input", handleInput);

  elements.searchInput.addEventListener("focus", () => {
    if (!elements.dropdown.hasChildNodes()) {
      state.filteredQuals = state.activeQuals;
      renderDropdown();
    }
    elements.dropdown.hidden = false;
    elements.searchInput.setAttribute("aria-expanded", "true");
  });

  elements.searchInput.addEventListener("keydown", handleKeydown);

  elements.clearBtn.addEventListener("click", () => {
    elements.searchInput.value = "";
    elements.clearBtn.hidden = true;
    elements.dropdown.hidden = true;
    elements.searchInput.setAttribute("aria-expanded", "false");
    elements.searchInput.removeAttribute("aria-activedescendant");
    elements.resultDiv.hidden = true;
    elements.resultDiv.innerHTML = "";
    elements.searchInput.focus();
  });

  document.addEventListener("click", (e) => {
    if (
      !elements.searchInput.contains(e.target) &&
      !elements.dropdown.contains(e.target)
    ) {
      elements.dropdown.hidden = true;
      elements.searchInput.setAttribute("aria-expanded", "false");
      elements.searchInput.removeAttribute("aria-activedescendant");
      state.currentFocus = -1;
    }
  });
}

function handleKeydown(e) {
  const items = elements.dropdown.querySelectorAll(
    ".autocomplete-item:not(.no-results)",
  );
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    state.currentFocus = (state.currentFocus + 1) % items.length;
    updateFocus(items);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    state.currentFocus = (state.currentFocus - 1 + items.length) % items.length;
    updateFocus(items);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (state.currentFocus > -1) {
      items[state.currentFocus].click();
    }
  } else if (e.key === "Escape") {
    elements.dropdown.hidden = true;
    elements.searchInput.setAttribute("aria-expanded", "false");
    elements.searchInput.removeAttribute("aria-activedescendant");
  }
}

function updateFocus(items) {
  items.forEach((item) => {
    item.classList.remove("autocomplete-active");
    item.setAttribute("aria-selected", "false");
  });

  if (state.currentFocus >= 0) {
    const activeItem = items[state.currentFocus];
    activeItem.classList.add("autocomplete-active");
    activeItem.setAttribute("aria-selected", "true");
    elements.searchInput.setAttribute("aria-activedescendant", activeItem.id);
    activeItem.scrollIntoView({ block: "nearest" });
  }
}

function renderDropdown() {
  elements.dropdown.innerHTML = "";
  const fragment = document.createDocumentFragment(); // Reduce repaints

  if (state.filteredQuals.length > 0) {
    state.filteredQuals.forEach((qual, index) => {
      const li = document.createElement("li");
      li.className = "autocomplete-item";
      li.role = "option";
      li.id = `qual-option-${index}`;

      if (state.query) {
        // Safer HTML parsing avoiding pure .innerHTML manipulation
        const regex = new RegExp(`(${state.query})`, "gi");
        const parts = qual.name.split(regex);
        parts.forEach((part) => {
          if (part.toLowerCase() === state.query) {
            const strong = document.createElement("strong");
            strong.textContent = part;
            li.appendChild(strong);
          } else {
            li.appendChild(document.createTextNode(part));
          }
        });
      } else {
        li.textContent = qual.name;
      }

      li.addEventListener("click", () => selectQualification(qual));
      fragment.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.className = "autocomplete-item no-results";
    li.role = "option";
    li.ariaDisabled = "true";
    li.textContent = "No qualifications found matching your search.";
    fragment.appendChild(li);
  }

  elements.dropdown.appendChild(fragment);
  elements.dropdown.hidden = false;
  elements.searchInput.setAttribute("aria-expanded", "true");
}

function selectQualification(qual) {
  elements.searchInput.value = qual.name;
  elements.dropdown.hidden = true;
  elements.searchInput.setAttribute("aria-expanded", "false");
  elements.searchInput.removeAttribute("aria-activedescendant");
  elements.clearBtn.hidden = false;

  const isValid = (val) => val && val !== "N/A" && val !== "0";
  const fragment = document.createDocumentFragment();

  const title = document.createElement("h4");
  title.textContent = qual.name;
  fragment.appendChild(title);

  const createItemBlock = (titleText, val, valueClass, isDivider = false) => {
    if (!isValid(val)) return;

    const block = document.createElement("div");
    block.className = `grade-block${isDivider ? " divider" : ""}`;

    const titleSpan = document.createElement("span");
    titleSpan.className = "grade-title";
    titleSpan.textContent = titleText;

    const valueSpan = document.createElement("span");
    valueSpan.className = valueClass;
    valueSpan.textContent = val;

    block.append(titleSpan, valueSpan);
    fragment.appendChild(block);
  };

  createItemBlock("Standard Entry Grades", qual.standard, "grade-value");
  createItemBlock(
    "Standard Subject Requirements",
    qual.subject_requirements_standard,
    "grade-subject",
  );
  createItemBlock("Minimum Entry Grades", qual.minimum, "grade-value", true);
  createItemBlock(
    "Minimum Subject Requirements",
    qual.subject_requirements_minimum,
    "grade-subject",
  );

  if (isValid(qual.gateway)) {
    const block = document.createElement("div");
    block.className = "grade-block divider";
    block.innerHTML = `
      <span class="grade-title" style="color:var(--text-muted);">Gateway Entry</span>
      <span class="grade-subject">${qual.gateway}</span>
    `;
    fragment.appendChild(block);
  }

  elements.resultDiv.innerHTML = ""; // Clear existing
  elements.resultDiv.appendChild(fragment);
  elements.resultDiv.hidden = false; // Triggers ARIA live region
}

// Attach function globally since it's defined in inline onclick
window.applyNow = () => {
  window.location.href = "https://www.ucas.com/";
};
