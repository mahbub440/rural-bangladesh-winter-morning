/**
 * scene.js — Camera, world constants, and coordinate transformation
 */

/** Virtual world dimensions and landmark positions */
export const WORLD = {
    WIDTH: 1920,
    HEIGHT: 1080,

    // Vertical zones
    SKY_TOP: 0,
    HORIZON_Y: 370,
    RIVER_TOP: 400,
    RIVER_BOTTOM: 545,
    NEAR_BANK_TOP: 538,
    GROUND_TOP: 568,
    ROAD_CENTER_Y: 750,
    ROAD_HALF_WIDTH: 40,
    FOREGROUND_TOP: 900,

    // Key landmarks
    // School is set gracefully behind the main road with a wide courtyard in front
    SCHOOL: { x: 1440, y: 595, w: 185, h: 115 },

    // Subtle 7 AM winter sunrise: low on the horizon, just peeking over the distant tree line
    SUN: { x: 1510, y: 360, radius: 15 },

    // Gathering of villagers warming by fire (আগুন পোহানো)
    FIRE_GATHERING: { x: 460, y: 680 },

    // Road path for schoolchildren (walk along red dirt road, then turn into schoolyard at ground level)
    ROAD_PATH: [
        { x: -80,  y: 765 },
        { x: 180,  y: 760 },
        { x: 420,  y: 754 },
        { x: 680,  y: 748 },
        { x: 920,  y: 744 },
        { x: 1140, y: 742 },
        { x: 1320, y: 742 },
        { x: 1420, y: 742 }, // Near the school gate
        { x: 1470, y: 730 }, // Turning into the schoolyard
        { x: 1515, y: 720 }, // Walking across the courtyard
        { x: 1535, y: 712 }, // At the school veranda steps (enters school)
    ],

    // Main road continuing straight for cyclist / villagers who don't go to school
    MAIN_ROAD_PATH: [
        { x: -80,  y: 765 },
        { x: 180,  y: 760 },
        { x: 420,  y: 754 },
        { x: 680,  y: 748 },
        { x: 920,  y: 744 },
        { x: 1140, y: 742 },
        { x: 1350, y: 744 },
        { x: 1550, y: 748 },
        { x: 1750, y: 754 },
        { x: 2020, y: 762 },
    ],

    // Houses
    HOUSES: [
        { x: 90,   y: 650, w: 105, h: 62, roofH: 42, wallColor: '#b89870', roofColor: '#7a8a9a', hasFence: true },
        { x: 310,  y: 635, w: 90,  h: 56, roofH: 36, wallColor: '#c4a57a', roofColor: '#8a98a8', hasFence: false },
        { x: 570,  y: 628, w: 115, h: 68, roofH: 46, wallColor: '#a88b68', roofColor: '#708090', hasFence: true },
        { x: 810,  y: 632, w: 100, h: 60, roofH: 40, wallColor: '#bfa07a', roofColor: '#7d8e9e', hasFence: true },
        { x: 1090, y: 638, w: 95,  h: 58, roofH: 38, wallColor: '#c0a078', roofColor: '#8292a2', hasFence: false },
        { x: 1720, y: 648, w: 105, h: 64, roofH: 42, wallColor: '#b09068', roofColor: '#768696', hasFence: true },
    ],

    // Trees (lush, authentic Bangladeshi species)
    TREES: [
        // Coconut palms (tall, grand, 230-280px tall)
        { type: 'coconut', x: 50,   y: 655, h: 260, lean: 20,  sway: 1.0 },
        { type: 'coconut', x: 240,  y: 645, h: 240, lean: -15, sway: 1.2 },
        { type: 'coconut', x: 520,  y: 635, h: 255, lean: 14,  sway: 0.9 },
        { type: 'coconut', x: 740,  y: 640, h: 245, lean: -16, sway: 1.1 },
        { type: 'coconut', x: 1020, y: 645, h: 260, lean: 15,  sway: 1.3 },
        { type: 'coconut', x: 1350, y: 635, h: 275, lean: -12, sway: 0.8 },
        { type: 'coconut', x: 1680, y: 645, h: 250, lean: 18,  sway: 1.0 },
        { type: 'coconut', x: 1850, y: 650, h: 265, lean: -15, sway: 1.1 },

        // Date palms (with clay juice pots / রসের হাঁড়ি!)
        { type: 'date', x: 160,  y: 660, h: 195, lean: 8,   sway: 0.7, hasPot: true },
        { type: 'date', x: 910,  y: 640, h: 190, lean: -10, sway: 0.9, hasPot: true },
        { type: 'date', x: 1240, y: 645, h: 185, lean: 7,   sway: 0.8, hasPot: true },
        { type: 'date', x: 1630, y: 648, h: 195, lean: 6,   sway: 0.8, hasPot: true },

        // Banana clusters (large flapping leaves)
        { type: 'banana', x: 210,  y: 685, h: 88, lean: 0, sway: 1.5 },
        { type: 'banana', x: 380,  y: 672, h: 84, lean: 0, sway: 1.3 },
        { type: 'banana', x: 690,  y: 680, h: 86, lean: 0, sway: 1.4 },
        { type: 'banana', x: 1180, y: 675, h: 82, lean: 0, sway: 1.6 },
        { type: 'banana', x: 1400, y: 670, h: 88, lean: 0, sway: 1.2 },

        // Bamboo clusters (tall, arching, dense)
        { type: 'bamboo', x: -10,  y: 930, h: 320, lean: 0, sway: 2.0 },  // foreground left framing
        { type: 'bamboo', x: 330,  y: 655, h: 210, lean: 0, sway: 1.8 },
        { type: 'bamboo', x: 1290, y: 650, h: 220, lean: 0, sway: 1.6 },
        { type: 'bamboo', x: 1780, y: 655, h: 215, lean: 0, sway: 1.7 },

        // Majestic Mango / Banyan shade trees (wide leafy canopies)
        { type: 'mango', x: 630,  y: 630, h: 180, w: 220, sway: 0.5 },
        { type: 'mango', x: 1140, y: 635, h: 175, w: 210, sway: 0.6 },
    ],

    // Bird flocks
    BIRD_FLOCKS: [
        { x: 150,  y: 110, count: 5, speed: 28,  size: 5, dy: -0.2 },
        { x: 750,  y: 75,  count: 7, speed: 22,  size: 4, dy: 0.15 },
        { x: 1350, y: 130, count: 4, speed: 32,  size: 6, dy: -0.1 },
        { x: 450,  y: 170, count: 3, speed: 25,  size: 4, dy: 0.12 },
        { x: 1050, y: 95,  count: 6, speed: 24,  size: 5, dy: -0.2 },
    ],

    // Subtle, thin, horizontal winter morning mist layers (low opacity, strictly linear — no circular blobs)
    FOG_LAYERS: [
        { y: 360, h: 45, opacity: 0.16, speed: 4, name: 'distant_horizon' },  // thin mist along distant horizon
        { y: 402, h: 35, opacity: 0.18, speed: 6, name: 'far_bank_mist' },     // soft mist along far bank
        { y: 520, h: 30, opacity: 0.12, speed: 7, name: 'water_surface' },     // delicate mist on water
        { y: 735, h: 25, opacity: 0.08, speed: 9, name: 'ground_mist' },       // faint ground vapor
    ],
};

/**
 * Camera handles mapping virtual world coordinates to screen pixels.
 * Maintains aspect ratio and centers the scene in cover mode.
 */
export class Camera {
    constructor() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.screenW = WORLD.WIDTH;
        this.screenH = WORLD.HEIGHT;
    }

    resize(screenW, screenH) {
        this.screenW = screenW;
        this.screenH = screenH;

        const scaleX = screenW / WORLD.WIDTH;
        const scaleY = screenH / WORLD.HEIGHT;

        // Cover mode ensures full screen without borders
        this.scale = Math.max(scaleX, scaleY);

        this.offsetX = (screenW - WORLD.WIDTH * this.scale) / 2;
        this.offsetY = (screenH - WORLD.HEIGHT * this.scale) / 2;
    }

    applyTransform(ctx) {
        ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
    }

    resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    worldToScreen(wx, wy) {
        return {
            x: wx * this.scale + this.offsetX,
            y: wy * this.scale + this.offsetY,
        };
    }
}
