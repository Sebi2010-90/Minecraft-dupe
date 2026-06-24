// Main game class
class MinecraftGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.world = new World(12345);
        this.player = new Player(50, 100, 50);
        this.combat = new CombatSystem(this.world, this.player);
        this.renderer = new Renderer(this.canvas, this.world, this.player);
        
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            leftClick: false,
            rightClick: false
        };
        
        this.lastTime = Date.now();
        this.infoVisible = true;
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            switch(key) {
                case 'w': this.input.forward = true; break;
                case 'a': this.input.left = true; break;
                case 's': this.input.backward = true; break;
                case 'd': this.input.right = true; break;
                case ' ': this.input.jump = true; break;
                case 'p': this.infoVisible = !this.infoVisible; 
                         document.getElementById('info').style.display = this.infoVisible ? 'block' : 'none';
                         break;
                case '1': this.player.selectBlock(0); break;
                case '2': this.player.selectBlock(1); break;
                case '3': this.player.selectBlock(2); break;
                case '4': this.player.selectBlock(3); break;
                case '5': this.player.selectBlock(4); break;
                case '6': this.player.selectBlock(5); break;
                case '7': this.player.selectBlock(6); break;
                case '8': this.player.selectBlock(7); break;
                case '9': this.player.selectBlock(8); break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            switch(key) {
                case 'w': this.input.forward = false; break;
                case 'a': this.input.left = false; break;
                case 's': this.input.backward = false; break;
                case 'd': this.input.right = false; break;
                case ' ': this.input.jump = false; break;
            }
        });
        
        // Mouse
        document.addEventListener('mousemove', (e) => {
            const sensitivity = 0.005;
            this.player.yaw -= e.movementX * sensitivity;
            this.player.pitch -= e.movementY * sensitivity;
            
            // Clamp pitch
            this.player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.pitch));
        });
        
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.input.leftClick = true;
            if (e.button === 2) this.input.rightClick = true;
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.input.leftClick = false;
            if (e.button === 2) this.input.rightClick = false;
        });
        
        // Lock pointer
        document.addEventListener('click', () => {
            this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
            this.canvas.requestPointerLock();
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    update(deltaTime) {
        // Update player
        this.player.update(deltaTime, this.world, this.input);
        
        // Jump
        if (this.input.jump) {
            this.player.jump();
        }
        
        // Update particles
        this.world.updateParticles(deltaTime);
        
        // Raycast
        const forward = this.player.getForward();
        const raycastResult = this.combat.raycast(
            {x: this.player.x, y: this.player.y + this.player.height/2, z: this.player.z},
            forward,
            100
        );
        
        // Break block
        if (this.input.leftClick && this.player.breakCooldown <= 0) {
            this.combat.breakBlock(raycastResult);
        }
        
        // Place block
        if (this.input.rightClick && this.player.breakCooldown <= 0) {
            this.combat.placeBlock(raycastResult);
        }
        
        return raycastResult;
    }
    
    gameLoop = () => {
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        // Update
        const raycastResult = this.update(Math.min(deltaTime, 0.016)); // Cap at 60fps
        
        // Render
        this.renderer.render(raycastResult);
        
        // Update HUD
        this.updateHUD(raycastResult);
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateHUD(raycastResult) {
        // Health
        document.getElementById('health-value').textContent = Math.max(0, Math.floor(this.player.health));
        const healthPercent = Math.max(0, this.player.health) / this.player.maxHealth * 100;
        document.getElementById('health-bar-fill').style.width = healthPercent + '%';
        
        // Position
        document.getElementById('pos-text').textContent = 
            `X: ${Math.floor(this.player.x)} Y: ${Math.floor(this.player.y)} Z: ${Math.floor(this.player.z)}`;
        
        // Selected block
        const selectedBlock = this.player.getSelectedBlockType();
        document.getElementById('selected-block-name').textContent = getBlockData(selectedBlock).name;
        
        // Inventory
        const inventoryDiv = document.getElementById('inventory-items');
        inventoryDiv.innerHTML = '';
        
        for (const blockType of this.player.blockTypes) {
            const count = this.player.inventory[blockType] || 0;
            const item = document.createElement('div');
            item.className = 'inventory-item';
            if (blockType === this.player.getSelectedBlockType()) {
                item.classList.add('selected');
            }
            const blockName = getBlockData(blockType).name.substring(0, 3);
            item.textContent = `${blockName} ${count}`;
            inventoryDiv.appendChild(item);
        }
    }
}

// Start game
window.addEventListener('load', () => {
    new MinecraftGame();
});