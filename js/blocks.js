// Block types and their properties
const BLOCK_TYPES = {
    AIR: 0,
    DIRT: 1,
    GRASS: 2,
    STONE: 3,
    OAK_LOG: 4,
    OAK_LEAVES: 5,
    SAND: 6,
    WATER: 7,
    GRAVEL: 8,
    COBBLESTONE: 9,
    OAK_PLANKS: 10
};

const BLOCK_DATA = {
    [BLOCK_TYPES.AIR]: {
        name: 'Air',
        color: 'rgba(0,0,0,0)',
        hardness: 0,
        transparent: true,
        breakTime: 0
    },
    [BLOCK_TYPES.DIRT]: {
        name: 'Dirt',
        color: '#8B7355',
        hardness: 0.5,
        breakTime: 0.75,
        drops: [{ type: BLOCK_TYPES.DIRT, chance: 1.0 }]
    },
    [BLOCK_TYPES.GRASS]: {
        name: 'Grass',
        color: '#228B22',
        hardness: 0.6,
        breakTime: 0.9,
        drops: [{ type: BLOCK_TYPES.DIRT, chance: 1.0 }]
    },
    [BLOCK_TYPES.STONE]: {
        name: 'Stone',
        color: '#808080',
        hardness: 1.5,
        breakTime: 2.25,
        drops: [{ type: BLOCK_TYPES.COBBLESTONE, chance: 1.0 }]
    },
    [BLOCK_TYPES.OAK_LOG]: {
        name: 'Oak Log',
        color: '#654321',
        hardness: 2,
        breakTime: 3,
        drops: [{ type: BLOCK_TYPES.OAK_LOG, chance: 1.0 }]
    },
    [BLOCK_TYPES.OAK_LEAVES]: {
        name: 'Oak Leaves',
        color: '#2D5016',
        hardness: 0.2,
        breakTime: 0.3,
        transparent: true,
        drops: [{ type: BLOCK_TYPES.OAK_LEAVES, chance: 0.2 }]
    },
    [BLOCK_TYPES.SAND]: {
        name: 'Sand',
        color: '#F4A460',
        hardness: 0.5,
        breakTime: 0.75,
        drops: [{ type: BLOCK_TYPES.SAND, chance: 1.0 }]
    },
    [BLOCK_TYPES.WATER]: {
        name: 'Water',
        color: 'rgba(0, 100, 255, 0.3)',
        hardness: -1,
        breakTime: 0,
        transparent: true,
        liquid: true
    },
    [BLOCK_TYPES.GRAVEL]: {
        name: 'Gravel',
        color: '#A9A9A9',
        hardness: 0.6,
        breakTime: 0.9,
        drops: [{ type: BLOCK_TYPES.GRAVEL, chance: 0.9 }, { type: BLOCK_TYPES.OAK_PLANKS, chance: 0.1 }]
    },
    [BLOCK_TYPES.COBBLESTONE]: {
        name: 'Cobblestone',
        color: '#696969',
        hardness: 2,
        breakTime: 3,
        drops: [{ type: BLOCK_TYPES.COBBLESTONE, chance: 1.0 }]
    },
    [BLOCK_TYPES.OAK_PLANKS]: {
        name: 'Oak Planks',
        color: '#8B6914',
        hardness: 2,
        breakTime: 3,
        drops: [{ type: BLOCK_TYPES.OAK_PLANKS, chance: 1.0 }]
    }
};

// Get block data
function getBlockData(blockType) {
    return BLOCK_DATA[blockType] || BLOCK_DATA[BLOCK_TYPES.AIR];
}

// Check if block is transparent
function isTransparent(blockType) {
    return getBlockData(blockType).transparent || false;
}

// Get break time in seconds
function getBreakTime(blockType) {
    return getBlockData(blockType).breakTime || 0;
}

// Get drops when block is broken
function getBlockDrops(blockType) {
    const data = getBlockData(blockType);
    if (!data.drops) return [];
    
    const drops = [];
    for (const drop of data.drops) {
        if (Math.random() < drop.chance) {
            drops.push(drop.type);
        }
    }
    return drops;
}