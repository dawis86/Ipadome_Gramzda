# Gramzdas Iedzīvotāju Padomes Digitālais Centrs

![Status](https://img.shields.io/badge/Statuss-Aktīvs-success)
![Tehnoloģija](https://img.shields.io/badge/Arhitektūra-Cloud_Native-blue)
![Dizains](https://img.shields.io/badge/Dizains-UX%2FUI_Premium-orange)

> **Vieda komunikācija. Caurspīdīga pārvaldība. Stipra kopiena.**

Šis ir Gramzdas Iedzīvotāju Padomes oficiālais digitālais portāls — mūsdienīgs un ilgtspējīgs risinājums pašvaldības līmeņa komunikācijai. Tas radīts, lai nodrošinātu caurspīdīgu, ērtu un efektīvu saziņu starp iedzīvotājiem un padomi, apvienojot tehnoloģiju jaudu ar praktisku lietojamību ikdienā.

## 🚀 Mūsdienīgs Digitālais Risinājums

Projekts izstrādāts, izmantojot **jaunākās digitālās pieejas un viedus izstrādes rīkus**, kas ļauj sasniegt augstāko kvalitātes standartu, elastību un ātru attīstību. Mēs esam atteikušies no smagnējām sistēmām par labu vieglai un jaudīgai arhitektūrai, kas balstīta uz *Vanilla JavaScript* un asinhronas datu apmaiņas principiem.

**Šī pieeja nodrošina:**
*   ☁️ **Efektīvu datu apriti** starp Google Cloud pakalpojumiem un lietotāja pārlūku reāllaikā.
*   🎨 **Mūsdienīgu Glassmorphism dizainu**, kas vienlīdz perfekti darbojas gan viedtālruņos, gan uz lieliem ekrāniem.
*   🌱 **Ilgtspējīgu sistēmu**, kas neprasa dārgus serveru resursus vai sarežģītu datubāžu uzturēšanu.

---

## 🌐 Tiešsaistes Piekļuve

Portāls ir pieejams šeit: **[Apskatīt Gramzdas iedzīvotāju padomes vietni](https://dawis86.github.io/Ipadome_Gramzda/)**

---

## ✨ Galvenās Funkcijas

### 📊 Aptauju Analītikas Panelis (Executive Insights)
Augsta līmeņa datu vizualizācijas rīks, kas nolasa iedzīvotāju viedokļus no Excel failiem un pārvērš tos interaktīvos grafikos. Ietver:
*   **Sentiment Analysis:** Automātiska noskaņojuma noteikšana brīvajos tekstos.
*   **KPI Tracking:** Galveno kopienas rādītāju aprēķināšana reāllaikā.
*   **Automated Insights:** AI stila secinājumu ģenerēšana par kopienas pulsu.

### 🗺️ Interaktīvā Problēmu Karte
Iespēja ērti ziņot par infrastruktūras jautājumiem (bedrēm, apgaismojumu), izmantojot karti ar precīzu ģeolokāciju. Dati tiek automātiski sinhronizēti ar administrācijas vadības paneli.

### 💡 Ideju Siena ar Balsošanu
Platforma kopienas iniciatīvām. Iedzīvotāji var iesniegt savus priekšlikumus, balsot (Like/Unlike) un sekot līdzi populārākajām idejām.

### ⚡ Dinamiskais Ticker & Smart Widget
Reāllaika ziņu josla un interaktīvi logrīki (aptaujas, reitingi), kas pielāgojas aktuālajai situācijai pagastā.

### 📱 Pilnīga Adaptivitāte & Prezentācijas Režīms
Saturs un funkcijas ir optimizētas jebkurai ierīcei — no maziem telefona ekrāniem līdz 4K projektoriem un televizoriem.

---

## 🏗️ Sistēmas Arhitektūra

Risinājums balstīts uz modernu un elastīgu tehnoloģisko bāzi, nodrošinot ātrdarbību un stabilitāti:

*   **Frontend:** HTML5, CSS3 (Modern Flex/Grid), JavaScript (ES6+ Modules).
*   **Datu vizualizācija:** [Chart.js](https://www.chartjs.org/) & [SheetJS (XLSX)](https://sheetjs.com/).
*   **Backend / Headless CMS:** Google Apps Script API & Google Sheets.
*   **Komunikācija:** JSONP protokols drošai starpdomēnu datu apmaiņai.
*   **Kartogrāfija:** [Leaflet.js](https://leafletjs.com/) ar OpenStreetMap.
*   **Drošība:** [DOMPurify](https://github.com/cure53/dompurify) (XSS aizsardzība), stingra CSP politika.

---

## 📂 Projekta Struktūra

### Galvenās sadaļas
*   **`index.html`** / **`style.css`** — Galvenā lapa (Dashboard) ar "Gudro logrīku".
*   **`aptauja.html`** / **`aptauja.css`** — Padziļinātas analītikas un rezultātu sadaļa.
*   **`aktualitates.html`** / **`aktualitates.css`** — Ziņas, paziņojumi un aptaujas.
*   **`karte.html`** / **`karte.css`** — Interaktīvā problēmu karte (Leaflet.js).
*   **`idejas.html`** / **`idejas.css`** — Ideju siena ar balsošanas funkciju.

### Loģikas moduļi (`/scripts/`)
*   **`utils.js`** — Globālās palīgfunkcijas (JSONP, sanitizācija, UID).
*   **`widget.js`** — Aptauju un paziņojumu dzinējs.
*   **`aptauja.js`** — Datu apstrādes, analīzes un vizualizācijas loģika.
*   **`main.js`** — Galvenās lapas dinamikas un paziņojumu pārvaldība.

---

## 👥 Padomes Sastāvs

*   **Priekšsēdētājs:** Dāvis Strazds
*   **Vietniece:** Olita Biķe
*   **Locekļi:** Zane Vītola, Madara Freiberga, Laura Brance

---

## 🚀 Lokālā palaišana un izstrāde

1.  **Klonējiet repozitoriju:**
    `git clone https://github.com/dawis86/Ipadome_Gramzda.git`
2.  **Atveriet mapi:** `cd Ipadome_Gramzda`
3.  **Palaidiet vietni:**
    Atveriet `index.html` savā pārlūkprogrammā.

---

## 📩 Kontakti

*    **E-pasts:** iedzivotajupadomegramzda@gmail.com
*   📱 **Tālrunis:** +371 26482667

---
*Radīts Gramzdas kopienai — ar skatu nākotnē un cieņu pret vietējo vidi.*