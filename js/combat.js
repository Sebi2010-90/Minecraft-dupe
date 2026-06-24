// Combat and interaction system
class CombatSystem {
    constructor(world, player) {
        this.world = world;
        this.player = player;
        this.breakRange = 10;
        this.placeRange = 10;
    }
    
    // Raycast from camera
    raycast(origin, direction, maxDistance = 100) {
        const step = 0.1;
        const result = {
            hit: false,
            distance: 0,
            blockX: 0,
            blockY: 0,
            blockZ: 0,
            face: null
        };
        
        for (let distance = 0; distance < maxDistance; distance += step) {
            const x = origin.x + direction.x * distance;
            const y = origin.y + direction.y * distance;
            const z = origin.z + direction.z * distance;
            
            const blockX = Math.floor(x);
            const blockY = Math.floor(y);
            const blockZ = Math.floor(z);
            
            const block = this.world.getBlock(blockX, blockY, blockZ);
            
            if (block !== BLOCK_TYPES.AIR && block !== BLOCK_TYPES.WATER) {
                result.hit = true;
                result.distance = distance;
                result.blockX = blockX;
                result.blockY = blockY;
                result.blockZ = blockZ;
                
                // Determine which face was hit
                const dx = x - (blockX + 0.5);
                const dy = y - (blockY + 0.5);
                const dz = z - (blockZ + 0.5);
                
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);
                const absDz = Math.abs(dz);
                
                if (absDx > absDy && absDx > absDz) {
                    result.face = dx > 0 ? 'right' : 'left';
                } else if (absDy > absDx && absDy > absDz) {
                    result.face = dy > 0 ? 'top' : 'bottom';
                } else {
                    result.face = dz > 0 ? 'front' : 'back';
                }
                break;
            }
        }
        
        return result;
    }
    
    // Break block
    breakBlock(raycastResult) {
        if (!raycastResult.hit) return;
        if (raycastResult.distance > this.breakRange) return;
        
        const blockType = this.world.getBlock(
            raycastResult.blockX,
            raycastResult.blockY,
            raycastResult.blockZ
        );
        
        if (blockType === BLOCK_TYPES.AIR) return;
        
        // Break block
        this.world.setBlock(
            raycastResult.blockX,
            raycastResult.blockY,
            raycastResult.blockZ,
            BLOCK_TYPES.AIR
        );
        
        // Add drops
        const drops = getBlockDrops(blockType);
        for (const drop of drops) {
            this.player.addBlock(drop);
        }
        
        // Particles
        for (let i = 0; i < 5; i++) {
            this.world.addParticle(
                raycastResult.blockX + 0.5,
                raycastResult.blockY + 0.5,
                raycastResult.blockZ + 0.5,
                (Math.random() - 0.5) * 5,
                Math.random() * 3 + 1,
                (Math.random() - 0.5) * 5,
                0.8
            );
        }
        
        this.player.breakCooldown = 0.1;
    }
    
    // Place block
    placeBlock(raycastResult) {
        if (!raycastResult.hit) return;
        if (raycastResult.distance > this.placeRange) return;
        
        const selectedBlock = this.player.getSelectedBlockType();
        if (this.player.inventory[selectedBlock] <= 0) return;
        
        // Calculate placement position based on face
        let placeX = raycastResult.blockX;
        let placeY = raycastResult.blockY;
        let placeZ = raycastResult.blockZ;
        
        switch (raycastResult.face) {
            case 'top':
                placeY++;
                break;
            case 'bottom':
                placeY--;
                break;
            case 'left':
                placeX--;
                break;
            case 'right':
                placeX++;
                break;
            case 'back':
                placeZ--;
                break;
            case 'front':
                placeZ++;
                break;
        }
        
        // Check if player collides with placement
        if (this.player.checkCollision(this.player.x, this.player.y, this.player.z, this.world)) {
            // Would place inside player
            return;
        }
        
        // Place block
        this.world.setBlock(placeX, placeY, placeZ, selectedBlock);
        this.player.removeBlock(selectedBlock);
        this.player.breakCooldown = 0.1;
    }
    
    // Deal damage
    dealDamage(amount) {
        this.player.takeDamage(amount);
    }
}