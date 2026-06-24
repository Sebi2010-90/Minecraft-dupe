// World generation and management
class World {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
        this.chunks = new Map();
        this.chunkSize = 16;
        this.worldHeight = 256;
        this.blocks = {};
        this.entities = [];
        this.particles = [];
    }

    // Get chunk key
    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    // Get block position from coordinates
    getChunkCoords(x, z) {
        return {
            chunkX: Math.floor(x / this.chunkSize),
            localX: ((x % this.chunkSize) + this.chunkSize) % this.chunkSize
        };
    }

    // Perlin-like noise (simplified)
    noise(x, y, z) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }

    // Generate chunk
    generateChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        if (this.chunks.has(key)) return this.chunks.get(key);

        const chunk = {};
        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                for (let y = 0; y < this.worldHeight; y++) {
                    const worldX = chunkX * this.chunkSize + x;
                    const worldZ = chunkZ * this.chunkSize + z;
                    
                    let blockType = BLOCK_TYPES.AIR;
                    
                    // Terrain generation
                    const heightNoise = this.noise(worldX * 0.1, 0, worldZ * 0.1);
                    const baseHeight = 70 + Math.floor(heightNoise * 20);
                    
                    // Variation noise
                    const caveNoise = this.noise(worldX * 0.05, y * 0.05, worldZ * 0.05);
                    
                    // Caves
                    if (y < 200 && caveNoise > 0.6) {
                        blockType = BLOCK_TYPES.AIR;
                    }
                    // Surface
                    else if (y > baseHeight) {
                        blockType = BLOCK_TYPES.AIR;
                    }
                    else if (y === baseHeight) {
                        const grassChance = this.noise(worldX, 0, worldZ);
                        blockType = grassChance > 0.3 ? BLOCK_TYPES.GRASS : BLOCK_TYPES.DIRT;
                    }
                    else if (y > baseHeight - 5) {
                        blockType = BLOCK_TYPES.DIRT;
                    }
                    else if (y > baseHeight - 10) {
                        blockType = BLOCK_TYPES.STONE;
                    }
                    else if (y > baseHeight - 20) {
                        const stoneType = this.noise(worldX, y, worldZ);
                        if (stoneType > 0.8) {
                            blockType = BLOCK_TYPES.GRAVEL;
                        } else {
                            blockType = BLOCK_TYPES.STONE;
                        }
                    }
                    else {
                        blockType = BLOCK_TYPES.STONE;
                    }
                    
                    // Trees
                    if (blockType === BLOCK_TYPES.GRASS && Math.random() < 0.02) {
                        this.generateTree(worldX, y + 1, worldZ);
                    }
                    
                    const coordKey = `${x},${y},${z}`;
                    chunk[coordKey] = blockType;
                }
            }
        }
        
        this.chunks.set(key, chunk);
        return chunk;
    }

    // Generate tree
    generateTree(x, y, z) {
        const treeHeight = 5 + Math.floor(Math.random() * 4);
        
        // Trunk
        for (let i = 0; i < treeHeight; i++) {
            this.setBlock(x, y + i, z, BLOCK_TYPES.OAK_LOG);
        }
        
        // Leaves
        const leafRadius = 3;
        for (let lx = -leafRadius; lx <= leafRadius; lx++) {
            for (let lz = -leafRadius; lz <= leafRadius; lz++) {
                for (let ly = 0; ly < 4; ly++) {
                    const distance = Math.sqrt(lx * lx + lz * lz);
                    if (distance <= leafRadius) {
                        this.setBlock(x + lx, y + treeHeight + ly - 2, z + lz, BLOCK_TYPES.OAK_LEAVES);
                    }
                }
            }
        }
    }

    // Get block
    getBlock(x, y, z) {
        if (y < 0 || y >= this.worldHeight) return BLOCK_TYPES.AIR;
        
        const chunkCoords = this.getChunkCoords(x, z);
        const chunkZ = Math.floor(z / this.chunkSize);
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        const key = this.getChunkKey(chunkCoords.chunkX, chunkZ);
        const chunk = this.generateChunk(chunkCoords.chunkX, chunkZ);
        
        const coordKey = `${chunkCoords.localX},${y},${localZ}`;
        return chunk[coordKey] || BLOCK_TYPES.AIR;
    }

    // Set block
    setBlock(x, y, z, blockType) {
        if (y < 0 || y >= this.worldHeight) return;
        
        const chunkCoords = this.getChunkCoords(x, z);
        const chunkZ = Math.floor(z / this.chunkSize);
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        const key = this.getChunkKey(chunkCoords.chunkX, chunkZ);
        let chunk = this.chunks.get(key);
        
        if (!chunk) {
            chunk = this.generateChunk(chunkCoords.chunkX, chunkZ);
        }
        
        const coordKey = `${chunkCoords.localX},${y},${localZ}`;
        chunk[coordKey] = blockType;
    }

    // Add particle effect
    addParticle(x, y, z, velocityX, velocityY, velocityZ, life = 0.5) {
        this.particles.push({
            x, y, z,
            vx: velocityX, vy: velocityY, vz: velocityZ,
            life: life,
            maxLife: life,
            color: `rgba(100, 100, 100, ${Math.random() * 0.5 + 0.5})`
        });
    }

    // Update particles
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.z += p.vz * deltaTime;
            p.vy -= 9.81 * deltaTime; // Gravity
            p.life -= deltaTime;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
}