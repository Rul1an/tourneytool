// playerOverview.js - Module voor speleroverzicht functionaliteit

import { getPlayers, getResults, getSchedule } from './data.js';

// Zoek de scores van een speler per ronde
export const getPlayerRoundScores = (playerId, roundsCount) => {
    const results = [];
    const schedule = getSchedule();
    const allResults = getResults();

    // Voor elke ronde
    for (let round = 1; round <= roundsCount; round++) {
        // Zoek de ronde in het schema
        const roundData = schedule.rounds.find(r => r.number === round);

        if (!roundData) {
            results.push({ round, score: null, teams: null });
            continue;
        }

        // Controleer of speler rust heeft
        if (roundData.restingPlayers && roundData.restingPlayers.includes(playerId)) {
            results.push({ round, score: 'Rust', teams: null });
            continue;
        }

        // Zoek de wedstrijd waar de speler in speelt
        let playerMatch = null;
        let isHomeTeam = false;

        for (const match of roundData.matches) {
            if (match.team1.playerIds.includes(playerId)) {
                playerMatch = match;
                isHomeTeam = true;
                break;
            } else if (match.team2.playerIds.includes(playerId)) {
                playerMatch = match;
                isHomeTeam = false;
                break;
            }
        }

        if (!playerMatch) {
            results.push({ round, score: null, teams: null });
            continue;
        }

        // Controleer of er een resultaat is voor deze wedstrijd
        const matchResult = allResults[playerMatch.id];
        if (!matchResult || !matchResult.completed) {
            results.push({
                round,
                score: 'Geen uitslag',
                teams: isHomeTeam ?
                    `Team ${playerMatch.team1.id.replace('team_', '')}` :
                    `Team ${playerMatch.team2.id.replace('team_', '')}`
            });
            continue;
        }

        // Bereken score voor de speler
        let playerScore = 0;
        let outcome = '';

        const { homeScore, awayScore } = matchResult;

        if (isHomeTeam) {
            // Speler zit in het thuisteam
            playerScore += homeScore; // Punten voor doelpunten

            if (homeScore > awayScore) {
                // Winst
                playerScore += 10; // Punten voor winst
                outcome = 'W';
            } else if (homeScore === awayScore) {
                // Gelijkspel
                playerScore += 5; // Punten voor gelijkspel
                outcome = 'G';
            } else {
                // Verlies
                outcome = 'V';
            }
        } else {
            // Speler zit in het uitteam
            playerScore += awayScore; // Punten voor doelpunten

            if (awayScore > homeScore) {
                // Winst
                playerScore += 10; // Punten voor winst
                outcome = 'W';
            } else if (awayScore === homeScore) {
                // Gelijkspel
                playerScore += 5; // Punten voor gelijkspel
                outcome = 'G';
            } else {
                // Verlies
                outcome = 'V';
            }
        }

        results.push({
            round,
            score: playerScore,
            teams: isHomeTeam ?
                `Team ${playerMatch.team1.id.replace('team_', '')}` :
                `Team ${playerMatch.team2.id.replace('team_', '')}`,
            outcome,
            goalsFor: isHomeTeam ? homeScore : awayScore,
            goalsAgainst: isHomeTeam ? awayScore : homeScore
        });
    }

    return results;
};

// Genereer overzicht data voor alle spelers per team
export const generatePlayerOverviewData = (showAllRounds = true) => {
    const players = getPlayers().sort((a, b) => {
        // Sorteer eerst op categorie en dan op naam
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
    });

    const schedule = getSchedule();
    const roundsCount = schedule.rounds.length;

    // Groepeer spelers per categorie
    const playersByCategory = {};
    players.forEach(player => {
        if (!playersByCategory[player.category]) {
            playersByCategory[player.category] = [];
        }

        // Bereken scores per ronde
        const roundScores = getPlayerRoundScores(player.id, roundsCount);

        // Bereken totaalscore
        const totalScore = roundScores.reduce((sum, round) => {
            return sum + (typeof round.score === 'number' ? round.score : 0);
        }, 0);

        playersByCategory[player.category].push({
            ...player,
            roundScores,
            totalScore
        });
    });

    // Sorteer spelers per categorie op totaalscore
    Object.keys(playersByCategory).forEach(category => {
        playersByCategory[category].sort((a, b) => b.totalScore - a.totalScore);
    });

    return {
        playersByCategory,
        roundsCount,
        showAllRounds
    };
};

// Genereer Excel-exportgegevens
export const generateExcelData = (overviewData) => {
    const { playersByCategory, roundsCount, showAllRounds } = overviewData;

    let excelData = [];

    // Headers
    const headers = ['Naam', 'Categorie'];

    if (showAllRounds) {
        for (let round = 1; round <= roundsCount; round++) {
            headers.push(`Ronde ${round}`);
        }
    }

    headers.push('Totaal');
    excelData.push(headers);

    // Voeg spelers toe per categorie
    Object.keys(playersByCategory).forEach(category => {
        // Categorie header
        excelData.push([category.toUpperCase(), '', ...Array(showAllRounds ? roundsCount : 0).fill(''), '']);

        // Spelergegevens
        playersByCategory[category].forEach(player => {
            const row = [player.name, player.category];

            if (showAllRounds) {
                for (let round = 1; round <= roundsCount; round++) {
                    const roundData = player.roundScores.find(r => r.round === round);
                    row.push(roundData ? roundData.score : '');
                }
            }

            row.push(player.totalScore);
            excelData.push(row);
        });

        // Lege rij na elke categorie
        excelData.push(Array(headers.length).fill(''));
    });

    return excelData;
};

export default {
    getPlayerRoundScores,
    generatePlayerOverviewData,
    generateExcelData
};
