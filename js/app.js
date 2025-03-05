// Voetbal Toernooi Tool - Main Application

// Import modules
import dataService from './modules/data.js';
import playerOverviewService from './modules/playerOverview.js';
import scheduleService from './modules/schedule.js';
import stateManager, { Events } from './modules/state.js';
import utils from './modules/utils.js';

// DOM-elementen
const DOM = {
    // Spelers tab
    playerName: document.getElementById('playerName'),
    playerCategory: document.getElementById('playerCategory'),
    addPlayerBtn: document.getElementById('addPlayerBtn'),
    importPlayersFile: document.getElementById('importPlayersFile'),
    importPlayersBtn: document.getElementById('importPlayersBtn'),
    removeAllPlayersBtn: document.getElementById('removeAllPlayersBtn'),
    playersList: document.getElementById('playersList'),

    // Instellingen tab
    teamSize: document.getElementById('teamSize'),
    fieldsCount: document.getElementById('fieldsCount'),
    matchDuration: document.getElementById('matchDuration'),
    tournamentDuration: document.getElementById('tournamentDuration'),
    winPoints: document.getElementById('winPoints'),
    drawPoints: document.getElementById('drawPoints'),
    goalPoints: document.getElementById('goalPoints'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),

    // Schema tab
    generateScheduleBtn: document.getElementById('generateScheduleBtn'),
    exportScheduleBtn: document.getElementById('exportScheduleBtn'),
    scheduleContainer: document.getElementById('scheduleContainer'),

    // Veldindeling tab
    roundSelect: document.getElementById('roundSelect'),
    fieldsContainer: document.getElementById('fieldsContainer'),

    // Wedstrijden tab
    matchRoundSelect: document.getElementById('matchRoundSelect'),
    matchesContainer: document.getElementById('matchesContainer'),

    // Stand tab
    allStandingsList: document.getElementById('allStandingsList'),
    o11StandingsList: document.getElementById('o11StandingsList'),
    o12StandingsList: document.getElementById('o12StandingsList'),
    printStandingsBtn: document.getElementById('printStandingsBtn'),

    // Speleroverzicht tab
    showAllRounds: document.getElementById('showAllRounds'),
    exportOverviewBtn: document.getElementById('exportOverviewBtn'),
    playerOverviewTableHead: document.getElementById('playerOverviewTableHead'),
    playerOverviewTableBody: document.getElementById('playerOverviewTableBody'),

    // Modals
    editPlayerModal: new bootstrap.Modal(document.getElementById('editPlayerModal')),
    editPlayerId: document.getElementById('editPlayerId'),
    editPlayerName: document.getElementById('editPlayerName'),
    editPlayerCategory: document.getElementById('editPlayerCategory'),
    saveEditPlayerBtn: document.getElementById('saveEditPlayerBtn'),

    matchResultModal: new bootstrap.Modal(document.getElementById('matchResultModal')),
    editMatchId: document.getElementById('editMatchId'),
    homeTeamName: document.getElementById('homeTeamName'),
    awayTeamName: document.getElementById('awayTeamName'),
    homeTeamScore: document.getElementById('homeTeamScore'),
    awayTeamScore: document.getElementById('awayTeamScore'),
    saveMatchResultBtn: document.getElementById('saveMatchResultBtn')
};

// ----------------------------------------
// Spelers management
// ----------------------------------------

// Toon alle spelers in de tabel
function displayPlayers() {
    const players = dataService.getPlayers();
    DOM.playersList.innerHTML = '';

    players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.category}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-player" data-id="${player.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-player" data-id="${player.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        DOM.playersList.appendChild(row);
    });

    // Update state
    stateManager.notify(Events.PLAYERS_UPDATED, players);
}

// Voeg een nieuwe speler toe
function addPlayer() {
    const name = DOM.playerName.value.trim();
    const category = DOM.playerCategory.value;

    if (name === '') {
        alert('Vul een naam in');
        return;
    }

    const newPlayer = {
        id: utils.generateId(),
        name: name,
        category: category,
        score: 0
    };

    dataService.addPlayer(newPlayer);

    // Reset input veld
    DOM.playerName.value = '';
    DOM.playerName.focus();

    // Update weergave
    displayPlayers();
}

// Verwijder een speler
function deletePlayer(playerId) {
    if (confirm('Weet je zeker dat je deze speler wilt verwijderen?')) {
        dataService.removePlayer(playerId);
        displayPlayers();
    }
}

// Bewerk een speler
function editPlayer(playerId) {
    const player = dataService.getPlayerById(playerId);

    if (player) {
        DOM.editPlayerId.value = player.id;
        DOM.editPlayerName.value = player.name;
        DOM.editPlayerCategory.value = player.category;
        DOM.editPlayerModal.show();
    }
}

// Sla bewerkte speler op
function saveEditPlayer() {
    const playerId = DOM.editPlayerId.value;
    const name = DOM.editPlayerName.value.trim();
    const category = DOM.editPlayerCategory.value;

    if (name === '') {
        alert('Vul een naam in');
        return;
    }

    const updated = dataService.updatePlayer(playerId, { name, category });

    if (updated) {
        DOM.editPlayerModal.hide();
        displayPlayers();
    }
}

// Verwijder alle spelers
function removeAllPlayers() {
    if (confirm('Weet je zeker dat je ALLE spelers wilt verwijderen?')) {
        dataService.removeAllPlayers();
        displayPlayers();
    }
}

// Importeer spelers uit bestand
function importPlayers() {
    const file = DOM.importPlayersFile.files[0];

    if (!file) {
        alert('Selecteer een bestand');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const importedPlayers = utils.parseImportedPlayers(text);

        if (importedPlayers.length === 0) {
            alert('Geen geldige spelergegevens gevonden');
            return;
        }

        // Voeg elke geïmporteerde speler toe
        importedPlayers.forEach(player => {
            dataService.addPlayer({
                id: utils.generateId(),
                name: player.name,
                category: player.category,
                score: 0
            });
        });

        // Reset bestandselector
        DOM.importPlayersFile.value = '';

        // Update weergave
        displayPlayers();

        alert(`${importedPlayers.length} spelers geïmporteerd`);
    };
    reader.readAsText(file);
}

// ----------------------------------------
// Instellingen management
// ----------------------------------------

// Laad instellingen in het formulier
function loadSettings() {
    const settings = dataService.getSettings();

    DOM.teamSize.value = settings.teamSize;
    DOM.fieldsCount.value = settings.fieldsCount;
    DOM.matchDuration.value = settings.matchDuration;
    DOM.tournamentDuration.value = settings.totalDuration;
    DOM.winPoints.value = settings.winPoints;
    DOM.drawPoints.value = settings.drawPoints;
    DOM.goalPoints.value = settings.goalPoints;
}

// Sla instellingen op
function saveSettings() {
    const settings = {
        teamSize: parseInt(DOM.teamSize.value),
        fieldsCount: parseInt(DOM.fieldsCount.value),
        matchDuration: parseInt(DOM.matchDuration.value),
        totalDuration: parseInt(DOM.tournamentDuration.value),
        winPoints: parseInt(DOM.winPoints.value),
        drawPoints: parseInt(DOM.drawPoints.value),
        goalPoints: parseInt(DOM.goalPoints.value)
    };

    dataService.updateSettings(settings);

    // Update state
    stateManager.notify(Events.SETTINGS_UPDATED, settings);

    alert('Instellingen opgeslagen');
}

// ----------------------------------------
// Schema management
// ----------------------------------------

// Genereer een nieuw schema
function generateSchedule() {
    const players = dataService.getPlayers();
    const settings = dataService.getSettings();

    if (players.length < settings.teamSize * 2) {
        alert(`Te weinig spelers. Minimaal ${settings.teamSize * 2} spelers nodig voor ${settings.teamSize}v${settings.teamSize}.`);
        return;
    }

    try {
        const result = scheduleService.generateTournamentSchedule();

        // Update state
        stateManager.notify(Events.SCHEDULE_GENERATED, result);

        // Update UI
        populateRoundSelects();
        displaySchedule();

        alert('Schema gegenereerd');
    } catch (error) {
        alert(`Fout bij genereren schema: ${error.message}`);
    }
}

// Toon het gegenereerde schema
function displaySchedule() {
    const schedule = dataService.getSchedule();

    if (!schedule || !schedule.rounds || schedule.rounds.length === 0) {
        DOM.scheduleContainer.innerHTML = '<div class="alert alert-info">Nog geen schema gegenereerd</div>';
        return;
    }

    let html = '';

    schedule.rounds.forEach(round => {
        html += `
            <div class="card mb-3">
                <div class="card-header">
                    <h5>Ronde ${round.number}</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Veld</th>
                                    <th>Team 1</th>
                                    <th>Team 2</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        round.matches.forEach((match, index) => {
            const fieldNumber = (index % dataService.getSettings().fieldsCount) + 1;

            // Haal spelersnamen op
            const team1Players = match.team1.playerIds.map(id => {
                const player = dataService.getPlayerById(id);
                return player ? player.name : 'Onbekend';
            }).join(', ');

            const team2Players = match.team2.playerIds.map(id => {
                const player = dataService.getPlayerById(id);
                return player ? player.name : 'Onbekend';
            }).join(', ');

            html += `
                <tr>
                    <td>${fieldNumber}</td>
                    <td>${team1Players}</td>
                    <td>${team2Players}</td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    });

    DOM.scheduleContainer.innerHTML = html;
}

// Exporteer schema naar CSV
function exportSchedule() {
    const schedule = dataService.getSchedule();

    if (!schedule || !schedule.rounds || schedule.rounds.length === 0) {
        alert('Nog geen schema gegenereerd');
        return;
    }

    const csvData = [['Ronde', 'Veld', 'Team 1', 'Team 2']];

    schedule.rounds.forEach(round => {
        round.matches.forEach((match, index) => {
            const fieldNumber = (index % dataService.getSettings().fieldsCount) + 1;

            // Haal spelersnamen op
            const team1Players = match.team1.playerIds.map(id => {
                const player = dataService.getPlayerById(id);
                return player ? player.name : 'Onbekend';
            }).join(', ');

            const team2Players = match.team2.playerIds.map(id => {
                const player = dataService.getPlayerById(id);
                return player ? player.name : 'Onbekend';
            }).join(', ');

            csvData.push([
                `Ronde ${round.number}`,
                `Veld ${fieldNumber}`,
                team1Players,
                team2Players
            ]);
        });
    });

    utils.downloadCSV(csvData, 'voetbaltoernooi_schema.csv');
}

// Vul de ronde selectors voor veldindeling en wedstrijden
function populateRoundSelects() {
    const schedule = dataService.getSchedule();

    if (!schedule || !schedule.rounds || schedule.rounds.length === 0) {
        return;
    }

    // Veldindeling ronde selector
    DOM.roundSelect.innerHTML = '';

    // Wedstrijden ronde selector
    DOM.matchRoundSelect.innerHTML = '';

    schedule.rounds.forEach(round => {
        const option1 = document.createElement('option');
        option1.value = round.number;
        option1.textContent = `Ronde ${round.number}`;
        DOM.roundSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = round.number;
        option2.textContent = `Ronde ${round.number}`;
        DOM.matchRoundSelect.appendChild(option2);
    });

    // Trigger change event om veldindeling te tonen
    DOM.roundSelect.dispatchEvent(new Event('change'));
    DOM.matchRoundSelect.dispatchEvent(new Event('change'));
}

// ----------------------------------------
// Veldindeling management
// ----------------------------------------

// Toon veldindeling voor geselecteerde ronde
function displayFieldLayout() {
    const roundNumber = parseInt(DOM.roundSelect.value);

    if (isNaN(roundNumber)) {
        DOM.fieldsContainer.innerHTML = '<div class="alert alert-info">Selecteer een ronde</div>';
        return;
    }

    const schedule = dataService.getSchedule();
    const fieldAssignments = dataService.getFieldAssignments();

    if (!schedule || !schedule.rounds || !fieldAssignments) {
        DOM.fieldsContainer.innerHTML = '<div class="alert alert-info">Nog geen schema gegenereerd</div>';
        return;
    }

    // Zoek de ronde
    const round = schedule.rounds.find(r => r.number === roundNumber);

    if (!round) {
        DOM.fieldsContainer.innerHTML = '<div class="alert alert-danger">Ronde niet gevonden</div>';
        return;
    }

    // Zoek de veldindeling
    const roundAssignment = fieldAssignments.find(fa => fa.round === roundNumber);

    if (!roundAssignment) {
        DOM.fieldsContainer.innerHTML = '<div class="alert alert-danger">Veldindeling niet gevonden</div>';
        return;
    }

    let html = '';

    // Toon velden
    roundAssignment.fields.forEach(field => {
        html += `
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Veld ${field.fieldNumber}</h5>
                    </div>
                    <div class="card-body">
        `;

        // Zoek matches voor dit veld
        field.matches.forEach(matchId => {
            const match = round.matches.find(m => m.id === matchId);

            if (match) {
                // Team 1
                html += `<div class="mb-3">
                    <h6>Team ${match.team1.id.replace('team_', '')}</h6>
                    <ul class="list-group">`;

                match.team1.playerIds.forEach(playerId => {
                    const player = dataService.getPlayerById(playerId);
                    if (player) {
                        html += `<li class="list-group-item">${player.name} (${player.category})</li>`;
                    }
                });

                html += `</ul></div>`;

                // vs
                html += `<div class="text-center mb-3"><h6>vs</h6></div>`;

                // Team 2
                html += `<div class="mb-3">
                    <h6>Team ${match.team2.id.replace('team_', '')}</h6>
                    <ul class="list-group">`;

                match.team2.playerIds.forEach(playerId => {
                    const player = dataService.getPlayerById(playerId);
                    if (player) {
                        html += `<li class="list-group-item">${player.name} (${player.category})</li>`;
                    }
                });

                html += `</ul></div>`;
            }
        });

        html += `
                    </div>
                </div>
            </div>
        `;
    });

    // Spelers met rust
    if (round.restingPlayers && round.restingPlayers.length > 0) {
        html += `
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5>Rust</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group">
        `;

        round.restingPlayers.forEach(playerId => {
            const player = dataService.getPlayerById(playerId);
            if (player) {
                html += `<li class="list-group-item">${player.name} (${player.category})</li>`;
            }
        });

        html += `
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    DOM.fieldsContainer.innerHTML = html;
}

// ----------------------------------------
// Wedstrijdresultaten management
// ----------------------------------------

// Toon wedstrijden voor geselecteerde ronde
function displayMatches() {
    const roundNumber = parseInt(DOM.matchRoundSelect.value);

    if (isNaN(roundNumber)) {
        DOM.matchesContainer.innerHTML = '<div class="alert alert-info">Selecteer een ronde</div>';
        return;
    }

    const schedule = dataService.getSchedule();
    const results = dataService.getResults();

    if (!schedule || !schedule.rounds) {
        DOM.matchesContainer.innerHTML = '<div class="alert alert-info">Nog geen schema gegenereerd</div>';
        return;
    }

    // Zoek de ronde
    const round = schedule.rounds.find(r => r.number === roundNumber);

    if (!round) {
        DOM.matchesContainer.innerHTML = '<div class="alert alert-danger">Ronde niet gevonden</div>';
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Veld</th>
                        <th>Team 1</th>
                        <th>Score</th>
                        <th>Team 2</th>
                        <th>Acties</th>
                    </tr>
                </thead>
                <tbody>
    `;

    round.matches.forEach((match, index) => {
        const fieldNumber = (index % dataService.getSettings().fieldsCount) + 1;

        // Haal spelersnamen op
        const team1Players = match.team1.playerIds.map(id => {
            const player = dataService.getPlayerById(id);
            return player ? player.name : 'Onbekend';
        }).join(', ');

        const team2Players = match.team2.playerIds.map(id => {
            const player = dataService.getPlayerById(id);
            return player ? player.name : 'Onbekend';
        }).join(', ');

        // Controleer of er al een resultaat is
        const result = results[match.id];
        const scoreText = result ? `${result.homeScore} - ${result.awayScore}` : 'Nog niet gespeeld';

        html += `
            <tr>
                <td>${fieldNumber}</td>
                <td>${team1Players}</td>
                <td class="text-center">${scoreText}</td>
                <td>${team2Players}</td>
                <td>
                    <button class="btn btn-sm btn-primary enter-result" data-match-id="${match.id}">
                        Invoeren
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    DOM.matchesContainer.innerHTML = html;

    // Event listeners voor resultaat invoeren
    document.querySelectorAll('.enter-result').forEach(btn => {
        btn.addEventListener('click', function () {
            const matchId = this.getAttribute('data-match-id');
            openMatchResultModal(matchId);
        });
    });
}

// Open het wedstrijdresultaat modal
function openMatchResultModal(matchId) {
    const schedule = dataService.getSchedule();
    const results = dataService.getResults();

    // Zoek de wedstrijd
    let match = null;
    let roundData = null;

    // Zoek door alle rondes
    for (const round of schedule.rounds) {
        const foundMatch = round.matches.find(m => m.id === matchId);
        if (foundMatch) {
            match = foundMatch;
            roundData = round;
            break;
        }
    }

    if (!match) {
        alert('Wedstrijd niet gevonden');
        return;
    }

    // Team namen (maak leesbaar)
    const team1Name = `Team ${match.team1.id.replace('team_', '')}`;
    const team2Name = `Team ${match.team2.id.replace('team_', '')}`;

    // Vul het modal
    DOM.editMatchId.value = matchId;
    DOM.homeTeamName.textContent = team1Name;
    DOM.awayTeamName.textContent = team2Name;

    // Controleer of er al een resultaat is
    if (results[matchId]) {
        DOM.homeTeamScore.value = results[matchId].homeScore;
        DOM.awayTeamScore.value = results[matchId].awayScore;
    } else {
        DOM.homeTeamScore.value = 0;
        DOM.awayTeamScore.value = 0;
    }

    // Toon het modal
    DOM.matchResultModal.show();
}

// Sla wedstrijdresultaat op
function saveMatchResult() {
    const matchId = DOM.editMatchId.value;
    const homeScore = parseInt(DOM.homeTeamScore.value, 10);
    const awayScore = parseInt(DOM.awayTeamScore.value, 10);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
        alert('Voer geldige scores in (0 of hoger)');
        return;
    }

    // Sla resultaat op
    dataService.setMatchResult(matchId, homeScore, awayScore);

    // Update state
    stateManager.notify(Events.MATCH_RESULT_SAVED, { matchId, homeScore, awayScore });

    // Sluit modal
    DOM.matchResultModal.hide();

    // Update weergaves
    displayMatches();
    updateStandings();
    displayPlayerOverview();
}

// ----------------------------------------
// Standen management
// ----------------------------------------

// Update alle standen
function updateStandings() {
    const scores = dataService.getPlayerScores();

    // Alle spelers
    displayStandings(scores, DOM.allStandingsList, true);

    // JO15 spelers
    const o11Scores = scores.filter(player => player.category === 'JO15');
    displayStandings(o11Scores, DOM.o11StandingsList, false);

    // JO16 spelers
    const o12Scores = scores.filter(player => player.category === 'JO16');
    displayStandings(o12Scores, DOM.o12StandingsList, false);
}

// Toon standen in een tabel
function displayStandings(scores, container, showCategory) {
    container.innerHTML = '';

    scores.forEach((player, index) => {
        const row = document.createElement('tr');

        let html = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
        `;

        if (showCategory) {
            html += `<td>${player.category}</td>`;
        }

        html += `
            <td>${player.wins}</td>
            <td>${player.draws}</td>
            <td>${player.losses}</td>
            <td>${player.goalsFor}</td>
            <td>${player.score}</td>
        `;

        row.innerHTML = html;
        container.appendChild(row);
    });
}

// Print standen
function printStandings() {
    window.print();
}

// ----------------------------------------
// Speleroverzicht management
// ----------------------------------------

// Toon speleroverzicht
function displayPlayerOverview() {
    // Check of de noodzakelijke elementen bestaan
    if (!DOM.playerOverviewTableHead || !DOM.playerOverviewTableBody) {
        console.error('Speleroverzicht tabel elementen niet gevonden');
        return;
    }

    const showAllRounds = DOM.showAllRounds.checked;
    const overviewData = playerOverviewService.generatePlayerOverviewData(showAllRounds);

    // Maak de tabelheader
    let headerHtml = '<tr><th>Naam</th><th>Categorie</th>';

    if (showAllRounds) {
        for (let round = 1; round <= overviewData.roundsCount; round++) {
            headerHtml += `<th>Ronde ${round}</th>`;
        }
    }

    headerHtml += '<th>Totaal</th></tr>';
    DOM.playerOverviewTableHead.innerHTML = headerHtml;

    // Maak de tabelrijen
    let bodyHtml = '';

    // Loop door categorieën
    Object.keys(overviewData.playersByCategory).forEach(category => {
        // Categorie header
        bodyHtml += `<tr class="table-primary"><td colspan="${showAllRounds ? overviewData.roundsCount + 3 : 3}"><strong>${category}</strong></td></tr>`;

        // Spelers in deze categorie
        overviewData.playersByCategory[category].forEach(player => {
            bodyHtml += `<tr><td>${player.name}</td><td>${player.category}</td>`;

            if (showAllRounds) {
                for (let round = 1; round <= overviewData.roundsCount; round++) {
                    const roundData = player.roundScores.find(r => r.round === round);
                    const scoreValue = roundData ? roundData.score : '';

                    // Verschillende opmaak op basis van het resultaat
                    let cellClass = '';
                    if (roundData && roundData.outcome) {
                        if (roundData.outcome === 'W') cellClass = 'table-success';
                        else if (roundData.outcome === 'G') cellClass = 'table-warning';
                        else if (roundData.outcome === 'V') cellClass = 'table-danger';
                    }

                    bodyHtml += `<td class="${cellClass}">${scoreValue}</td>`;
                }
            }

            bodyHtml += `<td><strong>${player.totalScore}</strong></td></tr>`;
        });

        // Lege rij na elke categorie
        bodyHtml += `<tr><td colspan="${showAllRounds ? overviewData.roundsCount + 3 : 3}">&nbsp;</td></tr>`;
    });

    DOM.playerOverviewTableBody.innerHTML = bodyHtml;
}

// Exporteer speleroverzicht naar Excel
function exportPlayerOverview() {
    const showAllRounds = DOM.showAllRounds.checked;
    const overviewData = playerOverviewService.generatePlayerOverviewData(showAllRounds);
    const excelData = playerOverviewService.generateExcelData(overviewData);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    utils.downloadExcel(excelData, `voetbaltoernooi_overzicht_${timestamp}.xlsx`);
}

// ----------------------------------------
// Event listeners
// ----------------------------------------

// Spelers tab
DOM.addPlayerBtn.addEventListener('click', addPlayer);
DOM.playerName.addEventListener('keypress', e => { if (e.key === 'Enter') addPlayer(); });
DOM.importPlayersBtn.addEventListener('click', importPlayers);
DOM.removeAllPlayersBtn.addEventListener('click', removeAllPlayers);

// Event delegation voor spelers acties (edit/delete)
DOM.playersList.addEventListener('click', e => {
    if (e.target.closest('.edit-player')) {
        const playerId = e.target.closest('.edit-player').getAttribute('data-id');
        editPlayer(playerId);
    } else if (e.target.closest('.delete-player')) {
        const playerId = e.target.closest('.delete-player').getAttribute('data-id');
        deletePlayer(playerId);
    }
});

// Speler bewerken modal
DOM.saveEditPlayerBtn.addEventListener('click', saveEditPlayer);

// Instellingen tab
DOM.saveSettingsBtn.addEventListener('click', saveSettings);

// Schema tab
DOM.generateScheduleBtn.addEventListener('click', generateSchedule);
DOM.exportScheduleBtn.addEventListener('click', exportSchedule);

// Veldindeling tab
DOM.roundSelect.addEventListener('change', displayFieldLayout);

// Wedstrijden tab
DOM.matchRoundSelect.addEventListener('change', displayMatches);
DOM.saveMatchResultBtn.addEventListener('click', saveMatchResult);

// Stand tab
DOM.printStandingsBtn.addEventListener('click', printStandings);

// Speleroverzicht tab
DOM.showAllRounds.addEventListener('change', displayPlayerOverview);
DOM.exportOverviewBtn.addEventListener('click', exportPlayerOverview);

// Tab change events voor dynamische updates
document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', function (event) {
        const target = event.target.getAttribute('data-bs-target');

        switch (target) {
            case '#fields':
                displayFieldLayout();
                break;
            case '#matches':
                displayMatches();
                break;
            case '#standings':
                updateStandings();
                break;
            case '#overview':
                displayPlayerOverview();
                break;
        }
    });
});

// State manager listeners
stateManager.subscribe(Events.PLAYERS_UPDATED, () => {
    // Update UI die afhankelijk is van spelers
});

stateManager.subscribe(Events.MATCH_RESULT_SAVED, () => {
    // Update andere tabs (stand, overzicht)
    updateStandings();
    displayPlayerOverview();
});

// ----------------------------------------
// Initialisatie
// ----------------------------------------

// Toepassing initialiseren
function initApp() {
    // Toon spelers
    displayPlayers();

    // Laad instellingen
    loadSettings();

    // Controleer of er een schema is en update UI
    const schedule = dataService.getSchedule();
    if (schedule && schedule.rounds && schedule.rounds.length > 0) {
        populateRoundSelects();
        displaySchedule();
    }
}

// Start de applicatie
document.addEventListener('DOMContentLoaded', initApp);
