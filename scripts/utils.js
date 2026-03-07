/**
 * Robusts CSV parsētājs, kas tiek galā ar pēdiņām un "Enter" taustiņiem šūnu iekšienē.
 * @param {string} csvText - Neapstrādāts CSV teksts.
 * @returns {string[][]} - Masīvs ar rindām, kur katra rinda ir masīvs ar šūnām.
 */
function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Apstrādā dubultās pēdiņas iekš lauka ("" -> ")
                currentCell += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            // Rindas beigas
            if (char === '\r' && nextChar === '\n') i++; // Pārlecam \n pēc \r
            currentRow.push(currentCell);
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    // Pievieno pēdējo šūnu un rindu, ja fails nebeidzas ar jaunu rindu
    if (currentCell.trim() !== '' || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }

    return rows;
}