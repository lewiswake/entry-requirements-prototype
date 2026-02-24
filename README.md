# 🎓 Entry Requirements Prototypes (2026 Edition)

This repository contains a suite of interactive front-end prototypes and lightweight CMS dashboards built for the University of St Andrews Entry Requirements system. 

The prototypes demonstrate how academic and English language requirements can be dynamically managed and displayed using JSON data and a modern flexbox UI.

## 📁 Project Structure

The repository is divided into distinct modular applications, all tied together by a central hub:

* **`/` (Root)** - The main **Prototype Hub** (`index.html`) containing navigational links to all apps.
* **`/english-language-admin-dashboard`** - A CMS-style interface for staff to edit testing profiles (Direct Entry, Online, SELT, etc.) and generate updated JSON files.
* **`/english-language-requirements-checker`** - A public-facing tool for prospective students to check exact English grades needed and generate shareable links.
* **`/undergraduate-course-page`** - Example BA course page featuring the dynamic academic and English requirements widgets.
* **`/postgraduate-course-page`** - Example MLitt course page featuring PG-specific data, pathways, and the DPL Purple theme.
* **`/flags`** - A globally shared directory of SVG country flags used across the course widgets.

## 💾 Quick Data Links

The core data powering the English Language tools is stored in JSON format. You can view the master data structure here:

* 🔗 **[english-profiles.json (Admin Data)](english-language-admin-dashboard/data/english-profiles.json)**

*(Note: For the purpose of these standalone prototypes, mirrored copies of the JSON files are placed within each app's respective `/data` folder).*

## 🚀 How to Run Locally

Because these prototypes use the Javascript `fetch()` API to load the JSON data, they **cannot** simply be double-clicked and opened in a browser (this will result in a CORS error). 

They must be served via a local web server. 

**Using VS Code:**
1. Open the `entry-requirements-prototypes` folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click the root `index.html` and select **"Open with Live Server"**.

**Using Python (Terminal/Command Prompt):**
1. Navigate to the root directory in your terminal.
2. Run `python -m http.server 8000` (or `python3 -m http.server 8000`).
3. Open your browser and go to `http://localhost:8000`.
