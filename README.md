# PageSpeed Playwright Automation

Automates [Google PageSpeed Insights](https://pagespeed.web.dev/) using **Playwright** with **TypeScript**. This utility extracts performance scores, timestamps, screenshots, and result links for multiple URLs in both normal and incognito browser modes. Results can be appended to an Excel template or saved into organized folders for reporting.

---

## 📌 Features

- 🔁 Analyze multiple pages in one run
- 🧭 Supports normal and incognito browser contexts
- 📊 Extracts:
  - Performance score (mobile & desktop)
  - Result date and time
  - First diagnostic section (screenshot)
  - Final result link
- 📁 Save results to:
  - Excel file (via `exceljs`)
  - Screenshot folders
  - Configurable template paths
- 🔧 Fully scriptable — no test runner needed

---

## 🧰 Tools & Technologies

- [Playwright](https://playwright.dev/) (with TypeScript)
- `exceljs` – for Excel handling
- `fs`, `path`, `dayjs` – for file and time operations
- Optional:
  - `inquirer` or `yargs` – for CLI options
  - `allure-playwright` – for report integration
  - `dotenv` – for config values

---

## 📁 Folder Structure (Simplified)

```bash
PageSpeedInsight-Automation/
├── config/                  # Config files (e.g., URLs, settings)
├── data/                    # Excel templates
├── modules/                 # Core logic modules (no POM)
│   ├── locators/            # Element selectors
│   └── page-speed-runner.ts
├── reports/                 # Screenshots, output Excel, etc.
├── scripts/                 # Main script entry points (e.g., run-all.ts)
├── utils/                   # Helpers: Excel writer, logger, etc.
├── package.json
└── tsconfig.json
