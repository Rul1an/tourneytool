// state.js - Eenvoudige state manager voor de applicatie

// Singleton voor applicatie-brede state
class StateManager {
    constructor() {
        this.listeners = {};
        this.state = {};
    }

    // Registreer een listener voor een specifieke state change
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        // Return unsubscribe functie
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    // Trigger een event om listeners te notificeren
    notify(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // Update een deel van de state
    setState(key, value) {
        this.state[key] = value;
        this.notify(key, value);
    }

    // Haal een deel van de state op
    getState(key) {
        return this.state[key];
    }

    // Verwijder een deel van de state
    removeState(key) {
        if (key in this.state) {
            delete this.state[key];
            this.notify(`${key}_removed`);
        }
    }

    // Reset alle state
    resetState() {
        this.state = {};
        this.notify('state_reset');
    }
}

// Creëer een singleton instance
const stateManager = new StateManager();

// Events voor onze applicatie
export const Events = {
    PLAYERS_UPDATED: 'players_updated',
    SETTINGS_UPDATED: 'settings_updated',
    SCHEDULE_GENERATED: 'schedule_generated',
    MATCH_RESULT_SAVED: 'match_result_saved',
    ROUND_CHANGED: 'round_changed',
    DATA_RESET: 'data_reset',
    UI_THEME_CHANGED: 'ui_theme_changed'
};

export default stateManager;
