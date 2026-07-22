
# Gramzdas Iedzīvotāju Padomes Digitālais Centrs

![Statuss](https://img.shields.io/badge/Statuss-Aktīvs-success)
![Arhitektūra](https://img.shields.io/badge/Arhitektūra-Cloud_Native-blue)
![Dizains](https://img.shields.io/badge/Dizains-Glassmorphism-orange)
![Build](https://img.shields.io/badge/Build-Pass-brightgreen)

> **Vieda komunikācija. Caurspīdīga pārvaldība. Stipra kopiena.**
>
> Atjaunināts: 2026-07-22

## 🏛️ Projekta filozofija

Gramzdas Iedzīvotāju Padomes digitālais centrs ir moderna tīmekļa platforma, kas nodrošina atklātu komunikāciju starp pagasta iedzīvotājiem un pašvaldību. Tā apvieno aktuālo informāciju, aptaujas, ideju iesniegšanu, problēmu karti un analītikas rīkus vienuviet, veicinot sabiedrības līdzdalību un caurspīdīgu pārvaldību.

### Pamatvērtības

#### Caurspīdīgums

- Katrs iedzīvotājs var redzēt, kas notiek pagastā.
- Nav slēptu procesu — informācija ir publiski pieejama.

#### Iesaiste

- Ne tikai informācijas saņemšana, bet arī aktīva līdzdalība.
- Aptaujas, balsojumi un idejas — ikvienam ir balss.

#### Efektivitāte

- Digitāla alternatīva fiziskām sanāksmēm.
- Reāllaika informācija bez kavēšanās.

#### Pieejamība

- Darbojas jebkurā ierīcē — datorā, planšetdatorā vai mobilajā tālrunī.
- Nav nepieciešama papildu programmatūra.

## ✨ Galvenās funkcijas

### 📊 Aptauju analītikas panelis

- Datu vizualizācija no Excel (XLSX) ar Chart.js
- KPI rādītāji: respondentu skaits, apmierinātība, iesaiste
- Sentimenta analīze brīvajos tekstos
- Filtrēšana pēc vecuma grupas un dzīvesvietas
- AI ģenerēti secinājumi un ieteikumi

### 🗺️ Interaktīvā problēmu karte

- Ģeolokācijas ziņojumi ar Leaflet.js un OpenStreetMap
- Precīza problēmu atzīmēšana kartē
- Datu sinhronizācija ar administrāciju

### 💡 Ideju siena ar balsošanu

- Ideju iesniegšana ar attēliem
- Like/Unlike balsojumi (LocalStorage)
- Kategoriju filtrēšana un meklēšana
- Populārāko ideju izcelšana

### ⚡ Dinamiskā ziņu josla un viedais logrīks

- Reāllaika ziņu josla (ALERT režīms)
- Aptauju logrīks ar balsošanas iespējām
- Atpakaļskaitīšanas taimeris gaidāmajiem pasākumiem
- Interaktīvas animācijas balsošanas laikā
- Nepārtraukta panorāmas ziņu plūsma no labās uz kreiso pusi

### 📱 Pilnīga adaptivitāte

- Mobile-first dizains
- Pilnekrāna prezentācijas režīms
- Optimizācija 4K un 2560p+ ekrāniem

## 🛠️ Tehniskā arhitektūra

### Tehnoloģiju kopa

#### Frontend (klienta puse)

- HTML5
- CSS3 (Custom Properties, Flexbox, Grid, animācijas)
- Vanilla JavaScript (ES6+ moduļi)
- Chart.js
- Leaflet.js
- Font Awesome
- Google Analytics 4 (GA4)

#### Backend (servera puse)

- Google Apps Script (GAS)
- Google Sheets kā datu avots
- JSONP datu sinhronizācijai
- LockService un CacheService konkurences pārvaldībai

#### Mitināšana

- GitHub Pages (statiskā daļa)
- Google Apps Script Web App (dinamiskie dati)

### Arhitektūras diagramma

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

### Datu plūsma

1. Lietotājs atver lapu → GitHub Pages piegādā statisko saturu.
2. JavaScript inicializējas → veic JSONP pieprasījumus uz GAS.
3. GAS nolasa Google Sheets datus un atgriež JSON.
4. JavaScript dinamiski izveido DOM elementus.
5. Lietotāja darbības (balsošana, ziņojumi u.c.) tiek saglabātas Google Sheets.

## 🔒 Drošība

- CORS aizsardzība ar JSONP callback pārbaudi
- Rate limiting ar LockService un CacheService
- DOMPurify sanitizācija (XSS aizsardzība)
- localStorage balstīta lietotāju identifikācija
- Publiski dati bez obligātas autentifikācijas

## ⚡ Veiktspēja

- Lazy loading ar IntersectionObserver
- GPU paātrinātas animācijas (`transform`, `opacity`)
- ES6 moduļu struktūra bez bundlera izmantošanas
- GitHub Pages CDN kešatmiņa statiskajiem resursiem

## 📁 Projekta struktūra

### Galvenās mapes

```
Ipadome_Gramzda/
├── index.html
├── style.css
├── base.css
├── scripts/
│   ├── main.js
│   ├── utils.js
│   ├── widget.js
│   ├── reallaiks.js
│   ├── aktualitates.js
│   ├── aptauja.js
│   ├── karte.js
│   ├── idejas.js
│   ├── darbi.js
│   ├── kontakti.js
│   └── ai_analysis.js
├── prezentacijas/
├── dokumenti/
├── protokols/
└── jpg/
```

## 👥 Padomes sastāvs

- **Priekšsēdētājs:** Dāvis Strazds
- **Vietniece:** Olita Biķe
- **Locekļi:** Zane Vītola, Madara Freiberga, Laura Brance

## 📊 Statistika un analītika

### Google Analytics 4

Integrēts GA4 ar tracking ID `G-71M8PT9VHP`.

**Pieejamie rādītāji:**

- Apmeklētība pa dienām un mēnešiem
- Jaunie un atkārtotie apmeklētāji
- Trafika avoti
- Populārākās lapas
- Ierīču sadalījums
- Ģeogrāfiskā statistika

### Google Search Console

Pieejama informācija par:

- Meklēšanas vaicājumiem
- Klikšķu īpatsvaru (CTR)
- Indeksēšanas statusu
- Meklēšanas rezultātu veiktspēju

### PageSpeed Insights

Veiktspējas novērtējums:

- Performance score
- Core Web Vitals (LCP, FID, CLS)
- Ieteikumi ātrdarbības uzlabošanai

## 🚀 Lokālā palaišana

### Prasības

- Moderns pārlūks (Chrome, Firefox, Edge, Safari)
- Serveris nav obligāts — projekts darbojas statiski

### Instalācija

1. Klonē repozitoriju

```bash
git clone https://github.com/dawis86/Ipadome_Gramzda.git
cd Ipadome_Gramzda
```

2. Atver `index.html` pārlūkprogrammā

```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

3. Vai izmanto Live Server (VS Code)

- Instalē paplašinājumu **Live Server**
- Atver `index.html` ar **Open with Live Server**

## ⚙️ Konfigurācija

### Google Apps Script

- API URL: `https://script.google.com/macros/s/AKfycbycb4PKQOx6PF-bpznjXo4sLE8NBaXRmW70WEmdb9ldFqskINnMorc6QUIzJm70nPhp/exec`
- Spreadsheet ID: `1LrMqfyqcjGDmOYSdIdj1S-2TIYGY_8AKUEAm-PqdakQ`

### Google Analytics

- Tracking ID: `G-71M8PT9VHP`

## 📦 Publicēšana

### GitHub Pages

Katrs `git push` automātiski publicē jaunāko versiju:

```
https://dawis86.github.io/Ipadome_Gramzda/
```

### Google Apps Script

Pēc izmaiņām GAS kodā:

1. Atver `script.google.com`
2. Izvēlies projektu
3. Veic izmaiņas
4. `Deploy` → `Manage deployments`
5. `Edit` → `New version`
6. `Deploy`

## 🧪 Testēšana

### Pārbaudes

#### Datu ielāde

- Atver `index.html`
- Pārbaudi Console logus (F12)
- Pārliecinies, ka nav 404 vai CORS kļūdu

#### Balsošana

- Atver `aktualitates.html`
- Nobalso par kādu jautājumu
- Pārbaudi rezultātu atjaunošanos

#### Karte

- Atver `karte.html`
- Pievieno jaunu punktu
- Pārbaudi, vai tas parādās kartē

#### Mobilais režīms

- Izmanto Chrome DevTools → Device Toolbar
- Pārbaudi iPhone, Android un planšetdatoru režīmus

## 🤝 Ieguldījums projektā

Ja vēlies piedalīties projekta attīstībā:

1. Fork repozitoriju
2. Izveido jaunu branch

```bash
git checkout -b feature/jauna-funkcija
```

3. Veic izmaiņas un commit

```bash
git commit -m "Pievieno jaunu funkciju"
```

4. Push izmaiņas

```bash
git push origin feature/jauna-funkcija
```

5. Izveido Pull Request

## 📄 Licence

Šis projekts ir izstrādāts Gramzdas iedzīvotāju interesēs un paredzēts kopienas digitālās līdzdalības veicināšanai.

## 📞 Kontakti

- **E-pasts:** iedzivotajupadomegramzda@gmail.com
- **Tālrunis:** +371 26482667
- **Mājas lapa:** https://dawis86.github.io/Ipadome_Gramzda/
- **GitHub:** https://github.com/dawis86/Ipadome_Gramzda

---

*Pēdējo reizi atjaunināts: 2026-07-22*
