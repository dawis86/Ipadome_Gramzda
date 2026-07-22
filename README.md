# Gramzdas Iedzīvotāju Padodes Digitālais Centrs

![Status](https://img.shields.io/badge/Statuss-Aktīvs-success)
![Tehnoloģija](https://img.shields.io/badge/Arhitektūra-Cloud_Native-blue)
![Dizains](https://img.shields.io/badge/Dizains-Glassmorphism-orange)
![Build](https://img.shields.io/badge/Build-Pass-brightgreen)

> **Vieda komunikācija. Caurspīdīga pārvaldība. Stipra kopiena.**
> 
> Gets data: 2026-07-22T22:43:28+03:00

## 🏛️ Projekta Filozofija

Gramzdas digitālais centrs ir vairāk nekā mājas lapa – tas ir **iedzīvotāju balss platforma**, kas samazina attālumu starp pagasta iedzīvotājiem un pārvaldi.

### Pamatvērtības

**Caurspīdīgums**
- Katrs iedzīvotājs var skatīties, kas notiek pagastā
- Nav slēptu procesu – viss ir publiski pieejams

**Iesaiste**
- Ne tikai informācijas uzņemšana, bet arī līdzdalība
- Aptaujas, balsis, idejas – katram balss

**Efektivitāte**
- Digitālā alternatīva fiziskām sanāksmēm
- Reāllaika informācija bez kavēšanās

**Pieejamība**
- Darbojoties jebkurā ierīcē – desktop, tablet, mobile
- Nav nepieciešama papildus programmatūra

## ✨ Galvenās Funkcijas

### 📊 Aptauju Analītikas Panelis
- Datu vizualizācija no Excel (XLSX) ar Chart.js
- KPI rādītāji: respondenti, apmierinātība, iesaiste
- Sentiment analīze brīvajos tekstos
- Filtrēšana pēc vecuma grupas un dzīvesvietas
- AI stila secinājumi

### 🗺️ Interaktīvā Problēmu Karte
- Ģeolokācijas ziņošana ar Leaflet.js/OpenStreetMap
- Bērnu/aktīvo cilpu ziņošana ar precizitāti klajā
- Datu sinhronizācija ar administrāciju

### 💡 Ideju Siena ar Balsošanu
- Ideju iesniedzēšana ar vizuālu ievadu
- Like/Unlike balsu skaitīšana (LocalStorage)
- Kategoriju filtrēšana un meklēšana
- Top ideju izcelšana

### ⚡ Dinamisks Ticker & Smart Widget
- Reāllaika ziņu josla (ALERT tipa)
- Aptauju widget ar balsu iespēju
- Countdown timer nākotnēs pasākumiem
- WOW efekti balsošanas brīdī
- **Reāllaika panoramikas josla** – nepārtraukts teksta plūdums no labās uz kreiso

### 📱 Pilnīga Adaptivitāte
- Mobile-first dizains
- Prezentācijas režīms pilnekrānā
- 4K/2560p+ ekrānu optimizācija

## 🛠️ Tehniskā Arhitektūra

### Stack

**Frontend (Clientside)**
- HTML5, CSS3 (Custom Properties, Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+ modules)
- Chart.js (datu vizualizācija)
- Leaflet.js (interaktīvā karte)
- Font Awesome (ikonogrāfija)
- Google Analytics 4 (GA4)

**Backend (Serverside)**
- Google Apps Script (GAS)
- Google Sheets kā datu avots
- JSONP protokols datu sinhronizācijai
- LockService & CacheService (concurrency management)

**Hosting**
- GitHub Pages (statiskais hosting)
- Google Apps Script Web App (dinamiskie dati)

### Arhitektūras Diagramma

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Pārlūks    │────▶│  GitHub      │────▶│  Static Files   │
│  (Client)   │     │  Pages       │     │  HTML/CSS/JS    │
└─────────────┘     └──────────────┘     └─────────────────┘
        │                                        │
        │            ┌──────────────┐            │
        └───────────▶│  Google      │◀───────────┘
                     │  Apps Script │
                     └──────────────┘
                              │
                     ┌──────────────┐
                     │  Google      │
                     │  Sheets      │
                     └──────────────┘
```

### Datu Plūsma

1. **Lietotājs atver lapu** → GitHub Pages piegādā statisko saturu
2. **JS inicializējas** → Veic JSONP pieprasījumus uz GAS
3. **GAS apstrādā** → Nolasa Google Sheets, atgriež JSON
4. **JS renderē** → Dinamiski izveido DOM elementu
5. **Lietotājs mijiedarbojas** → Balsošana, ziņas utt. → GAS raksta atpakaļ Sheets

### Drošība

- **CORS aizsardzība**: JSONP callback verificēšana
- **Rate limiting**: LockService + CacheService
- **Sanitizācija**: DOMPurify (XSS aizsardzība)
- **UID identifikācija**: localStorage-based visitor tracking
- **Autentificēšana**: Nav nepieciešama – publiski dati

### Veiktspēja

- **Lazy loading**: IntersectionObserver observero elementu redzamību
- **GPU acceleration**: `transform` un `opacity` animācijas
- **Moduļu struktūra**: ES6 imports, bez bundler nepieciešamības
- **Caching**: Statiskie resursi GitHub Pages CDN

## 📁 Projekta Struktūra

### Galvenās mapes

```
Ipadome_Gramzda/
├── index.html                  # Galvenā lapa (SPA-style)
├── style.css                   # Globālie stili
├── base.css                    # CSS mainīgie, reset
├── scripts/                    # Klienta puses loģika
│   ├── main.js                 # Galvenā inicializācija
│   ├── utils.js                # Palīgfunkcijas (JSONP, sanitizācija)
│   ├── widget.js               # Smart widget dzinējs
│   ├── reallaiks.js            # Reāllaika panoramikas josla
│   ├── aktualitates.js         # Ziņu lapa
│   ├── aptauja.js              # Aptauju analītika
│   ├── karte.js                # Interaktīvā karte
│   ├── idejas.js               # Ideju siena
│   ├── darbi.js                # Darbu sekcija
│   ├── kontakti.js             # Kontakti
│   ├── ai_analysis.js          # AI analīze
│   └── ...
├── apresentacijas/             # Prezentācijas
├── dokumenti/                  # PDF dokumenti
├── protokols/                  # Sanāksmju protokoli
└── jpg/                        # Attēli
```

### HTML lapas

| Fails | Funkcija |
|-------|----------|
| `index.html` | Galvenā lapa ar dashboard |
| `aptauja.html` | Analītikas panelis ar grafikiem |
| `aktualitates.html` | Ziņas, paziņojumi, aptaujas |
| `karte.html` | Interaktīvā problēmu karte |
| `idejas.html` | Ideju siena ar balsu skaitīšanu |
| `darbi.html` | Darba rezultāti un plāni |
| `arhivs.html` | Dokumentu arhīvs |
| `kontakti.html` | Kontaktinformācija |
| `aptaujaforma.html` | Aptaujas forma |
| `paldies.html` | Pateicības lapa |

### CSS stilia faili

| Fails | Funkcija |
|-------|----------|
| `base.css` | Globālie stili, mainīgie, animācijas |
| `style.css` | Galvenās lapas dizains |
| `styleGalvena.css` | Alternatīva galvenās lapas versija |
| `aptauja.css` | Analītikas panelis stili |
| `aptaujaforma.css` | Aptaujas formas stili |
| `aktualitates.css` | Ziņu sadaļa |
| `karte.css` | Interaktīvā karte |
| `idejas.css` | Ideju siena |
| `darbi.css` | Darba rezultāti |
| `arhivs.css` | Arhīva lapas |
| `kontakti.css` | Kontakti |
| `paldies.css` | Pateicības lapas |

### Skripti

| Fails | Funkcija |
|-------|----------|
| `utils.js` | JSONP, sanitizācija, UID, cookie banner |
| `widget.js` | Aptauju un countdown widget dzinējs |
| `aptauja.js` | Datu apstrāde, analīze, Chart.js integrācija |
| `main.js` | Particles efekts, share widget, datu ielāde |
| `ai_analysis.js` | Viedā analīze un ieteikumi |
| `aktualitates.js` | Ziņu lapa loģika |
| `darbi.js` | Darbi lapas loģika |
| `karte.js` | Interaktīvā karte un ģeolokācija |
| `kontakti.js` | Kontakti valodas apmaiņa |
| `script.js` | Vecākās funkcijas |
| `fallback_data.js` | Rezerves aptaujas dati |
| `reallaiks.js` | Reāllaika panoramikas josla |

### Resursi

| Mape/Fails | Saturs |
|------------|--------|
| `dokumenti/Attistibas_programma.pdf` | Ilgtspējīgas attīstības programma |
| `dokumenti/likumi_lv_360317_04.09.2025__lv.pdf` | Likumi un normas |
| `protokols/` | Sēžu protokoli (PDF, DOCX) |
| `jpg/fons.jpg` | Fonattēls |
| `jpg/prezentacija2.png` | Prezentācijas preview |

## 👥 Padodes Sastāvs

- **Priekšsēdētājs:** Dāvis Strazds
- **Vietniece:** Olita Biķe
- **Locekļi:** Zane Vītola, Madara Freiberga, Laura Brance

## 📊 Statistikas un Analītika

### Google Analytics 4

Mājas lapā ir integrēta **Google Analytics 4 (GA4)** ar tracking ID `G-71M8PT9VHP`.

**Pieejamie metriki:**
- **Apmeklētība**: viktorīna, diena, mēnesis
- **Lietotāji**: jauni vs. atkārtoti apmeklētāji
- **Avoti**: no kurienes nāk lietotāji (Facebook, Google, tieši)
- **Lapas**: kuras lapas visvairāk apmeklētas
- **Ierīces**: desktop vs. mobile dalījums
- **Ģeogrāfija**: no kurienes nāk apmeklētāji

**Kur apskatīt:**
1. Dodieties uz [analytics.google.com](https://analytics.google.com)
2. Izvēlies "Gramzdas iedzīvotāju padome" īpašību
3. Pārskati "Reports" sadaļu

### Google Search Console

Lapa ir indeksēta Google. Vari apskatīt:
- **Meklēšanas vaicājumi**: kādus vārdus lietotāji izmanto, lai atrastu tevi
- **Klikšķu ātrums (CTR)**: cik reižu tava lapa parādās meklēšanā
- **Indeksēšanas status**: kuras lapas Google indeksējis

**Kur atrast:** [search.google.com/search-console](https://search.google.com/search-console)

### PageSpeed Insights

Lapas ātruma novērtējums:
- **Performance score**: cik ātri lapa ielādējas
- **Core Web Vitals**: LCP, FID, CLS metrikas
- **Ieteikumi**: kā uzlabot ātrumu

**URL:** [pagespeed.web.dev](https://pagespeed.web.dev)

## 🚀 Lokālā Palaišana

### Prasības
- Moderns pārlūks (Chrome, Firefox, Edge, Safari)
- Nav nepieciešams serveris – viss strādā statiski

### Instalācija

1. **Klonē repozitoriju**
   ```bash
   git clone https://github.com/dawis86/Ipadome_Gramzda.git
   cd Ipadome_Gramzda
   ```

2. **Atver `index.html` pārlūkprogrammā**
   ```bash
   # Windows
   start index.html
   
   # Mac
   open index.html
   
   # Linux
   xdg-open index.html
   ```

3. **Vai izmanto Live Server (VS Code)**
   - Instalē "Live Server" paplašinājumu
   - Noklikšķini uz `index.html` → "Open with Live Server"

### Konfigurācija

**Google Apps Script:**
- API URL: `https://script.google.com/macros/s/AKfycbycb4PKQOx6PF-bpznjXo4sLE8NBaXRmW70WEmdb9ldFqskINnMorc6QUIzJm70nPhp/exec`
- Spreadsheet ID: `1LrMqfyqcjGDmOYSdIdj1S-2TIYGY_8AKUEAm-PqdakQ`
- Cilnes: `aktualitates`, `darbi`, `idejas`, `karte`, `aptauja`, `widget_config`, `balsis`, `reallaiks`

**Google Analytics:**
- Tracking ID: `G-71M8PT9VHP`
- Konfigurēts `index.html` galvenē

## 📦 Deployment

### GitHub Pages (Automātiski)

Katru `git push` automatizēti deployojas uz:
```
https://dawis86.github.io/Ipadome_Gramzda/
```

### Google Apps Script (Manuāli)

Kad tiek veiktas izmaiņas GAS kodā:

1. Atver [script.google.com](https://script.google.com)
2. Izvēlies projektu `1z6z9zhGR89XOydR7vcXtkH-MsowyCUL8vwj_l8kWnRypeMDI-WC4HigI`
3. Veic izmaiņas kodā
4. **Deploy** → **Manage deployments**
5. Spied **Edit** pie esošā deployment
6. Spied **New version**
7. **"As who"**: Me
8. **"Who has access"**: Anyone, even anonymous
9. Spied **Deploy**

**PIEZĪME:** Nemaini `/exec/...` URL – tas paliek tas pats.

## 🧪 Testēšana

### Manuālā testēšana

1. **Datu ielāde**
   - Atver `index.html` pārlūkā
   - F12 → Console
   - Pārbaudi, vai nav `404` vai `CORS` kļūdas
   - Pārbaudi, vai josla parādās un slīd

2. **Balsošana**
   - Atver `aktualitates.html`
   - Balsoti kāds jautājums
   - Pārbaudi, vai rezultāti parādās

3. **Karte**
   - Atver `karte.html`
   - Pievieno jaunu punktu
   - Pārbaudi, vai punkts parādās kartē

4. **Mobilais**
   - Atver Chrome DevTools → Toggle device toolbar
   - Pārbaudi uz iPhone, Android, Tablet
   - Pārbaudi skrolleri un pogas

## 🤝devorta

Vēlies piedāvāt izmaiņas?

1. **Fork** repo
2. Izveido jaunu branch: `git checkout -b feature/jauna-funkcija`
3. Veic izmaiņas un commit: `git commit -m "Pievieno jaunu funkciju"`
4. Push: `git push origin feature/jauna-funkcija`
5. Atver **Pull Request**

## 📄 License

Šis projekts ir izstrādāts Gramzdas iedzīvotāju interesēs.

## 📞 Kontakti

- **E-pasts:** iedzivotajupadomegramzda@gmail.com
- **Tālrunis:** +371 26482667
- **Mājas lapa:** [https://dawis86.github.io/Ipadome_Gramzda/](https://dawis86.github.io/Ipadome_Gramzda/)
- **GitHub:** [https://github.com/dawis86/Ipadome_Gramzda](https://github.com/dawis86/Ipadome_Gramzda)

---

*Pēdējo reizi atjaunināts: 2026-07-22*
