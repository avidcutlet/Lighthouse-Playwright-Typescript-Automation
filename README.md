# Lighthouse Playwright TypeScript Automation

Automates [Google Lighthouse](https://github.com/GoogleChrome/lighthouse) using **Playwright** with **TypeScript**. This utility extracts performance scores, timestamps, screenshots, and result links for multiple URLs in both normal and incognito browser modes. Results can be appended to an Excel template and saved into organized folders for reporting and visualization.

---

## 📌 Features

- 🔁 Analyze single or multiple pages in one run
- 🧭 Supports normal and incognito browser contexts
- 📊 Extracts:
  - Lighthouse performance score (Mobile/Desktop)
  - Result date and time
  - First diagnostic block (screenshot capture)
  - Generated report links (HTML/JSON)
- 📁 Save results to:
  - Excel file (via `exceljs`)
  - Structured folders with screenshots and reports
  - Configurable paths and filenames
- 🔧 Fully scriptable — no test runner needed

---

## 🧰 Tools & Technologies

- [Lighthouse](https://github.com/GoogleChrome/lighthouse) – performance audits
- [Playwright](https://playwright.dev/) – browser automation
- `exceljs` – Excel reporting
- `fs`, `path`, `dayjs` – file and time utilities
- Optional:
  - `inquirer` or `yargs` – CLI interactions
  - `allure-playwright` – for enhanced reporting
  - `dotenv` – environment-based config values

---

## 📁 Folder Structure

```bash
LIGHTHOUSE-PLAYWRIGHT-TYPESCRIPT-AUTOMATION/
├── config/             # Configuration files for Lighthouse.
├── data/               # Stores urls test data.
├── reports/            # Location where test reports (e.g., Lighthouse results) are generated.
└── lighthouse-08-03-2025-09-59-21-AM/    # A timestamped directory for a specific Lighthouse report.
    ├── html/                             # Contains the HTML version of the Lighthouse report.
    ├── json/                             # Contains the raw JSON data of the Lighthouse report.
    ├── screenshots/                      # Stores screenshots captured during the Lighthouse analysis.
    └── lighthouse-simplified-data.txt    # A simplified text file summary of the Lighthouse results.
├── scripts/            # Houses main script runners for Lighthouse (e.g., Run all or single lighthouse).
├── utils/              # A collection of utility functions and helper files used throughout the project.
├── README.md           # Documentation file for the project (e.g., How to run single or multiple links, etc.).
└── tsconfig.json       # The configuration file for the TypeScript compiler.
```