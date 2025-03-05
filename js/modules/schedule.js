// schedule.js - Module voor het genereren van wedstrijdschema's

import { getPlayers, getSettings, setFieldAssignments, setSchedule } from './data.js';

// Genereer teams op basis van beschikbare spelers
export const generateTeams = (players, teamSize) => {
    // Kopieer spelers en shuffle de array
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const teams = [];

    // Creëer teams
    for (let i = 0; i < shuffledPlayers.length; i += teamSize) {
        if (i + teamSize <= shuffledPlayers.length) {
            // Compleet team
            teams.push(shuffledPlayers.slice(i, i + teamSize));
        } else {
            // Onvolledig team (laatste spelers)
            teams.push(shuffledPlayers.slice(i));
        }
    }

    return teams;
};

// Genereer wedstrijdschema voor een aantal teams
export const generateMatches = (teams) => {
    const matches = [];

    // Koppel teams aan elkaar voor wedstrijden
    for (let i = 0; i < teams.length; i += 2) {
        if (i + 1 < teams.length) {
            matches.push({
                id: `match_${matches.length}`,
                team1: {
                    id: `team_${i}`,
                    playerIds: teams[i].map(player => player.id)
                },
                team2: {
                    id: `team_${i + 1}`,
                    playerIds: teams[i + 1].map(player => player.id)
                }
            });
        }
    }

    return matches;
};

// Bereken aantal rondes op basis van beschikbare tijd
export const calculateRounds = (totalDuration, matchDuration) => {
    // Voeg wat buffer tijd toe (bijv. 5 min tussen rondes)
    const roundDuration = matchDuration + 5;
    return Math.floor(totalDuration / roundDuration);
};

// Genereer een compleet schema voor het toernooi
export const generateTournamentSchedule = () => {
    const players = getPlayers();
    const settings = getSettings();

    if (players.length < settings.teamSize * 2) {
        throw new Error(`Te weinig spelers. Minimaal ${settings.teamSize * 2} spelers nodig voor ${settings.teamSize}v${settings.teamSize}.`);
    }

    const roundsCount = calculateRounds(settings.totalDuration, settings.matchDuration);
    const schedule = {
        rounds: [],
        currentRound: 0
    };

    const fieldAssignments = [];

    // Genereer rondes
    for (let round = 0; round < roundsCount; round++) {
        // Genereer nieuwe teams voor elke ronde
        const teams = generateTeams(players, settings.teamSize);
        const matches = generateMatches(teams);

        schedule.rounds.push({
            number: round + 1,
            matches: matches
        });

        // Genereer veldindeling voor deze ronde
        const roundFieldAssignments = [];

        // Verdeel wedstrijden over velden
        for (let i = 0; i < matches.length; i++) {
            const fieldNumber = (i % settings.fieldsCount) + 1;

            // Als er al een indeling is voor dit veld, voeg de wedstrijd toe
            let fieldAssignment = roundFieldAssignments.find(f => f.fieldNumber === fieldNumber);

            if (!fieldAssignment) {
                fieldAssignment = {
                    fieldNumber,
                    matches: []
                };
                roundFieldAssignments.push(fieldAssignment);
            }

            fieldAssignment.matches.push(matches[i].id);
        }

        fieldAssignments.push({
            round: round + 1,
            fields: roundFieldAssignments
        });

        // Bereken welke spelers rust hebben
        const playingPlayerIds = new Set();
        matches.forEach(match => {
            match.team1.playerIds.forEach(id => playingPlayerIds.add(id));
            match.team2.playerIds.forEach(id => playingPlayerIds.add(id));
        });

        const restingPlayerIds = players
            .map(player => player.id)
            .filter(id => !playingPlayerIds.has(id));

        schedule.rounds[round].restingPlayers = restingPlayerIds;
    }

    // Sla het nieuwe schema op in de data laag
    setSchedule(schedule);
    setFieldAssignments(fieldAssignments);

    return {
        schedule,
        fieldAssignments
    };
};

export default {
    generateTeams,
    generateMatches,
    calculateRounds,
    generateTournamentSchedule
};
