# Gramzdas Iedzīvotāju Padomes Digitālais Centrs

![Statuss](https://img.shields.io/badge/statuss-ražīgs-success)
![Arhitektūra](https://img.shields.io/badge/arhitektūra-serverless_cloud-blue)
![Drošība](https://img.shields.io/badge/drošība-GDPR_compliant-green)
![Versija](https://img.shields.io/badge/versija-2.0.0-purple)

---

# 1. Projekta filozofija un vērtības

## 1.1. Filozofiskais pamats

Gramzdas Iedzīvotāju Padomes Digitālais Centrs ir veidots kā atvērta, caurspīdīga un iedzīvotāju līdzdalību veicinoša digitālā platforma.

Platformas pamatā ir trīs galvenās vērtības:

- caurspīdīgums;
- iesaiste;
- pieejamība.

---

## Caurspīdīgums

Sabiedrībai ir tiesības zināt, kas notiek tās teritorijā un kā tiek pieņemti lēmumi.

Platformas pamatprincips:

> "Publisks viss, izņemot personas datus."

Visi publiskie procesi, lēmumi, aktivitātes un paveiktie darbi tiek atspoguļoti pieejamā un saprotamā veidā.

Mērķis ir radīt uzticību starp iedzīvotājiem un padomi, nodrošinot iespēju ikvienam sekot līdzi notikumiem.

---

## Iesaiste

Digitālais centrs nav tikai informācijas publicēšanas vietne.

Tā ir līdzdalības platforma, kas ļauj iedzīvotājiem:

- iesniegt priekšlikumus;
- balsot par idejām;
- piedalīties aptaujās;
- ziņot par problēmām;
- sekot līdzi padomes darbībai.

---

## Pieejamība

Platforma darbojas bez papildu programmatūras instalēšanas.

Tā ir pieejama:

- datoros;
- planšetēs;
- mobilajās ierīcēs.

Sistēma ir veidota tā, lai samazinātu digitālo plaisu un nodrošinātu vienlīdzīgu piekļuvi dažādām sabiedrības grupām.

---

# 1.2. Pamatprincipi

## Nav reklāmas

Platforma nav pakļauta komerciālām interesēm.

Tās galvenais mērķis ir sabiedrības informēšana un līdzdalības veicināšana.

---

## Nav obligātas reģistrācijas

Lietotājiem nav nepieciešams izveidot kontu.

Tas samazina personas datu apjomu un vienkāršo platformas izmantošanu.

---

## Atvērts kods

Projekta struktūra ir pārskatāma un paredz iespēju kopienai iesaistīties sistēmas attīstībā.

---

# 2. Mērķis un uzdevumi

## 2.1. Galvenais mērķis

Izveidot centralizētu, automātiski atjaunojamu un publiski pieejamu digitālo platformu, kas apvieno:

- informāciju no administratīvās pārvaldības procesiem;
- iedzīvotāju viedokļu apkopošanu;
- sabiedrības līdzdalības rīkus;
- aktuālo notikumu atspoguļošanu;
- balsošanas un aptauju sistēmas.

---

# 2.2. Funkcionālie moduļi

| Modulis                         | Funkcija                                                   |
| ------------------------------- | ---------------------------------------------------------- |
| **Reāllaika josla**      | Automātiska informācijas plūsma no Google Sheets datiem |
| **Ziņu siena**           | Aktualitāšu un paziņojumu publicēšana                 |
| **Interaktīvā karte**   | Problēmu un ierosinājumu atzīmēšana kartē            |
| **Balsu sistēma**        | Iedzīvotāju balsošana par idejām un jautājumiem       |
| **Aptauju panelis**       | Aptauju rezultātu attēlošana un analīze                |
| **Prezentāciju arhīvs** | Sanāksmju materiālu un dokumentu pieejamība             |
| **Ideju siena**           | Sabiedrības priekšlikumu iesniegšana un izvērtēšana  |
| **Darbu sadaļa**         | Padomes paveikto darbu publisks pārskats                  |

---

# 2.3. Ne-funkcionālās prasības

## Veiktspēja

Prasības:

- lapas ielādes laiks mazāks par 2 sekundēm 3G tīklā;
- optimizēta darbība mobilajās ierīcēs;
- minimāls datu patēriņš.

---

## Pieejamība

Platforma paredzēta atbilstoši:

- WCAG 2.1 AA principiem;
- responsīvam dizainam;
- dažādām ierīču platformām.

---

## Drošība

Sistēma paredz aizsardzību pret:

- XSS uzbrukumiem;
- CSRF pieprasījumiem;
- ļaunprātīgu datu ievadi;
- neatļautu piekļuvi.

---

## Mērogojamība

Arhitektūra paredz iespēju apkalpot līdz 1000 vienlaicīgus lietotājus bez būtiskas veiktspējas samazināšanās.

---

# 3. Mājas lapas struktūra

## 3.1. Galvenais izkārtojums

```
┌───────────────────────────────────────┐
│     Reāllaika informācijas josla      │
├───────────────────────────────────────┤
│                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ Karte  │ │Aptaujas│ │ Idejas │    │
│  └────────┘ └────────┘ └────────┘    │
│                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ Darbi  │ │ Ziņas  │ │Kontakti│    │
│  └────────┘ └────────┘ └────────┘    │
│                                       │
└───────────────────────────────────────┘
```

---

# 3.2. Sadaļu apraksts

## Galvenā lapa (`index.html`)

Galvenā platformas ieejas vieta.

Tajā pieejami:

- aktuālie paziņojumi;
- reāllaika josla;
- galvenie līdzdalības rīki;
- ātrās piekļuves sadaļas.

---

## Aptauju analītika (`aptauja.html`)

Sadaļa paredzēta:

- aptauju rezultātu attēlošanai;
- diagrammām;
- statistikai;
- sabiedrības viedokļu analīzei.

---

## Ziņas un aktualitātes (`aktualitates.html`)

Informācijas kanāls, kurā tiek publicēti:

- jaunumi;
- paziņojumi;
- pasākumi;
- dokumenti;
- svarīga informācija.

---

## Interaktīvā karte (`karte.html`)

Ģeolokācijas modulis, kas ļauj:

- ziņot par problēmām;
- norādīt atrašanās vietu;
- sekot risinājuma statusam.

---

## Ideju siena (`idejas.html`)

Sabiedrības priekšlikumu platforma.

Iespējas:

- iesniegt idejas;
- balsot;
- komentēt;
- noteikt prioritātes.

---

## Darbi (`darbi.html`)

Publisks pārskats par:

- paveiktajiem darbiem;
- projektiem;
- sasniegumiem;
- attīstības virzieniem.

---

## Kontakti (`kontakti.html`)

Oficiālais saziņas kanāls starp iedzīvotājiem un padomi.

---

# 3.3. Lietotāja pieredzes plūsma

```
Atvēršana
    ↓
Reāllaika informācijas josla
    ↓
Galvenā sadaļa
    ↓
Izvēlētais modulis
    ↓
Lietotāja darbība
```

Platformas izmantošanai nav nepieciešami lietotāja akreditācijas dati.

Anonīmai tehniskai identifikācijai tiek izmantots lokāls UID, kas tiek glabāts pārlūkprogrammas `localStorage`.

UID:

- nav piesaistīts personas identitātei;
- netiek izmantots izsekošanai;
- paredzēts tikai tehniskai funkciju kontrolei.

# 4. Tehniskā arhitektūra

## 4.1. Sistēmas arhitektūra

Gramzdas Iedzīvotāju Padomes Digitālais Centrs izmanto serverless arhitektūru, kur statiskais saturs un dinamiskie dati tiek nodalīti.

Galvenie komponenti:

- klienta puse (Frontend);
- Google Apps Script backend;
- Google Sheets datu glabātuve;
- GitHub Pages hosting vide.

---

## Sistēmas shēma

```
┌──────────────────────┐
│                      │
│      Lietotājs       │
│      Browser         │
│                      │
└──────────┬───────────┘
           │
           │ HTTPS
           ▼
┌──────────────────────┐
│                      │
│   GitHub Pages       │
│   HTML/CSS/JS        │
│                      │
└──────────┬───────────┘
           │
           │ JSON pieprasījumi
           ▼
┌──────────────────────┐
│                      │
│ Google Apps Script   │
│ Backend API          │
│                      │
└──────────┬───────────┘
           │
           │ Datu lasīšana/rakstīšana
           ▼
┌──────────────────────┐
│                      │
│ Google Sheets        │
│ Datu glabātuve       │
│                      │
└──────────────────────┘
```

---

# 4.2. Arhitektūras slāņi

## Klienta puse (Frontend)

Izmantotās tehnoloģijas:

- HTML5;
- CSS3;
- JavaScript ES6+.

Dizaina principi:

- responsīvs izkārtojums;
- mobilajām ierīcēm pielāgota saskarne;
- ātra ielāde;
- minimāls resursu patēriņš.

---

## Frontend bibliotēkas

Izmantotās bibliotēkas:

| Bibliotēka  | Izmantošana                    |
| ------------ | ------------------------------- |
| Chart.js     | Datu grafiki un vizualizācijas |
| Leaflet.js   | Interaktīvā karte             |
| Font Awesome | Ikonas un vizuālie elementi    |

---

## Servera puse (Backend)

Platforma:

- Google Apps Script serverless vide.

Backend funkcijas:

- datu apstrāde;
- pieprasījumu validācija;
- datu sinhronizācija;
- balsojumu apstrāde;
- kešošana.

---

## Datu glabātuve

Galvenais datu avots:

**Google Sheets**

Priekšrocības:

- vienkārša administrēšana;
- publiski pārskatāma struktūra;
- ātra datu atjaunošana;
- piemērota nelielas kopienas pārvaldībai.

---

## Hosting un infrastruktūra

Statiskie resursi:

- GitHub Pages.

Dinamiskie dati:

- Google Apps Script Web App.

Domēna pārvaldība:

- GitHub Pages Custom Domain.

---

# 4.3. Datu plūsma

```
1. Lietotājs atver platformu
              │
              ▼
2. GitHub Pages ielādē HTML/CSS/JS
              │
              ▼
3. JavaScript inicializē lietotāja saskarni
              │
              ▼
4. Frontend nosūta API pieprasījumu
              │
              ▼
5. Google Apps Script apstrādā pieprasījumu
              │
              ▼
6. Dati tiek nolasīti no Google Sheets
              │
              ▼
7. JSON atbilde tiek nosūtīta klientam
              │
              ▼
8. JavaScript attēlo datus lietotājam
```

---

## Datu apstrādes process

1. Lietotājs atver Digitālā Centra tīmekļa vietni.
2. Tiek ielādēti statiskie resursi.
3. Tiek palaista klienta puses loģika.
4. Sistēma pieprasa nepieciešamos datus.
5. Backend pārbauda un apstrādā pieprasījumu.
6. Google Sheets nodrošina datu avotu.
7. Rezultāts tiek atgriezts JSON formātā.
8. Lietotāja saskarne tiek automātiski atjaunināta.

---

# 4.4. Drošība un personas datu aizsardzība

## Datu aizsardzības princips

Platforma darbojas bez obligātas lietotāju reģistrācijas.

Netiek apkopoti:

- vārds;
- uzvārds;
- personas kods;
- privāta kontaktinformācija.

---

## Anonīmais UID

Tehniskai funkciju kontrolei tiek izmantots anonīms lietotāja identifikators.

UID tiek glabāts:

```
localStorage
```

UID īpašības:

- nav saistīts ar konkrētu personu;
- netiek izmantots reklāmai;
- netiek izmantots izsekošanai;
- paredzēts tikai sistēmas darbībai.

---

# Drošības mehānismi

| Risks                      | Aizsardzība                             |
| -------------------------- | ---------------------------------------- |
| XSS uzbrukumi              | Lietotāja ievades sanitizācija         |
| CSRF pieprasījumi         | Pieprasījumu validācija                |
| Ļaunprātīga ievade      | Datu pārbaude pirms saglabāšanas      |
| Pārmērīgi pieprasījumi | CacheService un ierobežojumi            |
| Datu noplūde              | Sensitīvas konfigurācijas aizsardzība |

---

# Drošības politika

## Koda publicēšana

Publiskajā repozitorijā netiek ievietoti:

- privātie API parametri;
- slepenās atslēgas;
- sensitīva konfigurācija.

---

## Pieprasījumu kontrole

Sistēma izmanto:

- CacheService;
- LockService;
- UID balstītus ierobežojumus.

Kešatmiņas standarta ilgums:

```
CACHE_TTL = 5 sekundes
```

---

# Balsošanas aizsardzība

Balsošanas sistēma nodrošina:

- aktivitātes ierobežošanu;
- aizsardzību pret atkārtotiem balsojumiem;
- tehnisko darbību uzskaiti.

---

# 5. Projekta struktūra

```
├── index.html
├── style.css
├── base.css
│
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
│   ├── ai_analysis.js
│   └── fallback_data.js
│
├── prezentacijas/
├── dokumenti/
├── protokols/
├── jpg/
│
└── README.md
```

---

# 5.1. Stilu faili

| Fails                | Apraksts                                     |
| -------------------- | -------------------------------------------- |
| `base.css`         | CSS mainīgie, atiestatījumi un animācijas |
| `style.css`        | Galvenais platformas dizains                 |
| `aktualitates.css` | Ziņu sadaļas dizains                       |
| `karte.css`        | Kartes lietotāja saskarne                   |
| `idejas.css`       | Ideju sienas elementi                        |
| `darbi.css`        | Darbu sadaļas dizains                       |
| `kontakti.css`     | Kontaktformas stili                          |

---


# 5.2. Backend konfigurācija

## Google Apps Script API

Backend tiek nodrošināts ar Google Apps Script Web App.

Galvenās funkcijas:

- datu saņemšana;
- datu nosūtīšana;
- pieprasījumu apstrāde;
- drošības pārbaudes;
- datu sinhronizācija ar Google Sheets.

---

## Backend parametri

| Parametrs       | Vērtība                      | Apraksts                       |
| --------------- | ------------------------------ | ------------------------------ |
| API galapunkts  | Google Apps Script Web App URL | Backend komunikācijas punkts  |
| Datu avots      | Google Sheets                  | Galvenā datu glabātuve       |
| Datu formāts   | JSON                           | Datu apmaiņas formāts        |
| Kešatmiņa     | CacheService                   | Pieprasījumu optimizācija    |
| Sinhronizācija | LockService                    | Vienlaicīgu darbību kontrole |

---

# Google Sheets datu struktūra

Galvenās datu cilnes:

| Cilne             | Izmantošana                           |
| ----------------- | -------------------------------------- |
| `aktualitates`  | Ziņas un paziņojumi                  |
| `darbi`         | Padomes paveiktie darbi un projekti    |
| `idejas`        | Iedzīvotāju priekšlikumi            |
| `karte`         | Ģeogrāfiskie ziņojumi               |
| `aptauja`       | Aptauju dati un rezultāti             |
| `widget_config` | Dinamisko komponentu konfigurācija    |
| `balsis`        | Balsojumu dati                         |
| `reallaiks`     | Reāllaika informācijas joslas saturs |

---

# 6. Statistika un monitorings

## 6.1. Google Analytics 4

Platformā tiek izmantots:

**Google Analytics 4**

Mērķis:

- analizēt platformas izmantošanu;
- uzlabot lietotāja pieredzi;
- noteikt tehniskās problēmas.

---

## Izmantojamie rādītāji

Sistēmā tiek analizēti:

- apmeklējumu skaits;
- lapu skatījumi;
- lietotāju aktivitāte;
- ierīču sadalījums;
- piekļuves avoti;
- vispārīga ģeogrāfiskā statistika.

---

## Privātuma princips

Analītika tiek izmantota tikai statistikas nolūkos.

Netiek izmantoti:

- personas dati;
- lietotāju profili;
- personu identificējoša informācija.

---

# 6.2. Google Search Console

Meklētājprogrammu redzamības uzraudzībai tiek izmantots:

**Google Search Console**

Pieejamie dati:

- meklēšanas vaicājumi;
- klikšķu skaits;
- vidējās pozīcijas;
- indeksācijas statuss;
- tehniskās kļūdas.

---

# 6.3. PageSpeed Insights

Veiktspējas pārbaude tiek veikta ar:

**PageSpeed Insights**

Tiek analizēti:

- Performance rādītājs;
- Core Web Vitals;
- LCP;
- CLS;
- ielādes ātrums.

---

## Veiktspējas mērķi

Platformas mērķi:

- ātra darbība mobilajās ierīcēs;
- zems datu patēriņš;
- optimāla lietotāja pieredze.

---

# 7. Izstrādātāja instrukcija

## 7.1. Lokālā izstrāde

Projekta iegūšana:

```bash
git clone https://github.com/dawis86/Ipadome_Gramzda.git

cd Ipadome_Gramzda
```

---

## Projekta palaišana

Atveriet:

```
index.html
```

pārlūkprogrammā.

Ieteicams izmantot:

- Visual Studio Code Live Server;
- lokālu HTTP serveri;
- izstrādes vidi ar automātisku pārlādes funkciju.

---

# 7.2. Izmaiņu publicēšana

Izmaiņu process:

```bash
git add .

git commit -m "Izmaiņu apraksts"

git push
```

Pēc izmaiņu nosūtīšanas:

1. GitHub repozitorijs saņem jaunāko versiju.
2. GitHub Pages automātiski veic izvietošanu.
3. Lietotāji saņem atjaunināto versiju.

---

# 7.3. Google Apps Script atjaunināšana

Backend izmaiņu veikšana:

1. Atvērt Google Apps Script projektu.
2. Veikt nepieciešamās koda izmaiņas.
3. Saglabāt projektu.
4. Izveidot jaunu izvietojumu.

Izvēlne:

```
Deploy
→ Manage deployments
→ Edit
→ New version
```

---

## Piekļuves iestatījumi

Ieteicamie iestatījumi:

```
Execute as:
Owner

Who has access:
Anyone
```

---

# 8. Nākotnes attīstības iespējas

Digitālā centra attīstības virzieni:

---

## Mobilā lietotne

Iespējamie uzlabojumi:

- Progressive Web App (PWA);
- instalēšana mobilajās ierīcēs;
- push paziņojumi;
- darbs bezsaistes režīmā.

---

## Mākslīgā intelekta analītika

Iespējamās funkcijas:

- sabiedrības viedokļu analīze;
- automātiski kopsavilkumi;
- jautājumu grupēšana;
- tendences un prioritātes.

---

## Atvērtie dati

Nākotnes iespējas:

- publiska API;
- datu eksports;
- atvērtas statistikas paneļi;
- caurspīdīgāka pārvaldība.

---

## Paplašināta līdzdalība

Iespējamie rīki:

- tematiskās darba grupas;
- digitālie forumi;
- elektroniskās konsultācijas;
- kopienas balsojumi.

---

# 9. Atbalsts un kontakti

| Kontakta veids  | Informācija                                    |
| --------------- | ----------------------------------------------- |
| E-pasts         | iedzivotajupadomegramzda@gmail.com              |
| Tālrunis       | +371 26482667                                   |
| Mājas lapa     | https://dawis86.github.io/Ipadome_Gramzda/      |
| Repozitorijs    | https://github.com/dawis86/Ipadome_Gramzda      |
| Projekta kopija | https://github.com/dawis86/Ipadome_Gramzda/fork |

---

# Projekta statuss

**Nosaukums:**
Gramzdas Iedzīvotāju Padomes Digitālais Centrs

**Versija:**
2.0.0

**Arhitektūra:**
Serverless Cloud

**Statuss:**
Ražīga sistēma

**Dokumentācijas versija:**
2026-07-22

---

Dokuments sagatavots kā tehniskā dokumentācija atvērtai, caurspīdīgai un sabiedrības līdzdalību veicinošai digitālai platformai.
