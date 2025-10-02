# Lighthouse Playwright TypeScript Automation

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Folder Structure](#folder-structure)
- [Running Scripts](#running-scripts)
- [Scheduled Reports (GitHub Actions)](#scheduled-reports-github-actions)
- [Excel Reporting](#excel-reporting)
- [Screenshots and Diagnostics](#screenshots-and-diagnostics)
- [Utilities](#utilities)
- [Future Enhancements](#future-enhancements)

## Introduction
This project is a Playwright and TypeScript automation framework for [Lighthouse](https://developer.chrome.com/docs/lighthouse/) performance audits. It's designed to seamlessly integrate performance testing into your development and CI/CD pipelines.

The framework is capable of running Lighthouse audits on single or multiple URLs (up to 8), extracting key performance diagnostics, capturing screenshots, and generating detailed Excel reports. It provides a scalable and reusable solution for ensuring your web applications meet performance standards.

## Features
- Run Lighthouse audits in Mobile normal and incognito mode and Desktop normal and incognito mode
- Single URL or batch URL execution
- Capture key diagnostics from reports
- Save HTML, JSON, TXT, and PNG outputs
- Generate Excel reports with performance summaries
- Dynamic configuration through `lighthouse.config.ts`
- Dynamic test links through `test-url.json`
- Organized folder structure for date- and time-based runs
- CI/CD with GitHub Actions scheduled runs for automated Lighthouse reporting.

## Installation

### Prerequisites
- Node.js  
- npm  

### Verify Installations
```bash
node -v
npm -v
```

### Installation Steps

#### Clone the repository:
```bash
git clone https://github.com/avidcutlet/Lighthouse-Playwright-Typescript-Automation.git
```

#### Navigate to the project directory:
```bash
cd Lighthouse-Playwright-Typescript-Automation
```

#### Install dependencies:
```bash
npm install
```

#### Install Playwright browsers (required for screenshots)::
```bash
npx playwright install --with-deps
```

## Folder Structure
```
LIGHTHOUSE-PLAYWRIGHT-TYPESCRIPT-AUTOMATION/
├── .github/
│   └── workflows/
│       └── daily-run.yml      # GitHub Actions scheduled run configuration
│       └── cheatsheet.ts      # Contains cheatsheet for timetable conversion and cron format.
├── config/                    # Configuration files for Lighthouse.
├── data/                      # Stores urls test data.
├── reports/                   # Location where test reports (e.g., Lighthouse results) are generated.
└── lighthouse-08-03-2025-09-59-21-AM/    # A timestamped directory for a specific Lighthouse report.
    ├── html-08-03-2025-09-59-21-AM/      # Contains the HTML version of the Lighthouse report.
    ├── json/                             # Contains the raw JSON data of the Lighthouse report.
    ├── screenshots/                      # Stores screenshots captured during the Lighthouse analysis.
    ├── Website_Insights_08-03-2025-09-59-21-AM.xlsx               # Contains all the data from simplified text file summary.
    └── lighthouse-simplified-data.txt    # A simplified text file summary of the Lighthouse results.
├── scripts/            # Houses main script runners for Lighthouse (e.g., Run all or single lighthouse).
├── template/           # Houses main template used to by generated excel report.
├── utils/              # A collection of utility functions and helper files used throughout the project.
├── README.md           # Documentation file for the project (e.g., How to run single or multiple links, etc.).
└── tsconfig.json       # The configuration file for the TypeScript compiler.
```

## Running Scripts
### Run Lighthouse for a Single URL
```bash
npm run single:lighthouse
```
#### The script will:
- Run Lighthouse for the URL defined in "SingleLighthouse" data/test-url.json
- Save reports and screenshots in the reports/ folder
- Append results to Excel

### Run Lighthouse for All URLs
```bash
npm run all:lighthouse
```
#### The script will:
- Run Lighthouse for all the URLs defined in "AllLighthouse" data/test-url.json
- Save reports and screenshots in the reports/ folder
- Append results to Excel

## Scheduled Reports (GitHub Actions)
- This project includes a GitHub Actions workflow (.github/workflows/daily-run.yml) that automatically runs Lighthouse daily and pushes results to report branches.

### Accessing Reports
After forking the repository, use the following `git` commands to access the generated reports. Replace `username` with your GitHub username and the name of the Github repository `your-github-repo.git` that forked the repository.

- Today’s report only (snapshot branch, replaced daily):

```bash
git clone --branch todays-reports --single-branch https://github.com/username/your-github-repo.git
```

- Reports are updated daily at 9:35 AM PHT.

## Excel Reporting
### The framework uses ExcelJS to log performance results.
- The framework uses ExcelJS to log performance results.
- Each run appends results to the template file in /reports.
- Multiple sheets store:
  - Overall scores
  - Diagnostics
  - Audit details
- Updated template ensures formulas work correctly even when copied.


## Screenshots and Diagnostics
- First diagnostic block is captured from the HTML report.
- PNG screenshots are saved with filenames containing URL and timestamp.
- TXT files log simplified audit results with scores and paths.
- Static screenshots (Mobile-Normal).

## Utilities

- `lighthouse-runner-util.ts` → Core logic for single and batch runs.
- `excel-writer-util.ts` → Handles writing results into Excel.
- `report-path-util.ts` → Organizes output directories and filenames.
- `screenshot-util.ts` → Captures diagnostics and audits.

## Roadmap

### Future Enhancements
- Support for dynamic URL fetching without limits via text file or user input.
- Enhanced CI/CD integration with historical trend visualization.
- Option to export results in PDF format.
- Highly configurable setup with 90% dynamic configuration options.
- Scalable dynamic URL handling (supporting more than 8 URLs).
- Multiple execution modes: Default, Strict, and Retry.

### Pro Features ✨
- Intelligent screenshot capture optimized for device performance or user preferences.
- Interactive CLI prompts for a guided setup experience.
- Flexible Lighthouse run configurations (Mobile/Desktop, Normal/Incognito, and combined modes).
- Advanced Excel integration using [xlsx-populate](https://www.npmjs.com/package/@xlsx/xlsx-populate) with macro-based automation.
- Performance benchmarks matched with Google PageSpeed Insights.
- Visual report enhancements with bar and pie charts in Excel summaries.
- Easy sharing with exportable zipped result packages.
- Automatic summary sheet naming based on source page links.
- Automated daily and historical reports on a dedicated branch.
- Extended Lighthouse error handling and support.
- Advanced logging for improved debugging and error tracing.
- CI/CD integration with scheduling options for daily, weekly, or custom date-based reports.
- Codebase aligned with industry best practices.

Message me on my [LinkedIn profile](https://www.linkedin.com/in/von-webster-saikou) to learn more about our Pro plan and get access to these features.