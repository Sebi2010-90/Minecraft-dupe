// Player class
class Player {
    constructor(x = 50, y = 100, z = 50) {
        // Position
        this.x = x;
        this.y = y;
        this.z = z;
        
        // Rotation
        this.yaw = 0;   // horizontal
        this.pitch = 0; // vertical
        
        // Velocity
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        
        // Physics
        this.speed = 15; // units per second
        this.jumpPower = 10;
        this.gravity = 30; // acceleration due to gravity
        this.isOnGround = false;
        
        // Size
        this.width = 0.6;
        this.height = 1.8;
        this.depth = 0.6;
        
        // Health and status
        this.health = 20;
        this.maxHealth = 20;
        this.hunger = 20;
        this.maxHunger = 20;
        this.isJumping = false;
        
        // Inventory
        this.inventory = {};
        this.selectedSlot = 0;
        this.blockTypes = [BLOCK_TYPES.DIRT, BLOCK_TYPES.GRASS, BLOCK_TYPES.STONE, 
                          BLOCK_TYPES.OAK_PLANKS, BLOCK_TYPES.SAND, BLOCK_TYPES.GRAVEL,
                          BLOCK_TYPES.OAK_LOG, BLOCK_TYPES.OAK_LEAVES, BLOCK_TYPES.COBBLESTONE];
        
        this.initializeInventory();
        
        // Combat
        this.attackCooldown = 0;
        this.breakCooldown = 0;
        this.breakingBlock = null;
        this.breakProgress = 0;
    }
    
    initializeInventory() {
        for (const blockType of this.blockTypes) {
            this.inventory[blockType] = 0;
        }
    }
    
    addBlock(blockType, amount = 1) {
        if (!this.inventory.hasOwnProperty(blockType)) {
            this.inventory[blockType] = 0;
        }
        this.inventory[blockType] += amount;
    }
    
    removeBlock(blockType, amount = 1) {
        if (this.inventory[blockType]) {
            this.inventory[blockType] = Math.max(0, this.inventory[blockType] - amount);
        }
    }
    
    getSelectedBlockType() {
        return this.blockTypes[this.selectedSlot];
    }
    
    selectBlock(slot) {
        if (slot >= 0 && slot < this.blockTypes.length) {
            this.selectedSlot = slot;
        }
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    // Get forward direction vector
    getForward() {
        return {
            x: Math.sin(this.yaw) * Math.cos(this.pitch),
            y: -Math.sin(this.pitch),
            z: Math.cos(this.yaw) * Math.cos(this.pitch)
        };
    }
    
    // Get right direction vector
    getRight() {
        const yawRight = this.yaw + Math.PI / 2;
        return {
            x: Math.sin(yawRight),
            y: 0,
            z: Math.cos(yawRight)
        };
    }
    
    // Move in direction
    move(forward, right, deltaTime) {
        const moveDir = {
            x: forward * this.getForward().x + right * this.getRight().x,
            z: forward * this.getForward().z + right * this.getRight().z
        };
        
        const moveLength = Math.sqrt(moveDir.x * moveDir.x + moveDir.z * moveDir.z);
        if (moveLength > 0) {
            this.vx = moveDir.x / moveLength * this.speed;
            this.vz = moveDir.z / moveLength * this.speed;
        } else {
            this.vx = 0;
            this.vz = 0;
        }
    }
    
    jump() {
        if (this.isOnGround && !this.isJumping) {
            this.vy = this.jumpPower;
            this.isOnGround = false;
            this.isJumping = true;
        }
    }
    
    // Check collision
    checkCollision(x, y, z, world) {
        const minX = x - this.width / 2;
        const maxX = x + this.width / 2;
        const minY = y;
        const maxY = y + this.height;
        const minZ = z - this.depth / 2;
        const maxZ = z + this.depth / 2;
        
        for (let blockX = Math.floor(minX); blockX <= Math.ceil(maxX); blockX++) {
            for (let blockY = Math.floor(minY); blockY <= Math.ceil(maxY); blockY++) {
                for (let blockZ = Math.floor(minZ); blockZ <= Math.ceil(maxZ); blockZ++) {
                    const block = world.getBlock(blockX, blockY, blockZ);
                    if (block !== BLOCK_TYPES.AIR && block !== BLOCK_TYPES.WATER) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // Update player physics
    update(deltaTime, world, input) {
        // Apply gravity
        if (!this.isOnGround) {
            this.vy -= this.gravity * deltaTime;
        }
        
        // Move horizontally
        const moveForward = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
        const moveRight = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        this.move(moveForward, moveRight, deltaTime);
        
        // Apply movement
        let newX = this.x + this.vx * deltaTime;
        let newY = this.y + this.vy * deltaTime;
        let newZ = this.z + this.vz * deltaTime;
        
        // Collision detection
        if (!this.checkCollision(newX, this.y, this.z, world)) {
            this.x = newX;
        }
        if (!this.checkCollision(this.x, newY, this.z, world)) {
            this.y = newY;
            this.isOnGround = false;
        } else {
            this.vy = 0;
            this.isOnGround = true;
            this.isJumping = false;
        }
        if (!this.checkCollision(this.x, this.y, newZ, world)) {
            this.z = newZ;
        }
        
        // Fall damage
        if (this.y < -10) {
            this.y = 150;
            this.takeDamage(5);
        }
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.breakCooldown > 0) this.breakCooldown -= deltaTime;
    }
}