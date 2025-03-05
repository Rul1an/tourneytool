// data.js - Centrale datastructuur voor de Voetbal Toernooi Tool
// Deze module voorziet in een gestructureerde manier om alle toernooigegevens te beheren

// Centraal data object
const TournamentData = {
    // Spelers array met consistente objectstructuur
    players: [],

    // Toernooi instellingen
    settings: {
        teamSize: 4,         // 3 of 4 spelers per team
        fieldsCount: 2,      // Aantal velden
        matchDuration: 8,    // Minuten per wedstrijd
        totalDuration: 120,  // Totale toernooiduur in minuten
        winPoints: 10,       // Punten voor winst
        drawPoints: 5,       // Punten voor gelijkspel
        goalPoints: 1        // Punten per doelpunt
    },

    // Wedstrijdschema
    schedule: {
        rounds: [],          // Array van rondes
        currentRound: 0      // Huidige actieve ronde
    },

    // Wedstrijdresultaten
    results: {},             // Object met wedstrijd ID's als sleutels

    // Veldindeling
    fieldAssignments: [],    // Array van veldindelingen per ronde

    // Versie voor migraties
    version: "1.0.0"
};

// Laden vanuit localStorage bij initialisatie
const loadData = () => {
    // Laad spelers
    const savedPlayers = localStorage.getItem('players');
    if (savedPlayers) {
        TournamentData.players = JSON.parse(savedPlayers);
    }

    // Laad instellingen
    const savedSettings = localStorage.getItem('tournamentSettings');
    if (savedSettings) {
        TournamentData.settings = JSON.parse(savedSettings);
    }

    // Laad schema
    const savedSchedule = localStorage.getItem('tournamentSchedule');
    if (savedSchedule) {
        TournamentData.schedule = JSON.parse(savedSchedule);
    }

    // Laad resultaten
    const savedResults = localStorage.getItem('matchResults');
    if (savedResults) {
        TournamentData.results = JSON.parse(savedResults);
    }

    // Laad veldindeling
    const savedFieldAssignments = localStorage.getItem('fieldAssignments');
    if (savedFieldAssignments) {
        TournamentData.fieldAssignments = JSON.parse(savedFieldAssignments);
    }
};

// Opslaan naar localStorage
const saveData = (key) => {
    switch (key) {
        case 'players':
            localStorage.setItem('players', JSON.stringify(TournamentData.players));
            break;
        case 'settings':
            localStorage.setItem('tournamentSettings', JSON.stringify(TournamentData.settings));
            break;
        case 'schedule':
            localStorage.setItem('tournamentSchedule', JSON.stringify(TournamentData.schedule));
            break;
        case 'results':
            localStorage.setItem('matchResults', JSON.stringify(TournamentData.results));
            break;
        case 'fieldAssignments':
            localStorage.setItem('fieldAssignments', JSON.stringify(TournamentData.fieldAssignments));
            break;
        case 'all':
            localStorage.setItem('players', JSON.stringify(TournamentData.players));
            localStorage.setItem('tournamentSettings', JSON.stringify(TournamentData.settings));
            localStorage.setItem('tournamentSchedule', JSON.stringify(TournamentData.schedule));
            localStorage.setItem('matchResults', JSON.stringify(TournamentData.results));
            localStorage.setItem('fieldAssignments', JSON.stringify(TournamentData.fieldAssignments));
            break;
    }
};

// Getters en setters
export const getPlayers = () => [...TournamentData.players];

export const setPlayers = (players) => {
    TournamentData.players = players;
    saveData('players');
};

export const addPlayer = (player) => {
    TournamentData.players.push(player);
    saveData('players');
};

export const updatePlayer = (playerId, updatedPlayerData) => {
    const playerIndex = TournamentData.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
        TournamentData.players[playerIndex] = {
            ...TournamentData.players[playerIndex],
            ...updatedPlayerData
        };
        saveData('players');
        return true;
    }
    return false;
};

export const removePlayer = (playerId) => {
    TournamentData.players = TournamentData.players.filter(p => p.id !== playerId);
    saveData('players');
};

export const removeAllPlayers = () => {
    TournamentData.players = [];
    saveData('players');
};

export const getSettings = () => ({ ...TournamentData.settings });

export const updateSettings = (newSettings) => {
    TournamentData.settings = { ...TournamentData.settings, ...newSettings };
    saveData('settings');
};

export const getSchedule = () => TournamentData.schedule;

export const setSchedule = (schedule) => {
    TournamentData.schedule = schedule;
    saveData('schedule');
};

export const getResults = () => ({ ...TournamentData.results });

export const setMatchResult = (matchId, homeScore, awayScore) => {
    TournamentData.results[matchId] = {
        ...TournamentData.results[matchId],
        homeScore,
        awayScore,
        completed: true
    };
    saveData('results');
};

export const getFieldAssignments = () => [...TournamentData.fieldAssignments];

export const setFieldAssignments = (assignments) => {
    TournamentData.fieldAssignments = assignments;
    saveData('fieldAssignments');
};

// Helper functies
export const getPlayersByCategory = (category) => {
    return TournamentData.players.filter(player => player.category === category);
};

export const getPlayerById = (playerId) => {
    return TournamentData.players.find(player => player.id === playerId);
};

export const getCurrentRoundNumber = () => TournamentData.schedule.currentRound;

export const setCurrentRoundNumber = (roundNumber) => {
    TournamentData.schedule.currentRound = roundNumber;
    saveData('schedule');
};

export const getPlayerScores = () => {
    // Bereken scores op basis van wedstrijdresultaten
    const playerScores = TournamentData.players.map(player => ({
        id: player.id,
        name: player.name,
        category: player.category,
        score: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        matches: 0
    }));

    // Verwerk alle wedstrijdresultaten
    Object.values(TournamentData.results).forEach(match => {
        if (!match.completed) return;

        const { homeTeam, awayTeam, homeScore, awayScore } = match;
        const homeWon = homeScore > awayScore;
        const isDraw = homeScore === awayScore;

        // Verwerk scores voor thuisteam
        homeTeam.playerIds.forEach(playerId => {
            const playerIndex = playerScores.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                playerScores[playerIndex].matches++;
                playerScores[playerIndex].goalsFor += homeScore;

                if (homeWon) {
                    playerScores[playerIndex].wins++;
                    playerScores[playerIndex].score += TournamentData.settings.winPoints + homeScore;
                } else if (isDraw) {
                    playerScores[playerIndex].draws++;
                    playerScores[playerIndex].score += TournamentData.settings.drawPoints + homeScore;
                } else {
                    playerScores[playerIndex].losses++;
                    playerScores[playerIndex].score += homeScore;
                }
            }
        });

        // Verwerk scores voor uitteam
        awayTeam.playerIds.forEach(playerId => {
            const playerIndex = playerScores.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                playerScores[playerIndex].matches++;
                playerScores[playerIndex].goalsFor += awayScore;

                if (!homeWon && !isDraw) {
                    playerScores[playerIndex].wins++;
                    playerScores[playerIndex].score += TournamentData.settings.winPoints + awayScore;
                } else if (isDraw) {
                    playerScores[playerIndex].draws++;
                    playerScores[playerIndex].score += TournamentData.settings.drawPoints + awayScore;
                } else {
                    playerScores[playerIndex].losses++;
                    playerScores[playerIndex].score += awayScore;
                }
            }
        });
    });

    // Sorteer op score (hoog naar laag)
    return playerScores.sort((a, b) => b.score - a.score);
};

// Initialiseer data bij laden
loadData();

export default {
    getPlayers,
    setPlayers,
    addPlayer,
    updatePlayer,
    removePlayer,
    removeAllPlayers,
    getSettings,
    updateSettings,
    getSchedule,
    setSchedule,
    getResults,
    setMatchResult,
    getFieldAssignments,
    setFieldAssignments,
    getPlayersByCategory,
    getPlayerById,
    getCurrentRoundNumber,
    setCurrentRoundNumber,
    getPlayerScores
};
