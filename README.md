# Gramzdas Iedzīvotāju Padodes Digitālais Centrs

![Status](https://img.shields.io/badge/Statuss-Aktīvs-success)
![Tehnoloģija](https://img.shields.io/badge/Arhitektūra-Cloud_Native-blue)
![Dizains](https://img.shields.io/badge/Dizains-Glassmorphism-orange)

> **Vieda komunikācija. Caurspīdīga pārvaldība. Stipra kopiena.**

## 🌐 Tiešsaistes Piekļuve
[https://dawis86.github.io/Ipadome_Gramzda/](https://dawis86.github.io/Ipadome_Gramzda/)

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

### 📱 Pilnīga Adaptivitāte
- Mobile-first dizains
- Prezentācijas režīms pilnekrānā
- 4K/2560p+ ekrānu optimizācija

## 📂 Projekta Struktūra

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
| `paldies.html` | Patecīas pēc darbības |

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
| `paldies.css` | Patecīas lapas |

### Skripti (`/scripts/`)
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
| `fallback_data.js` | Rezerves aptaujas dati (~80 rindas) |

### Prezentācijas (`/prezentacijas/2026-marts/`)
| Fails | Funkcija |
|-------|----------|
| `index.html` | Prezentācijas sākumlapa |
| `style.css` | Kopējie prezentācijas stili |
| `prezentacija2.html` | Aptauju rezultātu prezentācija |
| `prezentacija2.css` | Prezentācijas dizains |
| `prezentacija2.js` | Datu vizualizācija pie chart |

### Resursi
| Mape/Fails | Saturs |
|------------|--------|
| `dokumenti/Attistibas_programma.pdf` | Ilgtspējīgas attīstības programma |
| `dokumenti/likumi_lv_360317_04.09.2025__lv.pdf` | Likumi un normas |
| `protokols/` | Sēžu protokoli (PDF, DOCX) |
| `jpg/fons.jpg` | Fonattēls |
| `jpg/prezentacija2.png` | Prezentācijas preview |
| `.cursor/mcp.json` | Makro konfigurācija |
| `.mcp.json` | MCP konfigurācija |

## 👥 Padodes Sastāvs
- **Priekšsēdētājs:** Dāvis Strazds
- **Vietniece:** Olita Biķe
- **Locekļi:** Zane Vītola, Madara Freiberga, Laura Brance

## 🚀 Lokālā palaišana
1. Lejupielādējiet repozitoriju vai klonējiet
2. Atveriet `index.html` pārlūkprogrammā
3. Visas funkcijas strādā statiski

## 📩 Kontakti
- **E-pasts:** iedzivotajupadomegramzda@gmail.com
- **Tālrunis:** +371 26482667