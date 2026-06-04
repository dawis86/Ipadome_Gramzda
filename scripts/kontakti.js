/**
 * KONTAKTU FORMAS MODULIS
 * Nodrošina kontaktu formas 
 * validāciju un sūtīšanu uz Google Apps Script.
 */

import { clean, getOrCreateUID, API_URL, fetchJSONP } from './utils.js';

const SCRIPT_URL = API_URL;
const COOLDOWN = 2000;
let lastActionTime = 0;

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Pievienojam kļūdu noņemšanu, kad sāk rakstīt
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => {
            const group = field.parentElement;
            group.classList.remove('invalid');
            const err = group.querySelector('.error-message');
            if (err) err.remove();
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastActionTime < COOLDOWN) return;

        // Notīrām iepriekšējās kļūdas un paziņojumus
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('invalid');
            const err = group.querySelector('.error-message');
            if (err) err.remove();
        });

        const name = clean(form.name.value);
        const email = clean(form.email.value);
        const message = clean(form.message.value);

        let hasError = false;
        const showError = (fieldName, msg) => {
            const field = form[fieldName];
            const group = field.parentElement;
            group.classList.add('invalid');
            const errSpan = document.createElement('span');
            errSpan.className = 'error-message';
            errSpan.textContent = msg;
            group.appendChild(errSpan);
            hasError = true;
        };

        // Validācijas noteikumi
        if (name.length < 2) showError('name', "Lūdzu, ievadiet savu vārdu.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) showError('email', "Lūdzu, ievadiet derīgu e-pasta adresi.");
        if (message.length < 10) showError('message', "Ziņai jābūt vismaz 10 simbolus garai.");

        if (hasError) return;

        lastActionTime = now;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sūtu...';

        const uid = getOrCreateUID();

        try {
            const result = await fetchJSONP(SCRIPT_URL, {
                action: 'contact',
                name, email, message,
                identity: uid,
                t: now
            });
            
            if (result.status === 'Success') {
                window.location.href = 'paldies.html';
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Sūtīšanas kļūda:", error);
            alert("Neizdevās nosūtīt ziņu. Lūdzu, mēģiniet vēlreiz.");
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.textContent = originalText;
        }
    });
}

document.addEventListener('DOMContentLoaded', initContactForm);