// utils.js - Algemene utilityfuncties

// Formatteert een datum in nederlands formaat
export const formatDate = (date) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('nl-NL', options);
};

// Genereert een uniek ID
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Converteert data naar CSV formaat
export const convertToCSV = (data) => {
    if (!data || !data.length) {
        return '';
    }

    // Escape functie voor CSV waarden
    const escapeCSV = (value) => {
        if (value === null || value === undefined) {
            return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    // Converteer elke rij naar CSV
    return data.map(row => {
        return row.map(escapeCSV).join(',');
    }).join('\n');
};

// Download data als CSV bestand
export const downloadCSV = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Genereer Excel-compatibel bestand
export const generateExcelFile = (data, sheetName = 'Sheet1') => {
    if (!data || !data.length) {
        return null;
    }

    // Bibliotheek voor xlsx generatie zou hier worden gebruikt
    // Zonder externe bibliotheek gebruiken we een CSV als fallback

    return convertToCSV(data);
};

// Download data als Excel-bestand (eigenlijk CSV met .xlsx extensie)
export const downloadExcel = (data, filename) => {
    const csvContent = generateExcelFile(data);
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Genereert een array van teamnamen op basis van het aantal teams
export const generateTeamNames = (count) => {
    const names = [];
    for (let i = 0; i < count; i++) {
        names.push(`Team ${i + 1}`);
    }
    return names;
};

// Omzetten van spelerdata naar importeerbaar formaat
export const formatPlayersForImport = (players) => {
    return players.map(player => `${player.name},${player.category}`).join('\n');
};

// Parsen van geïmporteerde spelerdata
export const parseImportedPlayers = (text) => {
    if (!text) return [];

    return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const parts = line.split(',');

            if (parts.length >= 2) {
                return {
                    name: parts[0].trim(),
                    category: parts[1].trim()
                };
            } else {
                return {
                    name: parts[0].trim(),
                    category: 'JO15' // Default categorie
                };
            }
        });
};

export default {
    formatDate,
    generateId,
    convertToCSV,
    downloadCSV,
    generateExcelFile,
    downloadExcel,
    generateTeamNames,
    formatPlayersForImport,
    parseImportedPlayers
};
