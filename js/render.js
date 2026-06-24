// Rendering system
class Renderer {
    constructor(canvas, world, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.world = world;
        this.player = player;
        
        this.width = canvas.width;
        this.height = canvas.height;
        this.fov = 60;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    // Project 3D point to 2D screen
    project(x, y, z) {
        // Translate to player position
        let px = x - this.player.x;
        let py = y - (this.player.y + this.player.height / 2);
        let pz = z - this.player.z;
        
        // Rotate by yaw
        let rotX = px * Math.cos(this.player.yaw) - pz * Math.sin(this.player.yaw);
        let rotZ = px * Math.sin(this.player.yaw) + pz * Math.cos(this.player.yaw);
        
        // Rotate by pitch
        let rotY = py * Math.cos(this.player.pitch) - rotZ * Math.sin(this.player.pitch);
        rotZ = py * Math.sin(this.player.pitch) + rotZ * Math.cos(this.player.pitch);
        
        // Perspective projection
        if (rotZ <= 0.1) return null;
        
        const fovRad = this.fov * Math.PI / 180;
        const scale = this.height / (2 * Math.tan(fovRad / 2) * rotZ);
        
        const screenX = this.width / 2 + rotX * scale;
        const screenY = this.height / 2 + rotY * scale;
        
        return { x: screenX, y: screenY, z: rotZ, scale };
    }
    
    // Draw a block
    drawBlock(x, y, z, blockType) {
        const size = 0.9;
        const corners = [
            {x: x - size/2, y: y - size/2, z: z - size/2},
            {x: x + size/2, y: y - size/2, z: z - size/2},
            {x: x + size/2, y: y + size/2, z: z - size/2},
            {x: x - size/2, y: y + size/2, z: z - size/2},
            {x: x - size/2, y: y - size/2, z: z + size/2},
            {x: x + size/2, y: y - size/2, z: z + size/2},
            {x: x + size/2, y: y + size/2, z: z + size/2},
            {x: x - size/2, y: y + size/2, z: z + size/2}
        ];
        
        const projected = corners.map(c => this.project(c.x, c.y, c.z)).filter(p => p !== null);
        
        if (projected.length === 0) return;
        
        const avgZ = projected.reduce((sum, p) => sum + p.z, 0) / projected.length;
        
        // Only draw if in front of camera
        if (avgZ < 0.1) return;
        
        const color = getBlockData(blockType).color;
        
        // Draw block faces (simple cube)
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        
        const edges = [
            [0, 1, 5, 4],
            [2, 3, 7, 6],
            [0, 3, 7, 4],
            [1, 2, 6, 5],
            [0, 1, 2, 3],
            [4, 5, 6, 7]
        ];
        
        for (const edge of edges) {
            const points = edge.map(i => projected[i]).filter(p => p !== null);
            if (points.length >= 3) {
                this.ctx.beginPath();
                this.ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    this.ctx.lineTo(points[i].x, points[i].y);
                }
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
    }
    
    // Draw particle
    drawParticle(particle) {
        const proj = this.project(particle.x, particle.y, particle.z);
        if (!proj) return;
        
        const size = 3 * (particle.life / particle.maxLife);
        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(proj.x - size/2, proj.y - size/2, size, size);
    }
    
    // Render scene
    render(rayCastResult) {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Collect visible blocks
        const visibleBlocks = [];
        const renderDistance = 15;
        
        const playerChunkX = Math.floor(this.player.x / this.world.chunkSize);
        const playerChunkZ = Math.floor(this.player.z / this.world.chunkSize);
        
        for (let cx = playerChunkX - renderDistance; cx <= playerChunkX + renderDistance; cx++) {
            for (let cz = playerChunkZ - renderDistance; cz <= playerChunkZ + renderDistance; cz++) {
                const chunk = this.world.generateChunk(cx, cz);
                
                for (const [key, blockType] of Object.entries(chunk)) {
                    if (blockType === BLOCK_TYPES.AIR) continue;
                    
                    const [lx, y, lz] = key.split(',').map(Number);
                    const x = cx * this.world.chunkSize + lx;
                    const z = cz * this.world.chunkSize + lz;
                    
                    const dist = Math.sqrt(
                        Math.pow(x - this.player.x, 2) +
                        Math.pow(y - this.player.y, 2) +
                        Math.pow(z - this.player.z, 2)
                    );
                    
                    if (dist < 100) {
                        visibleBlocks.push({
                            x, y, z, blockType,
                            dist: Math.pow(x - this.player.x, 2) + Math.pow(z - this.player.z, 2)
                        });
                    }
                }
            }
        }
        
        // Sort by distance (painter's algorithm)
        visibleBlocks.sort((a, b) => b.dist - a.dist);
        
        // Draw blocks
        for (const block of visibleBlocks) {
            this.drawBlock(block.x, block.y, block.z, block.blockType);
        }
        
        // Draw particles
        for (const particle of this.world.particles) {
            this.drawParticle(particle);
        }
        
        // Draw crosshair
        this.drawCrosshair(rayCastResult);
    }
    
    // Draw crosshair
    drawCrosshair(raycastResult) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const size = 10;
        const thickness = 2;
        
        this.ctx.strokeStyle = raycastResult && raycastResult.hit ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = thickness;
        
        // Crosshair lines
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - size, centerY);
        this.ctx.lineTo(centerX + size, centerY);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - size);
        this.ctx.lineTo(centerX, centerY + size);
        this.ctx.stroke();
        
        // Circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}