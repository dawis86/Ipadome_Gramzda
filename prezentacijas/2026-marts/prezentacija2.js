/**
 * PREZENTĀCIJAS DATU IELĀDE
 * Paņem reālos aptaujas rezultātus un atjaunina prezentāciju
 */

import { FALLBACK_DATA } from '../../scripts/fallback_data.js';
import { API_URL, fetchJSONP } from '../../scripts/utils.js';

let surveyData = [];

async function loadSurveyData() {
    try {
        const result = await fetchJSONP(API_URL, { action: 'getSurveyData', t: Date.now() });
        
        if (result.error) throw new Error(result.error);
        
        const rows = result.data || [];
        if (rows.length < 2) {
            surveyData = [];
        } else {
            const headers = rows[0];
            surveyData = rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i];
                });
                return obj;
            });
        }
        
        surveyData = surveyData.filter(row =>
            Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '')
        );
        
        console.log("Prezentācijai ielādēti live dati. Rindu skaits:", surveyData.length);
    } catch (error) {
        console.warn("Neizdevās ielādēt live datus. Izmantoju rezerves datus. Kļūda:", error.message);
        surveyData = FALLBACK_DATA;
    }
    
    updatePresentation();
}

function calculateKPIs() {
    const total = surveyData.length;
    
    if (total === 0) return {
        total: 0,
        satisfactionIndex: 0,
        engagementPct: 0,
        businessPct: 0,
        sentimentPct: 0
    };
    
    const validRatings = surveyData.map(d => Number(d['Pārvaldnieces pieejamības vērtējums'])).filter(r => r > 0 && r !== 3);
    const avgRating = validRatings.length > 0 ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length) : 0;
    const satisfactionIndex = avgRating > 0 ? Math.round(((avgRating - 1) / 4) * 100) : 0;
    
    const readyToEngage = surveyData.filter(d => {
        const wantsMore = Number(d['Vēlētos vairāk iesaistīties pagasta aktivitātēs']) >= 3;
        const volunteer = d['Gatavs iesaistīties brīvprātīgajā darbā'] === 1;
        const organize = d['Gatavs iesaistīties pasākumu organizēšanā'] === 1;
        const cleanup = d['Gatavs iesaistīties apkārtnes sakopšanā'] === 1;
        const youth = d['Gatavs iesaistīties jauniešu aktivitātēs'] === 1;
        const seniors = d['Gatavs iesaistīties senioru aktivitātēs'] === 1;
        const ideas = d['Gatavs sniegt idejas'] === 1;
        const doesntWant = d['Nevēlas iesaistīties aktivitātēs'] === 1;
        const hasEngagement = wantsMore || volunteer || organize || cleanup || youth || seniors || ideas;
        return hasEngagement && !doesntWant;
    }).length;
    const engagementPct = Math.round((readyToEngage / total) * 100);
    
    const businessPrio = surveyData.filter(d => {
        const text = String(d['Kas Gramzdā šobrīd pietrūkst visvairāk'] || '').toLowerCase();
        return text.includes('darba vieta') || text.includes('uzņēmējdarbība') || text.includes('jaunu cilvēku');
    }).length;
    const businessPct = Math.round((businessPrio / total) * 100);
    
    const futureWishes = surveyData.filter(d => d['Galvenā vēlēšanās Gramzdas nākotnei'] && String(d['Galvenā vēlēšanās Gramzdas nākotnei']).length > 3);
    const positiveWishes = futureWishes.filter(d => {
        const text = String(d['Galvenā vēlēšanās Gramzdas nākotnei']).toLowerCase();
        const positiveWords = ['lab', 'priek', 'attīst', 'dzīv', 'ros', 'cieņ', 'sakop', 'turpin', 'veiksm'];
        return positiveWords.some(word => text.includes(word));
    }).length;
    const sentimentPct = futureWishes.length > 0 ? Math.round((positiveWishes / futureWishes.length) * 100) : 0;
    
    return {
        total,
        satisfactionIndex,
        engagementPct,
        businessPct,
        sentimentPct
    };
}

function calculateDemographics() {
    const total = surveyData.length;
    
    if (total === 0) return { ageGroups: {}, locations: {} };
    
    const ageGroups = { 'Līdz 18': 0, '19-30': 0, '31-45': 0, '46-62': 0, '63+': 0 };
    
    surveyData.forEach(d => {
        const age = Number(d['Vecuma grupa']);
        if (age === 1) ageGroups['Līdz 18']++;
        else if (age === 2) ageGroups['19-30']++;
        else if (age === 3) ageGroups['31-45']++;
        else if (age === 4) ageGroups['46-62']++;
        else if (age === 5) ageGroups['63+']++;
    });
    
    const locations = { 'Gramzdas centrs': 0, 'Gramzdas pagasts': 0, 'Citviet, bet saistīts': 0 };
    
    surveyData.forEach(d => {
        const loc = Number(d['Dzīvesvieta']);
        if (loc === 1) locations['Gramzdas centrs']++;
        else if (loc === 2) locations['Gramzdas pagasts']++;
        else if (loc === 3) locations['Citviet, bet saistīts']++;
    });
    
    Object.keys(ageGroups).forEach(key => {
        ageGroups[key] = Math.round((ageGroups[key] / total) * 100);
    });
    
    Object.keys(locations).forEach(key => {
        locations[key] = Math.round((locations[key] / total) * 100);
    });
    
    return { ageGroups, locations };
}

function calculateInfoChannels() {
    const total = surveyData.length;
    
    if (total === 0) return { facebook: 0, whatsapp: 0, neighbors: 0, website: 0 };
    
    const facebook = surveyData.filter(d => d['Informāciju iegūst Facebook'] == 1).length;
    const whatsapp = surveyData.filter(d => d['Informāciju iegūst WhatsApp grupās'] == 1).length;
    const neighbors = surveyData.filter(d => d['Informāciju iegūst no kaimiņiem vai paziņām'] == 1).length;
    const website = surveyData.filter(d => d['Informāciju iegūst pagasta mājaslapā'] == 1).length;
    
    return {
        facebook: Math.round((facebook / total) * 100),
        whatsapp: Math.round((whatsapp / total) * 100),
        neighbors: Math.round((neighbors / total) * 100),
        website: Math.round((website / total) * 100)
    };
}

function calculatePriorities() {
    const total = surveyData.length;
    
    if (total === 0) return { business: 0, kids: 0, culture: 0, roads: 0, sports: 0, leadership: 0 };
    
    const business = surveyData.filter(d => {
        const text = String(d['Kas Gramzdā šobrīd pietrūkst visvairāk'] || '').toLowerCase();
        return text.includes('darba vieta') || text.includes('uzņēmējdarbība') || text.includes('jaunu cilvēku');
    }).length;
    
    const kids = surveyData.filter(d => {
        const text = String(d['Kas Gramzdā šobrīd pietrūkst visvairāk'] || '').toLowerCase();
        return text.includes('bērnu') || text.includes('jauniešu');
    }).length;
    
    const culture = surveyData.filter(d => {
        const text = String(d['Kas Gramzdā šobrīd pietrūkst visvairāk'] || '').toLowerCase();
        return text.includes('kultūr') || text.includes('pasākum');
    }).length;
    
    const roads = surveyData.filter(d => {
        const text = String(d['Kas Gramzdā šobrīd pietrūkst visvairāk'] || '').toLowerCase();
        return text.includes('cels') || text.includes('dzīvokļu') || text.includes('dzīvojamais');
    }).length;
    
    const sports = surveyData.filter(d => {
        const text = String(d['Kas Gramzdā šobrīd pietrūkst visvairāk'] || '').toLowerCase();
        return text.includes('sporta') || text.includes('veselīgā dzīvesveids');
    }).length;
    
    const leadership = surveyData.filter(d => {
        const text = String(d['Kas Gramzdā šobrīd pietrūkst visvairāk'] || '').toLowerCase();
        return text.includes('līderis') || text.includes('pārvaldn') || text.includes('pagasta saimnieks') || text.includes('kopīgums');
    }).length;
    
    return {
        business: Math.round((business / total) * 100),
        kids: Math.round((kids / total) * 100),
        culture: Math.round((culture / total) * 100),
        roads: Math.round((roads / total) * 100),
        sports: Math.round((sports / total) * 100),
        leadership: Math.round((leadership / total) * 100)
    };
}

function calculateDesiredEvents() {
    const total = surveyData.length;
    
    if (total === 0) return { concerts: 0, family: 0, children: 0, sports: 0, workshops: 0 };
    
    const concerts = surveyData.filter(d => d['Vēlētos vairāk koncertu'] == 1 || d['Vēlētos vairāk zaļumbaļļu un svētku'] == 1).length;
    const family = surveyData.filter(d => d['Vēlētos vairāk ģimeņu pasākumu'] == 1).length;
    const children = surveyData.filter(d => d['Vēlētos vairāk jauniešu pasākumu'] == 1).length;
    const sports = surveyData.filter(d => d['Vēlētos vairāk sporta sacensību'] == 1).length;
    const workshops = surveyData.filter(d => d['Vēlētos vairāk izglītojošu lekciju un semināru'] == 1 || d['Vēlētos vairāk amatniecības un radošo darbnīcu'] == 1).length;
    
    return {
        concerts: Math.round((concerts / total) * 100),
        family: Math.round((family / total) * 100),
        children: Math.round((children / total) * 100),
        sports: Math.round((sports / total) * 100),
        workshops: Math.round((workshops / total) * 100)
    };
}

function calculateFreeResponses() {
    const freeResponses = surveyData.filter(d => {
        return (d['Kas Gramzdā šobrīd pietrūkst visvairāk'] && String(d['Kas Gramzdā šobrīd pietrūkst visvairāk']).length > 3) ||
               (d['Cita prioritāte'] && String(d['Cita prioritāte']).length > 3) ||
               (d['Vēlamā jaunā aktivitāte vai pakalpojums'] && String(d['Vēlamā jaunā aktivitāte vai pakalpojums']).length > 3) ||
               (d['Galvenā vēlēšanās Gramzdas nākotnei'] && String(d['Galvenā vēlēšanās Gramzdas nākotnei']).length > 3);
    }).length;
    
    return freeResponses;
}

function updatePresentation() {
    const kpis = calculateKPIs();
    const demographics = calculateDemographics();
    const infoChannels = calculateInfoChannels();
    const priorities = calculatePriorities();
    const desiredEvents = calculateDesiredEvents();
    const freeResponses = calculateFreeResponses();
    
    document.getElementById('stat-respondents').textContent = kpis.total;
    document.getElementById('stat-satisfaction').textContent = kpis.satisfactionIndex + '%';
    document.getElementById('stat-free-responses').textContent = freeResponses;
    
    document.getElementById('kpi-satisfaction').textContent = kpis.satisfactionIndex + '%';
    document.getElementById('kpi-engagement').textContent = kpis.engagementPct + '%';
    document.getElementById('kpi-business').textContent = kpis.businessPct + '%';
    document.getElementById('kpi-sentiment').textContent = kpis.sentimentPct + '%';
    
    document.getElementById('kpi-fill-satisfaction').style.width = kpis.satisfactionIndex + '%';
    document.getElementById('kpi-fill-engagement').style.width = kpis.engagementPct + '%';
    document.getElementById('kpi-fill-business').style.width = kpis.businessPct + '%';
    document.getElementById('kpi-fill-sentiment').style.width = kpis.sentimentPct + '%';
    
    document.getElementById('priority-business').style.width = priorities.business + '%';
    document.getElementById('priority-kids').style.width = priorities.kids + '%';
    document.getElementById('priority-culture').style.width = priorities.culture + '%';
    document.getElementById('priority-roads').style.width = priorities.roads + '%';
    document.getElementById('priority-sports').style.width = priorities.sports + '%';
    document.getElementById('priority-leadership').style.width = priorities.leadership + '%';
    
    document.getElementById('age-31-45').textContent = demographics.ageGroups['31-45'];
    document.getElementById('age-46-62').textContent = demographics.ageGroups['46-62'];
    document.getElementById('age-19-30').textContent = demographics.ageGroups['19-30'];
    document.getElementById('age-63').textContent = demographics.ageGroups['63+'];
    document.getElementById('age-18').textContent = demographics.ageGroups['Līdz 18'];
    
    document.getElementById('loc-center').textContent = demographics.locations['Gramzdas centrs'];
    document.getElementById('loc-rural').textContent = demographics.locations['Gramzdas pagasts'];
    document.getElementById('loc-away').textContent = demographics.locations['Citviet, bet saistīts'];
    
    document.getElementById('engagement-percent').textContent = kpis.engagementPct;
    
    document.getElementById('info-facebook').textContent = infoChannels.facebook + '%';
    document.getElementById('info-whatsapp').textContent = infoChannels.whatsapp + '%';
    document.getElementById('info-neighbors').textContent = infoChannels.neighbors + '%';
    document.getElementById('info-website').textContent = infoChannels.website + '%';
    
    document.getElementById('theme-concerts').textContent = desiredEvents.concerts + '%';
    document.getElementById('theme-family').textContent = desiredEvents.family + '%';
    document.getElementById('theme-children').textContent = desiredEvents.children + '%';
    document.getElementById('theme-sports').textContent = desiredEvents.sports + '%';
    document.getElementById('theme-workshops').textContent = desiredEvents.workshops + '%';
}

document.addEventListener('DOMContentLoaded', () => loadSurveyData());