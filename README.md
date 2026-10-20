# BAC Connect — School Issues Reporting System

A responsive front-end prototype built with **HTML, CSS and vanilla JavaScript**.

## Run it
1. Download and extract `bac_school_reporting_system.zip`.
2. Open `index.html` in a modern browser. No build tools are required.
3. Try switching between Student, SRC and School Management using the selector in the top-right corner.
4. Submit a report, change its status as SRC/Management, add a management response, and submit feedback.

## Features
- Welcome page and responsive navigation
- Seven report categories
- Quick-report and formal-letter options
- PDF, DOC and DOCX file selection with a 5 MB client-side size check
- Demo report tracking and reference numbers
- Role-based demonstration controls for students, SRC and school management
- Status updates and management responses
- Feedback ratings and comments
- Browser `localStorage` persistence

## Important prototype limitations
This is a **front-end demonstration**, not a live school reporting service. Reports, statuses, responses and feedback are stored in the browser where they are entered. They are not shared between users or computers. The selected attachment's name is recorded, but its contents are not uploaded or saved.

For real use, add a secure backend/API and database, server-side file storage, authentication and role permissions. Protect confidential reports, validate uploads on the server, and establish a privacy/retention policy. Do not use this prototype for urgent health, safety or emergency reports.
