# Brighton House microsite

A premium one-page microsite for Brighton House (Anabia Infrastructure Pvt. Ltd., Surajpur, Greater Noida).
Built with **React 19** and a small custom **WebGL 3D engine** for the interactive site model.
No 3D library (three.js) is needed, so the whole page is about 300 KB.

## What is on the page

Hero with a live 3D model, overview, why Brighton House, ready-to-move towers, homes and prices,
an interactive 3D site explorer (day, dusk and night, tap a tower), plans, amenities, a day-in-the-life
section, location and connectivity, developer, FAQ, enquiry form, call and WhatsApp buttons,
a sticky mobile action bar and a RERA footer.
The page opens with a "3D buffer" screen: a tower fills floor by floor while the model really builds.

## Run it on your computer

You need Node.js 18 or newer (https://nodejs.org).

```
npm install
npm run dev          # opens a live-reloading preview at http://localhost:5173
npm run build        # production site in the dist/ folder (index.html + assets/)
npm run build:single # the whole site inside ONE file: dist-single/index.html
```

Upload the contents of `dist/` to any hosting (or send `dist-single/index.html` as it is).

## Where to change things

Almost everything you will ever edit is in one file: **`src/config/site.js`**.
Prices, sizes, tower names, amenities, travel times, FAQ answers and all text live there.
Change a line, save, and the page updates.

Things the project document did not contain are marked `>>> ADD <<<` in that file.
Fill these in before the site goes live:

| What | Where in `site.js` | What happens until you add it |
| --- | --- | --- |
| Phone number | `contact.phone` and `contact.phoneDisplay` | Call buttons become "enquire" buttons |
| WhatsApp number | `contact.whatsapp` (digits with country code, e.g. `919876543210`) | WhatsApp buttons become "enquire" buttons |
| UP RERA number | `rera.number` | Footer and FAQ say registration details are shared on request |
| Lead destination | `lead.endpoint` (Google Apps Script, Zapier or CRM webhook URL) | Form works in preview mode and sends nothing |
| Brochure link | `lead.brochureUrl` (a PDF link, or put the PDF in `public/`) | The visitor's brochure request is saved as a lead, but no download button is shown |
| Developer story | `developer.story` and `developer.facts` | The Developer section stays hidden |

Each enquiry is sent as JSON with: what they asked for (visit, brochure, price...), name, phone, email, home type, preferred slot, project name, page address and time.

## Photos, plans and brochure

Put real files in the `public/` folder (for example `public/brochure.pdf`). Everything in `public/`
is copied next to the built page. The 3D model is a schematic of the community, **not an approved
site plan and not to scale**, and the plan previews are illustrations. Replace them with real renders
and plans when you have them.

## Folder guide

```
src/config/site.js     all content and numbers
src/components/        page sections (Top, Homes, Explorer, Lifestyle, Location, Closing...)
src/three-d/           the custom 3D engine, scene, shaders and camera
src/styles.css         all styling (colours are variables at the top)
scripts/               build and dev scripts (esbuild)
public/                your own files (brochure, images)
```

## Notes

* Travel times are indicative. Metro and rapid-rail links are shown as upcoming or proposed.
* The 3D view needs WebGL. If a phone cannot run it, the page shows a simple skyline picture instead
  and everything else still works.
* The 3D engine was tested in Chrome. Please test once on your own phones and on Safari before launch.
