// Gamemodes system
class GamemodeManager {
    constructor(game) {
        this.game = game;
        this.currentMode = 'SURVIVAL'; // SURVIVAL, CREATIVE, ADVENTURE
        
        this.modes = {
            SURVIVAL: {
                name: 'Survival',
                description: 'Gather resources, manage health & hunger, die from damage',
                allowFlight: false,
                allowDamage: true,
                instantBreak: false,
                allowHunger: true,
                color: 'rgba(76, 175, 80, 0.7)'
            },
            CREATIVE: {
                name: 'Creative',
                description: 'Unlimited resources, no damage, instant break, flight',
                allowFlight: true,
                allowDamage: false,
                instantBreak: true,
                allowHunger: false,
                color: 'rgba(255, 193, 7, 0.7)'
            },
            ADVENTURE: {
                name: 'Adventure',
                description: 'Limited resources, can take damage, restricted placement',
                allowFlight: false,
                allowDamage: true,
                instantBreak: false,
                allowHunger: true,
                color: 'rgba(156, 39, 176, 0.7)'
            }
        };
        
        this.setupGamemodeUI();
        this.applyGamemode(this.currentMode);
    }
    
    setupGamemodeUI() {
        // Create gamemode selector
        const selectorContainer = document.createElement('div');
        selectorContainer.id = 'gamemode-selector';
        selectorContainer.style.cssText = `
            position: fixed;
            top: 80px;
            left: 20px;
            display: flex;
            gap: 8px;
            flex-direction: column;
            pointer-events: auto;
            z-index: 40;
        `;
        
        for (const [key, mode] of Object.entries(this.modes)) {
            const btn = document.createElement('button');
            btn.textContent = mode.name;
            btn.style.cssText = `
                width: 120px;
                padding: 8px;
                background: ${mode.color};
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            `;
            
            btn.addEventListener('click', () => {
                this.setGamemode(key);
                this.updateGamemodeUI();
            });
            
            btn.addEventListener('mouseenter', () => {
                btn.style.opacity = '0.8';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.opacity = '1';
            });
            
            btn.id = `gamemode-${key}`;
            selectorContainer.appendChild(btn);
        }
        
        document.body.appendChild(selectorContainer);
    }
    
    setGamemode(mode) {
        if (!this.modes[mode]) return;
        this.currentMode = mode;
        this.applyGamemode(mode);
    }
    
    applyGamemode(mode) {
        const settings = this.modes[mode];
        
        // Apply creative mode settings
        if (mode === 'CREATIVE') {
            // Unlimited blocks in creative
            for (const blockType of this.game.player.blockTypes) {
                this.game.player.inventory[blockType] = 9999;
            }
            // No hunger drain
            this.game.player.hunger = this.game.player.maxHunger;
        }
        
        // Apply survival settings
        if (mode === 'SURVIVAL') {
            // Normal block counts
            this.game.player.maxHealth = 20;
            this.game.player.health = Math.min(this.game.player.health, 20);
        }
        
        // Apply adventure settings
        if (mode === 'ADVENTURE') {
            this.game.player.maxHealth = 20;
        }
        
        this.game.currentGamemode = mode;
        this.game.gamemodeSettings = settings;
    }
    
    updateGamemodeUI() {
        for (const key of Object.keys(this.modes)) {
            const btn = document.getElementById(`gamemode-${key}`);
            if (key === this.currentMode) {
                btn.style.border = '3px solid white';
                btn.style.transform = 'scale(1.05)';
            } else {
                btn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                btn.style.transform = 'scale(1)';
            }
        }
    }
    
    getCurrentMode() {
        return this.modes[this.currentMode];
    }
    
    isCreative() {
        return this.currentMode === 'CREATIVE';
    }
    
    canTakeDamage() {
        return this.modes[this.currentMode].allowDamage;
    }
    
    canBreakInstant() {
        return this.modes[this.currentMode].instantBreak;
    }
    
    shouldDrainHunger() {
        return this.modes[this.currentMode].allowHunger;
    }
}
