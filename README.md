# Gramzdas Iedzīvotāju Padomes Digitālais Centrs

![Status](https://img.shields.io/badge/Statuss-Aktīvs-success)
![Tehnoloģija](https://img.shields.io/badge/AI-100%25_Generated-blueviolet)

Šis ir Gramzdas Iedzīvotāju Padomes oficiālais portāls. Tā mērķis ir nodrošināt caurspīdīgu, modernu un ērtu saziņu starp iedzīvotājiem un padomi. Projekts ir unikāls ar to, ka tas ir **pilnībā izstrādāts ar Mākslīgā Intelekta (AI) palīdzību**, neuzrakstot ar roku ne rindiņu koda.

## 🌐 Tiešsaistes Versija (Live Demo)

Portāls ir pieejams tiešsaistē: **[Apskatīt Portālu](https://dawis86.github.io/Ipadome_Gramzda/)**

## ✨ Galvenās Funkcijas

*   **📰 Dinamiskas Aktualitātes:** Ziņas tiek automātiski ielādētas no Google Sheets – nav nepieciešama programmēšana, lai pievienotu rakstus.
*   **🗺️ Problēmu Karte:** Interaktīva karte (Leaflet.js), kurā iedzīvotāji var redzēt un ziņot par problēmām (bedres, apgaismojums). Dati nāk no Google Sheets.
*   **💡 Ideju Siena:** Iespēja iesniegt idejas un balsot par tām ("Patīk" skaitītājs), izmantojot Firebase reāllaika datubāzi.
*   **⏳ Darbu Laika Līnija:** Vizuāls pārskats par padomes paveiktajiem darbiem.
*   **📊 Prezentāciju Režīms:** Iebūvēta prezentāciju sistēma ar animācijām un subtitriem sanāksmēm.

## 🛠️ Tehnoloģiskais Risinājums

Šis projekts izmanto inovatīvu "No-Code / Low-Code" pieeju datu pārvaldībai:

*   **Frontend:** HTML5, CSS3 (Glassmorphism dizains), Vanilla JavaScript.
*   **CMS (Satura vadība):** Google Sheets (publicēts kā CSV).
*   **Datubāze:** Google Sheets (lasīšanai) & Firebase Realtime Database (balsošanai).
*   **Formas:** Google Forms (ziņojumiem un idejām).
*   **Kartes:** Leaflet.js + OpenStreetMap.

## 📂 Faila Struktūra

*   `index.html` - Sākumlapa ar navigāciju un "Share" logrīku.
*   `aktualitates.html` - Ziņu siena (dati no Google Sheets).
*   `karte.html` - Problēmu karte.
*   `idejas.html` - Ideju balsošana un iesniegšana.
*   `darbi.html` - Laika līnija.
*   `/scripts/` - JavaScript loģika (katrai sadaļai savs fails).
*   `/prezentacijas/` - Arhīvs ar sanāksmju prezentācijām.

## 👥 Padomes Sastāvs

*   **Priekšsēdētājs:** Dāvis Strazds
*   **Vietniece:** Olita Biķe
*   **Locekļi:** Zane Vītola, Madara Freiberga, Laura Brance

## 🚀 Kā palaist lokāli

1.  Klonējiet repozitoriju:
    ```bash
    git clone https://github.com/dawis86/Ipadome_Gramzda.git
    ```
2.  Atveriet `index.html` pārlūkprogrammā.
    *   *Piezīme:* Lai darbotos Firebase un Google Sheets ielāde, nepieciešams interneta savienojums.

##  Kontakti

Jautājumiem un ierosinājumiem:
*   📧 **E-pasts:** iedzivotajupadomegramzda@gmail.com
*   📱 **Tālrunis:** +371 26482667

---
*Izstrādāts Gramzdas iedzīvotāju interesēs ar AI palīdzību.*