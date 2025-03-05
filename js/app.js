// Tournament App Main JavaScript File

// Data Model
const tournamentData = {
    players: [],
    settings: {
        teamSize: 4,
        fieldsCount: 4,
        matchDuration: 8,
        tournamentDuration: 90,
        winPoints: 10,
        drawPoints: 5,
        goalPoints: 1
    },
    rounds: [],
    matches: [],
    nextPlayerId: 1
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function () {
    // Initialize settings
    initSettings();

    // Load data from localStorage if available
    loadFromLocalStorage();

    // Set up event listeners
    setupEventListeners();

    // Update UI with loaded data
    updateUI();

    // Setup Bootstrap tab events voor spelersoverzicht
    const overviewTab = document.getElementById('overview-tab');
    overviewTab.addEventListener('shown.bs.tab', function (e) {
        console.log('Spelersoverzicht tab geactiveerd');
        displayPlayerOverview();
    });
});

// Initialize settings from form
function initSettings() {
    document.getElementById('teamSize').value = tournamentData.settings.teamSize;
    document.getElementById('fieldsCount').value = tournamentData.settings.fieldsCount;
    document.getElementById('matchDuration').value = tournamentData.settings.matchDuration;
    document.getElementById('tournamentDuration').value = tournamentData.settings.tournamentDuration;
    document.getElementById('winPoints').value = tournamentData.settings.winPoints;
    document.getElementById('drawPoints').value = tournamentData.settings.drawPoints;
    document.getElementById('goalPoints').value = tournamentData.settings.goalPoints;
}

// Save settings from form
function saveSettings() {
    tournamentData.settings.teamSize = parseInt(document.getElementById('teamSize').value);
    tournamentData.settings.fieldsCount = parseInt(document.getElementById('fieldsCount').value);
    tournamentData.settings.matchDuration = parseInt(document.getElementById('matchDuration').value);
    tournamentData.settings.tournamentDuration = parseInt(document.getElementById('tournamentDuration').value);
    tournamentData.settings.winPoints = parseInt(document.getElementById('winPoints').value);
    tournamentData.settings.drawPoints = parseInt(document.getElementById('drawPoints').value);
    tournamentData.settings.goalPoints = parseInt(document.getElementById('goalPoints').value);

    saveToLocalStorage();

    // Show confirmation
    alert('Instellingen opgeslagen!');
}

// Setup Event Listeners
function setupEventListeners() {
    // Player Management
    document.getElementById('addPlayerBtn').addEventListener('click', addPlayer);
    document.getElementById('importPlayersBtn').addEventListener('click', importPlayers);
    document.getElementById('playersList').addEventListener('click', handlePlayerAction);
    document.getElementById('removeAllPlayersBtn').addEventListener('click', removeAllPlayers);

    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    // Schedule
    document.getElementById('generateScheduleBtn').addEventListener('click', generateSchedule);
    document.getElementById('exportScheduleBtn').addEventListener('click', exportSchedule);

    // Fields view
    document.getElementById('roundSelect').addEventListener('change', displayFieldsForRound);

    // Matches
    document.getElementById('matchRoundSelect').addEventListener('change', displayMatchesForRound);
    document.getElementById('matchesContainer').addEventListener('click', handleMatchAction);
    document.getElementById('saveMatchResultBtn').addEventListener('click', saveMatchResult);

    // Standings
    document.getElementById('printStandingsBtn').addEventListener('click', printStandings);

    // Player Overview
    document.getElementById('exportOverviewBtn').addEventListener('click', exportPlayerOverview);
    document.getElementById('showAllRounds').addEventListener('change', displayPlayerOverview);

    // Modal Handlers
    document.getElementById('saveEditPlayerBtn').addEventListener('click', saveEditPlayer);

    // Tab change event voor spelersoverzicht
    document.getElementById('overview-tab').addEventListener('click', displayPlayerOverview);
}

// Player Management Functions
function addPlayer() {
    const playerName = document.getElementById('playerName').value.trim();
    const playerCategory = document.getElementById('playerCategory').value;

    if (playerName === '') {
        alert('Vul een naam in voor de speler.');
        return;
    }

    const player = {
        id: tournamentData.nextPlayerId++,
        name: playerName,
        category: playerCategory,
        stats: {
            wins: 0,
            draws: 0,
            losses: 0,
            goals: 0,
            points: 0
        }
    };

    tournamentData.players.push(player);

    // Clear input field
    document.getElementById('playerName').value = '';

    // Update UI and save
    updatePlayersList();
    saveToLocalStorage();
}

function importPlayers() {
    const fileInput = document.getElementById('importPlayersFile');

    if (fileInput.files.length === 0) {
        alert('Selecteer eerst een bestand');
        return;
    }

    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        const lines = contents.split('\n');

        let importCount = 0;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '') continue;

            let name, category;

            if (trimmedLine.includes(',')) {
                const parts = trimmedLine.split(',');
                name = parts[0].trim();
                category = parts[1].trim();
            } else {
                name = trimmedLine;
                category = 'JO15'; // Default category gewijzigd naar JO15
            }

            // Only import if name is valid
            if (name) {
                const player = {
                    id: tournamentData.nextPlayerId++,
                    name: name,
                    category: category,
                    stats: {
                        wins: 0,
                        draws: 0,
                        losses: 0,
                        goals: 0,
                        points: 0
                    }
                };

                tournamentData.players.push(player);
                importCount++;
            }
        }

        // Clear file input
        fileInput.value = '';

        // Update UI and save
        updatePlayersList();
        saveToLocalStorage();

        alert(`${importCount} spelers geïmporteerd!`);
    };

    reader.readAsText(file);
}

function handlePlayerAction(e) {
    // Zoek het button element (kan e.target zijn of een parent)
    let target = e.target;
    while (target && target.tagName !== 'BUTTON') {
        target = target.parentElement;
    }

    if (!target) return;

    if (target.classList.contains('edit-player-btn')) {
        const playerId = parseInt(target.dataset.playerId);
        editPlayer(playerId);
    } else if (target.classList.contains('delete-player-btn')) {
        const playerId = parseInt(target.dataset.playerId);
        deletePlayer(playerId);
    }
}

function editPlayer(playerId) {
    const player = tournamentData.players.find(p => p.id === playerId);

    if (!player) return;

    document.getElementById('editPlayerId').value = player.id;
    document.getElementById('editPlayerName').value = player.name;
    document.getElementById('editPlayerCategory').value = player.category;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editPlayerModal'));
    modal.show();
}

function saveEditPlayer() {
    const playerId = parseInt(document.getElementById('editPlayerId').value);
    const playerName = document.getElementById('editPlayerName').value.trim();
    const playerCategory = document.getElementById('editPlayerCategory').value;

    if (playerName === '') {
        alert('Vul een naam in voor de speler.');
        return;
    }

    const player = tournamentData.players.find(p => p.id === playerId);

    if (player) {
        player.name = playerName;
        player.category = playerCategory;

        // Update UI and save
        updatePlayersList();
        saveToLocalStorage();

        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editPlayerModal'));
        modal.hide();
    }
}

function deletePlayer(playerId) {
    if (!confirm('Weet je zeker dat je deze speler wilt verwijderen?')) {
        return;
    }

    tournamentData.players = tournamentData.players.filter(p => p.id !== playerId);

    // Update UI and save
    updatePlayersList();
    saveToLocalStorage();
}

function updatePlayersList() {
    const tbody = document.getElementById('playersList');
    tbody.innerHTML = '';

    tournamentData.players.forEach((player, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.category}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-player-btn" data-player-id="${player.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-player-btn" data-player-id="${player.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// Schedule Generation Functions
function generateSchedule() {
    if (tournamentData.players.length < tournamentData.settings.teamSize * 2) {
        alert(`Je hebt minimaal ${tournamentData.settings.teamSize * 2} spelers nodig voor een ${tournamentData.settings.teamSize}v${tournamentData.settings.teamSize} toernooi!`);
        return;
    }

    // Clear existing schedule
    tournamentData.rounds = [];
    tournamentData.matches = [];

    // Calculate how many rounds we can fit
    const roundDuration = tournamentData.settings.matchDuration;
    const totalDuration = tournamentData.settings.tournamentDuration;
    const possibleRounds = Math.floor(totalDuration / roundDuration);

    // Generate rounds
    for (let i = 0; i < possibleRounds; i++) {
        generateRound(i + 1);
    }

    // Update round selectors
    updateRoundSelectors();

    // Display the schedule
    displaySchedule();

    // Save to localStorage
    saveToLocalStorage();
}

function generateRound(roundNumber) {
    // Shuffle players for this round
    const shuffledPlayers = [...tournamentData.players].sort(() => Math.random() - 0.5);

    const teamSize = tournamentData.settings.teamSize;
    const fieldsCount = tournamentData.settings.fieldsCount;

    // Create teams for this round
    const teams = [];
    const playerAssignments = {};
    const maxTeams = Math.floor(shuffledPlayers.length / teamSize) * 2;
    const teamsCount = Math.min(maxTeams, fieldsCount * 2);

    for (let i = 0; i < teamsCount; i++) {
        teams.push([]);
    }

    // Assign players to teams
    for (let i = 0; i < shuffledPlayers.length; i++) {
        const teamIndex = i % teams.length;
        if (teams[teamIndex].length < teamSize) {
            teams[teamIndex].push(shuffledPlayers[i]);
            playerAssignments[shuffledPlayers[i].id] = String.fromCharCode(65 + teamIndex); // Assign A, B, C, etc.
        }
    }

    // Create matches
    const matches = [];

    for (let i = 0; i < teams.length; i += 2) {
        if (i + 1 < teams.length) {
            const match = {
                id: tournamentData.matches.length + 1,
                round: roundNumber,
                field: Math.floor(i / 2) + 1,
                homeTeam: {
                    letter: String.fromCharCode(65 + i),
                    players: teams[i]
                },
                awayTeam: {
                    letter: String.fromCharCode(65 + i + 1),
                    players: teams[i + 1]
                },
                homeScore: null,
                awayScore: null,
                completed: false
            };

            matches.push(match);
            tournamentData.matches.push(match);
        }
    }

    // Create round object
    const round = {
        number: roundNumber,
        playerAssignments: playerAssignments,
        teams: teams,
        matches: matches
    };

    tournamentData.rounds.push(round);

    return round;
}

function updateRoundSelectors() {
    const roundSelect = document.getElementById('roundSelect');
    const matchRoundSelect = document.getElementById('matchRoundSelect');

    // Clear existing options
    roundSelect.innerHTML = '';
    matchRoundSelect.innerHTML = '';

    // Add options for each round
    tournamentData.rounds.forEach(round => {
        const roundOption = document.createElement('option');
        roundOption.value = round.number;
        roundOption.textContent = `Ronde ${round.number}`;

        const matchRoundOption = roundOption.cloneNode(true);

        roundSelect.appendChild(roundOption);
        matchRoundSelect.appendChild(matchRoundOption);
    });

    // Trigger change to display first round
    if (tournamentData.rounds.length > 0) {
        displayFieldsForRound();
        displayMatchesForRound();
    }
}

function displaySchedule() {
    const scheduleContainer = document.getElementById('scheduleContainer');
    scheduleContainer.innerHTML = '';

    if (tournamentData.rounds.length === 0) {
        scheduleContainer.innerHTML = '<div class="alert alert-info">Nog geen schema gegenereerd. Klik op "Genereer Schema" om te beginnen.</div>';
        return;
    }

    tournamentData.rounds.forEach(round => {
        // Create round header
        const roundHeader = document.createElement('div');
        roundHeader.className = 'round-divider';
        roundHeader.textContent = `Ronde ${round.number}`;
        scheduleContainer.appendChild(roundHeader);

        // Create matches for this round
        round.matches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';

            let homeTeamPlayers = match.homeTeam.players.map(p => p.name).join(', ');
            let awayTeamPlayers = match.awayTeam.players.map(p => p.name).join(', ');

            let resultText = '';
            if (match.completed) {
                resultText = `<div class="match-result">${match.homeScore} - ${match.awayScore}</div>`;
            }

            matchCard.innerHTML = `
                <div class="row">
                    <div class="col-5">
                        <div class="fw-bold">Team ${match.homeTeam.letter}</div>
                        <div class="small">${homeTeamPlayers}</div>
                    </div>
                    <div class="col-2 text-center">
                        ${resultText}
                        <div class="match-field">Veld ${match.field}</div>
                    </div>
                    <div class="col-5">
                        <div class="fw-bold">Team ${match.awayTeam.letter}</div>
                        <div class="small">${awayTeamPlayers}</div>
                    </div>
                </div>
            `;

            scheduleContainer.appendChild(matchCard);
        });
    });
}

function exportSchedule() {
    if (tournamentData.rounds.length === 0) {
        alert('Genereer eerst een schema voordat je het exporteert.');
        return;
    }

    let csvContent = 'Ronde,Veld,Team 1,Spelers Team 1,Team 2,Spelers Team 2,Score\n';

    tournamentData.rounds.forEach(round => {
        round.matches.forEach(match => {
            const homeTeamPlayers = match.homeTeam.players.map(p => p.name).join(' / ');
            const awayTeamPlayers = match.awayTeam.players.map(p => p.name).join(' / ');

            let scoreText = 'Nog niet gespeeld';
            if (match.completed) {
                scoreText = `${match.homeScore} - ${match.awayScore}`;
            }

            csvContent += `${round.number},${match.field},Team ${match.homeTeam.letter},"${homeTeamPlayers}",Team ${match.awayTeam.letter},"${awayTeamPlayers}","${scoreText}"\n`;
        });
    });

    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'voetbal_toernooi_schema.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Field Layout Functions
function displayFieldsForRound() {
    const roundSelect = document.getElementById('roundSelect');
    const fieldsContainer = document.getElementById('fieldsContainer');

    fieldsContainer.innerHTML = '';

    if (tournamentData.rounds.length === 0) {
        fieldsContainer.innerHTML = '<div class="alert alert-info col-12">Nog geen schema gegenereerd. Ga naar het "Schema" tabblad om een schema te genereren.</div>';
        return;
    }

    const roundNumber = parseInt(roundSelect.value);
    const round = tournamentData.rounds.find(r => r.number === roundNumber);

    if (!round) {
        return;
    }

    // Find all players not assigned in this round
    const assignedPlayerIds = Object.keys(round.playerAssignments).map(id => parseInt(id));
    const unassignedPlayers = tournamentData.players.filter(p => !assignedPlayerIds.includes(p.id));

    // Display fields
    round.matches.forEach(match => {
        const fieldCard = document.createElement('div');
        fieldCard.className = 'col-md-6 mb-4';

        const homeTeamPlayers = match.homeTeam.players.map(p =>
            `<div class="player-item">${p.name} (${p.category})</div>`
        ).join('');

        const awayTeamPlayers = match.awayTeam.players.map(p =>
            `<div class="player-item">${p.name} (${p.category})</div>`
        ).join('');

        fieldCard.innerHTML = `
            <div class="field-card">
                <h4 class="text-center mb-3">Veld ${match.field}</h4>
                <div class="row">
                    <div class="col-6">
                        <div class="team-container">
                            <div class="team-heading">Team ${match.homeTeam.letter}</div>
                            ${homeTeamPlayers}
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="team-container">
                            <div class="team-heading">Team ${match.awayTeam.letter}</div>
                            ${awayTeamPlayers}
                        </div>
                    </div>
                </div>
            </div>
        `;

        fieldsContainer.appendChild(fieldCard);
    });

    // Display unassigned players
    if (unassignedPlayers.length > 0) {
        const unassignedCard = document.createElement('div');
        unassignedCard.className = 'col-12 mb-4';

        const unassignedPlayersHtml = unassignedPlayers.map(p =>
            `<div class="player-item">${p.name} (${p.category})</div>`
        ).join('');

        unassignedCard.innerHTML = `
            <div class="field-card bg-light">
                <h4 class="text-center mb-3">Rust deze ronde</h4>
                <div class="row">
                    <div class="col-12">
                        <div class="team-container">
                            ${unassignedPlayersHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        fieldsContainer.appendChild(unassignedCard);
    }
}

// Match Results Functions
function displayMatchesForRound() {
    const roundSelect = document.getElementById('matchRoundSelect');
    const matchesContainer = document.getElementById('matchesContainer');

    matchesContainer.innerHTML = '';

    if (tournamentData.rounds.length === 0) {
        matchesContainer.innerHTML = '<div class="alert alert-info">Nog geen schema gegenereerd. Ga naar het "Schema" tabblad om een schema te genereren.</div>';
        return;
    }

    const roundNumber = parseInt(roundSelect.value);
    const round = tournamentData.rounds.find(r => r.number === roundNumber);

    if (!round) {
        return;
    }

    round.matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';

        const homeTeamPlayers = match.homeTeam.players.map(p => p.name).join(', ');
        const awayTeamPlayers = match.awayTeam.players.map(p => p.name).join(', ');

        let resultText = 'Nog niet gespeeld';
        let buttonText = 'Invoeren';

        if (match.completed) {
            resultText = `${match.homeScore} - ${match.awayScore}`;
            buttonText = 'Bewerken';
        }

        matchCard.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-3">
                    <div class="fw-bold">Team ${match.homeTeam.letter}</div>
                    <div class="small">${homeTeamPlayers}</div>
                </div>
                <div class="col-md-3">
                    <div class="fw-bold">Team ${match.awayTeam.letter}</div>
                    <div class="small">${awayTeamPlayers}</div>
                </div>
                <div class="col-md-3 text-center">
                    <span class="match-result">${resultText}</span>
                    <div class="match-field">Veld ${match.field}</div>
                </div>
                <div class="col-md-3 text-end">
                    <button class="btn btn-primary btn-sm enter-result-btn" data-match-id="${match.id}">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;

        matchesContainer.appendChild(matchCard);
    });
}

function handleMatchAction(e) {
    if (e.target.classList.contains('enter-result-btn')) {
        const matchId = parseInt(e.target.dataset.matchId);
        openMatchResultDialog(matchId);
    }
}

function openMatchResultDialog(matchId) {
    const match = tournamentData.matches.find(m => m.id === matchId);

    if (!match) return;

    document.getElementById('editMatchId').value = match.id;
    document.getElementById('homeTeamName').textContent = `Team ${match.homeTeam.letter}`;
    document.getElementById('awayTeamName').textContent = `Team ${match.awayTeam.letter}`;

    if (match.completed) {
        document.getElementById('homeTeamScore').value = match.homeScore;
        document.getElementById('awayTeamScore').value = match.awayScore;
    } else {
        document.getElementById('homeTeamScore').value = 0;
        document.getElementById('awayTeamScore').value = 0;
    }

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('matchResultModal'));
    modal.show();
}

function saveMatchResult() {
    const matchId = parseInt(document.getElementById('editMatchId').value);
    const homeScore = parseInt(document.getElementById('homeTeamScore').value);
    const awayScore = parseInt(document.getElementById('awayTeamScore').value);

    const match = tournamentData.matches.find(m => m.id === matchId);

    if (!match) return;

    const wasCompleted = match.completed;

    // Update match
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.completed = true;

    // Calculate points for players
    if (!wasCompleted) {
        // First time completion, award points
        updatePlayerStatsForMatch(match);
    } else {
        // Match was already completed, reset stats and recalculate
        resetPlayerStatsForMatch(match);
        updatePlayerStatsForMatch(match);
    }

    // Update UI
    displayMatchesForRound();
    displaySchedule();
    updateStandings();
    displayPlayerOverview();

    // Save data
    saveToLocalStorage();

    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('matchResultModal'));
    modal.hide();
}

function updatePlayerStatsForMatch(match) {
    const { winPoints, drawPoints, goalPoints } = tournamentData.settings;

    const homeWin = match.homeScore > match.awayScore;
    const awayWin = match.homeScore < match.awayScore;
    const draw = match.homeScore === match.awayScore;

    // Update home team players
    match.homeTeam.players.forEach(player => {
        // Find player in overall list
        const p = tournamentData.players.find(p => p.id === player.id);
        if (!p) return;

        // Update stats
        if (homeWin) {
            p.stats.wins++;
            p.stats.points += winPoints;
        } else if (draw) {
            p.stats.draws++;
            p.stats.points += drawPoints;
        } else if (awayWin) {
            p.stats.losses++;
        }

        // Add points for goals
        p.stats.goals += match.homeScore;
        p.stats.points += match.homeScore * goalPoints;
    });

    // Update away team players
    match.awayTeam.players.forEach(player => {
        // Find player in overall list
        const p = tournamentData.players.find(p => p.id === player.id);
        if (!p) return;

        // Update stats
        if (awayWin) {
            p.stats.wins++;
            p.stats.points += winPoints;
        } else if (draw) {
            p.stats.draws++;
            p.stats.points += drawPoints;
        } else if (homeWin) {
            p.stats.losses++;
        }

        // Add points for goals
        p.stats.goals += match.awayScore;
        p.stats.points += match.awayScore * goalPoints;
    });
}

function resetPlayerStatsForMatch(match) {
    const { winPoints, drawPoints, goalPoints } = tournamentData.settings;

    const homeWin = match.homeScore > match.awayScore;
    const awayWin = match.homeScore < match.awayScore;
    const draw = match.homeScore === match.awayScore;

    // Reset home team players
    match.homeTeam.players.forEach(player => {
        // Find player in overall list
        const p = tournamentData.players.find(p => p.id === player.id);
        if (!p) return;

        // Reset stats
        if (homeWin) {
            p.stats.wins--;
            p.stats.points -= winPoints;
        } else if (draw) {
            p.stats.draws--;
            p.stats.points -= drawPoints;
        } else if (awayWin) {
            p.stats.losses--;
        }

        // Remove points for goals
        p.stats.goals -= match.homeScore;
        p.stats.points -= match.homeScore * goalPoints;
    });

    // Reset away team players
    match.awayTeam.players.forEach(player => {
        // Find player in overall list
        const p = tournamentData.players.find(p => p.id === player.id);
        if (!p) return;

        // Reset stats
        if (awayWin) {
            p.stats.wins--;
            p.stats.points -= winPoints;
        } else if (draw) {
            p.stats.draws--;
            p.stats.points -= drawPoints;
        } else if (homeWin) {
            p.stats.losses--;
        }

        // Remove points for goals
        p.stats.goals -= match.awayScore;
        p.stats.points -= match.awayScore * goalPoints;
    });
}

// Standings Functions
function updateStandings() {
    // Get all players sorted by points (descending)
    const sortedPlayers = [...tournamentData.players].sort((a, b) => {
        if (b.stats.points !== a.stats.points) {
            return b.stats.points - a.stats.points;
        }
        // If points are equal, sort by goals
        return b.stats.goals - a.stats.goals;
    });

    // Filter players by category
    const jo15Players = sortedPlayers.filter(p => p.category === 'JO15');
    const jo16Players = sortedPlayers.filter(p => p.category === 'JO16');

    // Update all players standings
    updateStandingsTable('allStandingsList', sortedPlayers);

    // Update category standings
    updateStandingsTable('o11StandingsList', jo15Players);
    updateStandingsTable('o12StandingsList', jo16Players);
}

function updateStandingsTable(tableId, players) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';

    players.forEach((player, index) => {
        const row = document.createElement('tr');

        // Add position medal for top 3
        let medal = '';
        if (index === 0) {
            medal = '<span class="medal-gold">1</span>';
        } else if (index === 1) {
            medal = '<span class="medal-silver">2</span>';
        } else if (index === 2) {
            medal = '<span class="medal-bronze">3</span>';
        } else {
            medal = (index + 1).toString();
        }

        // Create row content based on table type
        if (tableId === 'allStandingsList') {
            row.innerHTML = `
                <td>${medal}</td>
                <td>${player.name}</td>
                <td>${player.category}</td>
                <td>${player.stats.wins}</td>
                <td>${player.stats.draws}</td>
                <td>${player.stats.losses}</td>
                <td>${player.stats.goals}</td>
                <td class="fw-bold">${player.stats.points}</td>
            `;
        } else {
            row.innerHTML = `
                <td>${medal}</td>
                <td>${player.name}</td>
                <td>${player.stats.wins}</td>
                <td>${player.stats.draws}</td>
                <td>${player.stats.losses}</td>
                <td>${player.stats.goals}</td>
                <td class="fw-bold">${player.stats.points}</td>
            `;
        }

        tbody.appendChild(row);
    });
}

function printStandings() {
    window.print();
}

// LocalStorage Functions
function saveToLocalStorage() {
    localStorage.setItem('tournamentData', JSON.stringify(tournamentData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('tournamentData');

    if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Update tournament data
        tournamentData.players = parsedData.players || [];
        tournamentData.settings = parsedData.settings || tournamentData.settings;
        tournamentData.rounds = parsedData.rounds || [];
        tournamentData.matches = parsedData.matches || [];
        tournamentData.nextPlayerId = parsedData.nextPlayerId || 1;
    }
}

// Update the UI based on loaded data
function updateUI() {
    updatePlayersList();

    if (tournamentData.rounds.length > 0) {
        updateRoundSelectors();
        displaySchedule();
        updateStandings();
        displayPlayerOverview();
    }

    initSettings();
}

// Player Overview Functions
function displayPlayerOverview() {
    console.log("displayPlayerOverview aangeroepen");

    // Check of de benodigde elementen bestaan
    const tableHead = document.getElementById('playerOverviewTableHead');
    const tableBody = document.getElementById('playerOverviewTableBody');

    if (!tableHead || !tableBody) {
        console.error("Spelersoverzicht tabellen niet gevonden!", tableHead, tableBody);
        return;
    }

    const showAllRoundsCheckbox = document.getElementById('showAllRounds');
    if (!showAllRoundsCheckbox) {
        console.error("showAllRounds checkbox niet gevonden!");
        return;
    }

    const showAllRounds = showAllRoundsCheckbox.checked;

    // Clear existing data
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (!tournamentData || !tournamentData.rounds || tournamentData.rounds.length === 0) {
        console.log("Geen rondes beschikbaar voor weergave");
        tableBody.innerHTML = '<tr><td colspan="20" class="text-center">Nog geen schema gegenereerd. Ga naar het "Schema" tabblad om een schema te genereren.</td></tr>';
        return;
    }

    console.log("Aantal rondes: " + tournamentData.rounds.length);
    console.log("Aantal spelers: " + tournamentData.players.length);

    // Create header row
    const headerRow = document.createElement('tr');

    // Add player name column
    headerRow.innerHTML = '<th>Speler</th><th>Categorie</th>';

    // Add round columns
    tournamentData.rounds.forEach(round => {
        if (showAllRounds || round === tournamentData.rounds[tournamentData.rounds.length - 1]) {
            headerRow.innerHTML += `
                <th colspan="2" class="text-center">Ronde ${round.number}</th>
            `;
        }
    });

    tableHead.appendChild(headerRow);

    // Create column labels row
    const labelsRow = document.createElement('tr');
    labelsRow.innerHTML = '<th></th><th></th>';

    tournamentData.rounds.forEach(round => {
        if (showAllRounds || round === tournamentData.rounds[tournamentData.rounds.length - 1]) {
            labelsRow.innerHTML += `
                <th>Team</th>
                <th>Score</th>
            `;
        }
    });

    tableHead.appendChild(labelsRow);

    // Create a row for each player
    tournamentData.players.forEach(player => {
        const row = document.createElement('tr');

        // Add player name and category
        row.innerHTML = `<td>${player.name}</td><td>${player.category}</td>`;

        // Add data for each round
        tournamentData.rounds.forEach(round => {
            if (showAllRounds || round === tournamentData.rounds[tournamentData.rounds.length - 1]) {
                // Find player's team in this round
                const teamLetter = round.playerAssignments[player.id] || '-';

                // Find match result for this player in this round
                let matchResult = '-';
                let playerTeam = null;

                // Find the match where this player participated
                const match = round.matches.find(m => {
                    const inHomeTeam = m.homeTeam.players.some(p => p.id === player.id);
                    const inAwayTeam = m.awayTeam.players.some(p => p.id === player.id);

                    if (inHomeTeam) {
                        playerTeam = 'home';
                        return true;
                    } else if (inAwayTeam) {
                        playerTeam = 'away';
                        return true;
                    }

                    return false;
                });

                if (match && match.completed) {
                    if (playerTeam === 'home') {
                        if (match.homeScore > match.awayScore) {
                            matchResult = `W ${match.homeScore}-${match.awayScore}`;
                        } else if (match.homeScore < match.awayScore) {
                            matchResult = `V ${match.homeScore}-${match.awayScore}`;
                        } else {
                            matchResult = `G ${match.homeScore}-${match.awayScore}`;
                        }
                    } else if (playerTeam === 'away') {
                        if (match.awayScore > match.homeScore) {
                            matchResult = `W ${match.awayScore}-${match.homeScore}`;
                        } else if (match.awayScore < match.homeScore) {
                            matchResult = `V ${match.awayScore}-${match.homeScore}`;
                        } else {
                            matchResult = `G ${match.awayScore}-${match.homeScore}`;
                        }
                    }
                } else if (teamLetter !== '-') {
                    matchResult = 'Nog niet gespeeld';
                }

                row.innerHTML += `
                    <td class="text-center">${teamLetter}</td>
                    <td class="text-center">${matchResult}</td>
                `;
            }
        });

        tableBody.appendChild(row);
    });

    console.log("Spelersoverzicht bijgewerkt");
}

function exportPlayerOverview() {
    if (tournamentData.rounds.length === 0) {
        alert('Genereer eerst een schema voordat je het exporteert.');
        return;
    }

    let csvContent = 'Speler,Categorie';

    // Add headers for each round
    tournamentData.rounds.forEach(round => {
        csvContent += `,Ronde ${round.number} Team,Ronde ${round.number} Score`;
    });

    csvContent += '\n';

    // Add data for each player
    tournamentData.players.forEach(player => {
        csvContent += `"${player.name}","${player.category}"`;

        // Add data for each round
        tournamentData.rounds.forEach(round => {
            // Find player's team in this round
            const teamLetter = round.playerAssignments[player.id] || '-';

            // Find match result for this player in this round
            let matchResult = '-';
            let playerTeam = null;

            // Find the match where this player participated
            const match = round.matches.find(m => {
                const inHomeTeam = m.homeTeam.players.some(p => p.id === player.id);
                const inAwayTeam = m.awayTeam.players.some(p => p.id === player.id);

                if (inHomeTeam) {
                    playerTeam = 'home';
                    return true;
                } else if (inAwayTeam) {
                    playerTeam = 'away';
                    return true;
                }

                return false;
            });

            if (match && match.completed) {
                if (playerTeam === 'home') {
                    if (match.homeScore > match.awayScore) {
                        matchResult = `W ${match.homeScore}-${match.awayScore}`;
                    } else if (match.homeScore < match.awayScore) {
                        matchResult = `V ${match.homeScore}-${match.awayScore}`;
                    } else {
                        matchResult = `G ${match.homeScore}-${match.awayScore}`;
                    }
                } else if (playerTeam === 'away') {
                    if (match.awayScore > match.homeScore) {
                        matchResult = `W ${match.awayScore}-${match.homeScore}`;
                    } else if (match.awayScore < match.homeScore) {
                        matchResult = `V ${match.awayScore}-${match.homeScore}`;
                    } else {
                        matchResult = `G ${match.awayScore}-${match.homeScore}`;
                    }
                }
            } else if (teamLetter !== '-') {
                matchResult = 'Nog niet gespeeld';
            }

            csvContent += `,"${teamLetter}","${matchResult}"`;
        });

        csvContent += '\n';
    });

    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'voetbal_toernooi_spelersoverzicht.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Functie toevoegen om alle spelers te verwijderen
function removeAllPlayers() {
    if (tournamentData.players.length === 0) {
        alert('Er zijn geen spelers om te verwijderen.');
        return;
    }

    if (confirm('Weet je zeker dat je ALLE spelers wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
        // Reset players array en nextPlayerId
        tournamentData.players = [];
        tournamentData.nextPlayerId = 1;

        // Als er een schema is gegenereerd, verwijder deze ook
        if (tournamentData.rounds.length > 0) {
            if (confirm('Er is een toernooischema actief. Wil je dit ook verwijderen?')) {
                tournamentData.rounds = [];
                tournamentData.matches = [];
            }
        }

        // Update UI en opslaan
        updatePlayersList();
        updateStandings();
        if (typeof displayPlayerOverview === 'function') {
            displayPlayerOverview();
        }
        saveToLocalStorage();

        alert('Alle spelers zijn verwijderd.');
    }
}
