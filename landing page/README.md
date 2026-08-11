# AI-Preneur Workshops — Landing Page + Signup Panel

A visual landing page for AI workshops in Lusaka (Meanwood Ndeke) with a **built-in admin panel** that shows everyone who signed up and lets you download the list as an **Excel (.xlsx)** or **CSV** file. Runs on XAMPP with PHP + SQLite — no MySQL or external services required.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Landing page (hero, courses, schedule, location, signup form) |
| `assets/style.css` | All styling |
| `assets/script.js` | Form validation + submits signups to the backend |
| `api/submit.php` | Saves each signup into the SQLite database |
| `includes/db.php` | Database connection + creates the `signups` table automatically |
| `includes/export.php` | Generates the CSV / Excel (`.xlsx`) downloads |
| `admin/index.php` | The admin panel: login, view signups, delete, export buttons |
| `admin/export.php` | Handles the CSV / Excel download requests |
| `admin/config.php` | Admin username + password (change before going live!) |
| `apps-script/Code.gs` | Optional: Google Sheets collector (see below) |

## What the signup form collects

- Full Name, Email, Phone Number
- Evening classes or Weekend classes
- Profession
- Level choice: L1 Beginner or L2 Advanced
- Optional message (AI experience / advanced-tool interests)

## Getting started

1. The files are already in `C:\xampp\htdocs\landing page`, so start XAMPP's **Apache**.
2. Open **`http://localhost/landing%20page/`** to view the landing page.
3. Open **`http://localhost/landing%20page/admin/`** to open the admin panel.

### Admin panel

- **Login:** username `admin`, password `change-me-please` (default).
- **Change the password first:** open `admin/config.php` and edit `ADMIN_PASSWORD`.
- The panel shows stats (total, evening/weekend, L1/L2) and the full table of signups.
- Use the **Download CSV** and **Download Excel (.xlsx)** buttons to export the list.
- Each row has a delete button (asks for confirmation).

### How data flows

`landing page form → api/submit.php → data/signups.sqlite → admin panel + Excel export`

No configuration needed — the database file is created automatically on first submit. Keep the `data/` folder writable by PHP (default on XAMPP/Windows).

## Optional: also store a copy in Google Sheets

1. Create a Google Sheet, open **Extensions → Apps Script**, paste the contents of `apps-script/Code.gs`, and save.
2. **Deploy → New deployment → Web app**: Execute as *Me*, access *Anyone*. Copy the `/exec` URL.
3. Paste it into `APPS_SCRIPT_URL` at the top of `assets/script.js`.

The form now saves to the local backend **and** to Google Sheets. If the Sheets call ever fails, the local save is still used.

## Deploying to Vercel (live website)

Vercel can't run PHP or SQLite, so on Vercel the signups are saved to **Google Sheets** via the Apps Script (below). The local admin panel keeps working on XAMPP; online, the Google Sheet is your record.

The project is already configured — Vercel will only deploy the static site (`index.html`, `assets/`, `vercel.json`, and images). The PHP backend folders are excluded via `.vercelignore`.

**Step 1 — Connect signups to Google Sheets (do this first):**
1. Create a Google Sheet. Open **Extensions → Apps Script**.
2. Paste the contents of `apps-script/Code.gs` and save.
3. **Deploy → New deployment → Web app**: Execute as *Me*, access *Anyone*. Copy the `/exec` URL.
4. Paste it into `APPS_SCRIPT_URL` at the top of `assets/script.js`.

**Step 2 — Deploy:**
- **Easiest (no install):** put this folder in a GitHub repo (the `.vercelignore` keeps the PHP files out automatically). In Vercel, click **Add New → Project**, import the repo, and it builds as a static site. You're live in ~1 minute.
- **CLI:** run `npm i -g vercel`, then `vercel` inside this folder, and answer the prompts (`vercel --prod` for production).

**Step 3 — Verify:** submit the signup form on the live URL, then check your Google Sheet for the new row.

> Note: the `apps-script/` folder itself is not deployed — the Apps Script code runs from Google, not Vercel. That's expected.

## Security notes

- Anyone who can open `http://localhost/landing%20page/admin/` will see a login screen — but the panel is only as secure as your password. **Change `ADMIN_PASSWORD` in `admin/config.php`.**
- The `/admin` pages are not protected against snooping if you deploy this to a shared host; consider adding a `.htaccess` password for extra safety if you put it online.
- Keep `data/` (contains the signup database) out of public browsing if you deploy publicly.

## Customisation

- Contact details / phone: edit the relevant text in `index.html`.
- `README.md`'s email placeholder: update `admin@example.com` references in your own copy of this doc.