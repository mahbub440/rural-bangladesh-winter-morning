/**
 * environment.js — Complete landscape renderer for the 1990s rural Bangladeshi winter morning scene
 *
 * Visual Highlights:
 * - 7 AM Winter Dawn: Soft blue-grey sky transitioning into muted peach & pale gold; small, subtle sun peeking over horizon
 * - Atmospheric Perspective: Delicate, thin, horizontal morning mist drifting over distant fields & water (no circular blobs)
 * - Distinct River: Natural deep blue-grey water with gentle, organic, non-repetitive ripples and reflections
 * - Authentic Flora: Natural coconut palms, date palms with winter clay juice pots (রসের হাঁড়ি), broad banana leaves, arching bamboo groves
 * - Cozy Village Life: 4 adult villagers warming themselves around a small crackling wood fire (আগুন পোহানো)
 * - Rich Foreground: Naturally uneven field of delicate grass tufts, exposed earthen soil patches, and glistening tiny morning dew droplets
 * - Ground-level village primary school with flagpole and courtyard
 */

import { lerp, clamp, oscillate, oscillateCos, noise1D, rgba, mapRange } from './animation.js';
import { WORLD } from './scene.js';

function drawRoundedRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawEllipse(ctx, cx, cy, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

export class Environment {
    constructor() {
        this.time = 0;
        this.boatX = 390;
        this.boatSpeed = 13;

        // Bird flock state
        this.birdFlocks = WORLD.BIRD_FLOCKS.map(f => ({
            ...f,
            currentX: f.x,
            wingPhase: Math.random() * Math.PI * 2,
        }));

        // Subtle mist drift offsets
        this.fogOffsets = WORLD.FOG_LAYERS.map(() => Math.random() * 800);

        // Thin high morning cloud wisps
        this.clouds = [
            { x: 150,  y: 75,  w: 230, h: 13, speed: 2.2 },
            { x: 570,  y: 110, w: 190, h: 11, speed: 1.8 },
            { x: 970,  y: 65,  w: 250, h: 14, speed: 2.7 },
            { x: 1390, y: 130, w: 210, h: 12, speed: 2.0 },
            { x: 1730, y: 90,  w: 170, h: 10, speed: 2.4 },
        ];

        // ── Organic, Non-Repetitive River Ripples ──
        // Broken ripple segments with natural spacing rather than uniform full-width lines
        this.riverRipples = [];
        const rippleCount = 38;
        for (let i = 0; i < rippleCount; i++) {
            this.riverRipples.push({
                x: Math.random() * (WORLD.WIDTH + 100) - 50,
                y: WORLD.RIVER_TOP + 12 + Math.random() * (WORLD.RIVER_BOTTOM - WORLD.RIVER_TOP - 24),
                length: 40 + Math.random() * 95,
                amplitude: 1.0 + Math.random() * 1.5,
                speed: 12 + Math.random() * 10,
                phase: Math.random() * Math.PI * 2,
                opacity: 0.14 + Math.random() * 0.20,
            });
        }

        // River sparkling sun glints
        this.glints = [];
        for (let i = 0; i < 30; i++) {
            this.glints.push({
                relX: (Math.random() - 0.5) * 190,
                relY: Math.random(),
                phase: Math.random() * Math.PI * 2,
                size: 1.2 + Math.random() * 2.0,
            });
        }

        // Riverbank reeds & kashful
        this.reeds = [];
        for (let i = 0; i < 55; i++) {
            this.reeds.push({
                x: Math.random() * WORLD.WIDTH,
                y: WORLD.NEAR_BANK_TOP + Math.random() * 24,
                h: 20 + Math.random() * 30,
                phase: Math.random() * Math.PI * 2,
            });
        }

        // Riverbank pebbles and stones
        this.bankStones = [];
        for (let i = 0; i < 35; i++) {
            this.bankStones.push({
                x: Math.random() * WORLD.WIDTH,
                y: WORLD.NEAR_BANK_TOP + 5 + Math.random() * 26,
                rx: 3 + Math.random() * 4.5,
                ry: 1.5 + Math.random() * 2.4,
                color: `rgb(${110 + Math.floor(Math.random()*35)}, ${105 + Math.floor(Math.random()*30)}, ${90 + Math.floor(Math.random()*25)})`,
            });
        }

        // Solitary background villagers
        this.loneVillagers = [
            { x: 140,  y: 708, type: 'sweeping', phase: 0 },
            { x: 1740, y: 704, type: 'shawl_walking', phase: 0 },
        ];

        // ═════════════════════════════════════════════════════════════════
        // FOREGROUND: NATURAL DEW-COVERED GRASS FIELD (BOTANICAL CLUSTERS)
        // ═════════════════════════════════════════════════════════════════
        // Realistic field: grass grows in natural clumps with open soil patches
        this.grassTufts = [];
        const tuftCount = 65;
        const grassColors = [
            '#3d542e', // deep olive
            '#4a6338', // muted winter green
            '#596e42', // meadow green
            '#6a7d4e', // soft sunlit green
            '#544d32', // dry earthy blade
            '#736640', // winter thatch blade
        ];

        for (let i = 0; i < tuftCount; i++) {
            // Cluster origin along uneven foreground (leaving natural open soil patches)
            const cx = (i / tuftCount) * WORLD.WIDTH + (Math.random() - 0.5) * 35;
            const cy = WORLD.FOREGROUND_TOP + 12 + Math.random() * (WORLD.HEIGHT - WORLD.FOREGROUND_TOP - 22);
            const bladeCount = 6 + Math.floor(Math.random() * 6);
            const blades = [];

            for (let b = 0; b < bladeCount; b++) {
                const spreadAngle = (b / bladeCount - 0.5) * 1.4 + (Math.random() - 0.5) * 0.3;
                const h = 20 + Math.random() * 42;
                const hasDew = Math.random() < 0.38; // ~38% of blades carry dew droplets

                blades.push({
                    lean: spreadAngle,
                    h: h,
                    w: 1.4 + Math.random() * 1.2,
                    curve: (Math.random() - 0.5) * 0.4,
                    color: grassColors[Math.floor(Math.random() * grassColors.length)],
                    swayPhase: Math.random() * Math.PI * 2,
                    swaySpeed: 1.0 + Math.random() * 0.6,
                    hasDew: hasDew,
                    dewPos: 0.72 + Math.random() * 0.26, // near blade tip
                    dewSize: 0.9 + Math.random() * 1.0,  // tiny, delicate droplet
                    dewShimmerPhase: Math.random() * Math.PI * 2,
                });
            }

            this.grassTufts.push({ cx, cy, blades });
        }

        // Open soil patches (bare ground with subtle texture)
        this.soilPatches = [];
        for (let i = 0; i < 18; i++) {
            this.soilPatches.push({
                x: Math.random() * WORLD.WIDTH,
                y: WORLD.FOREGROUND_TOP + 20 + Math.random() * (WORLD.HEIGHT - WORLD.FOREGROUND_TOP - 30),
                rx: 16 + Math.random() * 32,
                ry: 5 + Math.random() * 10,
                color: `rgba(${68 + Math.floor(Math.random()*15)}, ${52 + Math.floor(Math.random()*12)}, ${35 + Math.floor(Math.random()*10)}, 0.45)`,
            });
        }

        // Delicate wild winter flowers nestled in grass
        this.wildFlowers = [];
        const flowerColors = ['#f4d06f', '#f9f8f0', '#eb8a90', '#f4a261', '#e9c46a'];
        for (let i = 0; i < 28; i++) {
            this.wildFlowers.push({
                x: Math.random() * WORLD.WIDTH,
                y: WORLD.FOREGROUND_TOP + 22 + Math.random() * (WORLD.HEIGHT - WORLD.FOREGROUND_TOP - 35),
                r: 1.8 + Math.random() * 2.2,
                color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
                stemH: 10 + Math.random() * 15,
                swayPhase: Math.random() * Math.PI * 2,
            });
        }

        // Fallen winter leaves
        this.fallenLeaves = [];
        for (let i = 0; i < 16; i++) {
            this.fallenLeaves.push({
                x: 60 + Math.random() * (WORLD.WIDTH - 120),
                y: WORLD.FOREGROUND_TOP + 15 + Math.random() * 85,
                angle: Math.random() * Math.PI * 2,
                size: 3.5 + Math.random() * 5.0,
                color: ['#825828', '#9e632e', '#6e5428', '#8c6238'][Math.floor(Math.random() * 4)],
            });
        }
    }

    update(dt, totalTime) {
        this.time = totalTime;

        // Boat movement
        this.boatX += this.boatSpeed * dt;
        if (this.boatX > WORLD.WIDTH + 140) this.boatX = -140;

        // Bird flocks
        for (const flock of this.birdFlocks) {
            flock.currentX += flock.speed * dt;
            if (flock.currentX > WORLD.WIDTH + 120) flock.currentX = -120;
            flock.wingPhase += dt * 6.5;
        }

        // Cloud drift
        for (const c of this.clouds) {
            c.x += c.speed * dt;
            if (c.x > WORLD.WIDTH + 250) c.x = -c.w - 50;
        }

        // Mist drift
        for (let i = 0; i < this.fogOffsets.length; i++) {
            this.fogOffsets[i] += WORLD.FOG_LAYERS[i].speed * dt;
        }

        // Lone villagers
        for (const v of this.loneVillagers) {
            v.phase += dt * 2.0;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 1. BACKGROUND: 7 AM Sky, Subtle Sunrise, Distant Fields
    // ─────────────────────────────────────────────────────────────────
    drawBackground(ctx) {
        this._drawSky(ctx);
        this._drawSubtleSunrise(ctx);
        this._drawClouds(ctx);
        this._drawDistantFarmland(ctx);
        this._drawDistantSilhouettes(ctx);
        this._drawBirds(ctx);
    }

    _drawSky(ctx) {
        // Natural 7 AM winter morning sky: cool steel blue-grey zenith fading into soft morning peach and gentle pale gold
        const grad = ctx.createLinearGradient(0, 0, 0, WORLD.HORIZON_Y + 40);
        grad.addColorStop(0, '#314457');     // cool morning zenith
        grad.addColorStop(0.3, '#486177');  // steel blue
        grad.addColorStop(0.6, '#758d9e');  // pale morning grey-blue
        grad.addColorStop(0.78, '#ab998b'); // subtle warm neutral haze
        grad.addColorStop(0.88, '#cc9f7c'); // soft winter peach
        grad.addColorStop(0.96, '#e4bc88'); // pale morning gold
        grad.addColorStop(1, '#ebd0a2');    // gentle horizon glow
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, WORLD.WIDTH, WORLD.HORIZON_Y + 50);
    }

    _drawSubtleSunrise(ctx) {
        // Subtle winter sunrise: sun just peeking above the distant horizon, soft & natural (no giant nuclear orb)
        const sx = WORLD.SUN.x;
        const sy = WORLD.SUN.y;
        const r = WORLD.SUN.radius;

        ctx.save();

        // 1. Gentle surrounding warmth (radius ~60px, subtle opacity)
        const gWarm = ctx.createRadialGradient(sx, sy, r * 0.4, sx, sy, 65);
        gWarm.addColorStop(0, 'rgba(255, 235, 180, 0.35)');
        gWarm.addColorStop(0.4, 'rgba(255, 195, 130, 0.16)');
        gWarm.addColorStop(0.8, 'rgba(255, 170, 100, 0.05)');
        gWarm.addColorStop(1, 'rgba(255, 150, 80, 0)');
        ctx.fillStyle = gWarm;
        ctx.beginPath();
        ctx.arc(sx, sy, 65, 0, Math.PI * 2);
        ctx.fill();

        // 2. Small pale golden-white sun disc peeking over horizon
        const gDisc = ctx.createRadialGradient(sx - 2, sy - 2, 2, sx, sy, r);
        gDisc.addColorStop(0, '#ffffff');    // soft white-gold center
        gDisc.addColorStop(0.45, '#fff6d4'); // pale gold
        gDisc.addColorStop(0.85, '#f5c57a'); // warm apricot
        gDisc.addColorStop(1, '#e59d52');    // gentle amber rim
        ctx.fillStyle = gDisc;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawClouds(ctx) {
        ctx.save();
        for (const c of this.clouds) {
            ctx.globalAlpha = 0.15;
            const grad = ctx.createLinearGradient(c.x, c.y - c.h, c.x, c.y + c.h);
            grad.addColorStop(0, 'rgba(255, 245, 230, 0.7)');
            grad.addColorStop(1, 'rgba(220, 185, 155, 0.2)');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            ctx.quadraticCurveTo(c.x + c.w * 0.2, c.y - c.h * 1.1, c.x + c.w * 0.45, c.y - c.h * 0.5);
            ctx.quadraticCurveTo(c.x + c.w * 0.7, c.y - c.h * 1.2, c.x + c.w * 0.85, c.y - c.h * 0.4);
            ctx.quadraticCurveTo(c.x + c.w, c.y - c.h * 0.4, c.x + c.w, c.y);
            ctx.quadraticCurveTo(c.x + c.w * 0.75, c.y + c.h * 0.4, c.x + c.w * 0.45, c.y + c.h * 0.3);
            ctx.quadraticCurveTo(c.x + c.w * 0.15, c.y + c.h * 0.5, c.x, c.y);
            ctx.fill();
        }
        ctx.restore();
    }

    _drawDistantFarmland(ctx) {
        const baseY = WORLD.HORIZON_Y - 8;
        const colors = [
            '#556e50',  // green paddy field
            '#a8994a',  // mustard field (সরিষা ক্ষেত)
            '#4a6344',  // winter crops
            '#6a5e48',  // plowed earth
        ];

        for (let i = 0; i < colors.length; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(0, baseY + i * 10, WORLD.WIDTH, 11);
        }
    }

    _drawDistantSilhouettes(ctx) {
        ctx.save();

        // 1. Distant tree line along horizon
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = '#2d3f35';
        ctx.beginPath();
        ctx.moveTo(0, WORLD.HORIZON_Y + 12);
        let x = 0;
        while (x < WORLD.WIDTH) {
            const h = 20 + Math.abs(noise1D(x * 0.012)) * 32;
            const w = 28 + Math.abs(noise1D(x * 0.02 + 7)) * 45;
            ctx.quadraticCurveTo(x + w * 0.5, WORLD.HORIZON_Y + 12 - h, x + w, WORLD.HORIZON_Y + 12);
            x += w;
        }
        ctx.lineTo(WORLD.WIDTH, WORLD.HORIZON_Y + 20);
        ctx.lineTo(0, WORLD.HORIZON_Y + 20);
        ctx.closePath();
        ctx.fill();

        // 2. Distant tall palm silhouettes
        ctx.globalAlpha = 0.70;
        ctx.fillStyle = '#203227';
        const distantPalms = [80, 220, 390, 610, 870, 1070, 1270, 1480, 1700, 1880];
        for (const px of distantPalms) {
            const py = WORLD.HORIZON_Y + 10;
            const ph = 38 + Math.abs(noise1D(px * 1.5)) * 22;
            ctx.fillRect(px - 1.2, py - ph, 2.4, ph);
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 1.5 - Math.PI * 0.75;
                ctx.beginPath();
                ctx.moveTo(px, py - ph);
                const endX = px + Math.cos(angle) * 20;
                const endY = py - ph + Math.sin(angle) * 10 + 5;
                ctx.quadraticCurveTo(px + Math.cos(angle) * 10, py - ph + Math.sin(angle) * 5, endX, endY);
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#203227';
                ctx.stroke();
            }
        }

        // 3. Far riverbank shoreline (crisp edge separating land from water)
        const fbGrad = ctx.createLinearGradient(0, WORLD.RIVER_TOP - 14, 0, WORLD.RIVER_TOP + 2);
        fbGrad.addColorStop(0, '#53714d');
        fbGrad.addColorStop(1, '#3b5536');
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = fbGrad;
        ctx.fillRect(0, WORLD.RIVER_TOP - 14, WORLD.WIDTH, 17);

        ctx.restore();
    }

    _drawBirds(ctx) {
        ctx.save();
        ctx.strokeStyle = '#1d2a36';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        for (const flock of this.birdFlocks) {
            const wingAngle = Math.sin(flock.wingPhase) * 0.42;
            for (let i = 0; i < flock.count; i++) {
                const bx = flock.currentX + i * (flock.size * 6) + (i % 2) * flock.size * 3.5;
                const by = flock.y + Math.abs(i - flock.count / 2) * 5 + flock.dy * flock.currentX * 0.08;
                const s = flock.size;

                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(bx - s * 2.0, by + wingAngle * s * 1.0);
                ctx.quadraticCurveTo(bx - s * 0.5, by - s * 0.5 - wingAngle * s, bx, by);
                ctx.quadraticCurveTo(bx + s * 0.5, by - s * 0.5 - wingAngle * s, bx + s * 2.0, by + wingAngle * s * 1.0);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. RIVER: Distinct Natural Blue-Grey Water & Organic Ripples
    // ─────────────────────────────────────────────────────────────────
    drawRiver(ctx) {
        this._drawRiverWater(ctx);
        this._drawOrganicRiverRipples(ctx);
        this._drawSunGlints(ctx);
        this._drawBoat(ctx);
        this._drawSubtleWaterVapor(ctx);
    }

    _drawRiverWater(ctx) {
        const top = WORLD.RIVER_TOP;
        const bottom = WORLD.RIVER_BOTTOM;
        const height = bottom - top;

        // Distinct, rich, natural blue-grey river gradient
        const rGrad = ctx.createLinearGradient(0, top, 0, bottom);
        rGrad.addColorStop(0, '#4b6c7e');     // top shoreline reflection
        rGrad.addColorStop(0.25, '#3e5f71');  // clean natural blue-grey
        rGrad.addColorStop(0.6, '#314f61');   // deep calm river
        rGrad.addColorStop(0.85, '#284353');  // shaded river bottom
        rGrad.addColorStop(1, '#203744');     // near bank contour shadow
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, top, WORLD.WIDTH, height);

        // Subtle, gentle golden-amber morning reflection strip below the sunrise
        ctx.save();
        const sx = WORLD.SUN.x;
        const sunPathGrad = ctx.createLinearGradient(sx - 130, 0, sx + 130, 0);
        sunPathGrad.addColorStop(0, 'rgba(245, 195, 130, 0)');
        sunPathGrad.addColorStop(0.35, 'rgba(245, 210, 150, 0.10)');
        sunPathGrad.addColorStop(0.5, 'rgba(255, 225, 175, 0.20)');
        sunPathGrad.addColorStop(0.65, 'rgba(245, 210, 150, 0.10)');
        sunPathGrad.addColorStop(1, 'rgba(245, 195, 130, 0)');
        ctx.fillStyle = sunPathGrad;
        ctx.fillRect(sx - 140, top, 280, height);
        ctx.restore();
    }

    _drawOrganicRiverRipples(ctx) {
        // Natural, non-repetitive irregular ripple patches flowing with current
        ctx.save();
        ctx.lineCap = 'round';

        for (const r of this.riverRipples) {
            const currentX = ((r.x + this.time * r.speed) % (WORLD.WIDTH + 140)) - 70;
            const waveY = r.y + Math.sin(this.time * 2.0 + r.phase) * r.amplitude;

            // Ripple crest
            ctx.strokeStyle = `rgba(185, 218, 235, ${r.opacity})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(currentX, waveY);
            ctx.quadraticCurveTo(currentX + r.length * 0.5, waveY + Math.sin(this.time * 3 + r.phase) * 1.5, currentX + r.length, waveY);
            ctx.stroke();

            // Ripple subtle shadow underneath
            ctx.strokeStyle = 'rgba(15, 30, 40, 0.12)';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(currentX + 2, waveY + 1.8);
            ctx.lineTo(currentX + r.length - 2, waveY + 1.8);
            ctx.stroke();
        }

        ctx.restore();
    }

    _drawSunGlints(ctx) {
        ctx.save();
        const sx = WORLD.SUN.x;
        const top = WORLD.RIVER_TOP + 12;
        const height = WORLD.RIVER_BOTTOM - top - 12;

        for (const g of this.glints) {
            const gx = sx + g.relX + Math.sin(this.time * 2.2 + g.phase) * 12;
            const gy = top + g.relY * height;
            const shimmer = (Math.sin(this.time * 4.5 + g.phase) + 1) / 2;

            ctx.globalAlpha = 0.25 + shimmer * 0.40;
            ctx.fillStyle = '#fffdf5';
            ctx.beginPath();
            ctx.ellipse(gx, gy, g.size * 2.2 * shimmer, g.size * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    _drawBoat(ctx) {
        const bx = this.boatX;
        const bob = oscillate(this.time, 3.2, -2.2, 2.2);
        const by = (WORLD.RIVER_TOP + WORLD.RIVER_BOTTOM) / 2 + 3 + bob;
        const oarAngle = Math.sin(this.time * 1.8) * 0.40;

        ctx.save();
        ctx.translate(bx, by);

        // Boat wake ripples
        ctx.save();
        ctx.strokeStyle = 'rgba(215, 235, 248, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-28, 7);
        ctx.quadraticCurveTo(-45, 11, -70, 16);
        ctx.moveTo(-28, 2);
        ctx.quadraticCurveTo(-45, -2, -65, -7);
        ctx.stroke();
        ctx.restore();

        // Hull shadow in water
        ctx.globalAlpha = 0.32;
        drawEllipse(ctx, 0, 13, 36, 6);
        ctx.fillStyle = '#111e26';
        ctx.fill();
        ctx.globalAlpha = 1;

        // Wooden Dingi boat hull (দেশি ডিঙি নৌকা)
        ctx.beginPath();
        ctx.moveTo(-34, 0);
        ctx.quadraticCurveTo(-40, -9, -28, -11);
        ctx.lineTo(30, -11);
        ctx.quadraticCurveTo(42, -9, 38, 0);
        ctx.quadraticCurveTo(26, 8, -24, 8);
        ctx.quadraticCurveTo(-36, 5, -34, 0);
        ctx.closePath();
        ctx.fillStyle = '#5a381b';
        ctx.fill();
        ctx.strokeStyle = '#351d0c';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Wooden planks on boat
        ctx.strokeStyle = 'rgba(55, 30, 12, 0.45)';
        ctx.lineWidth = 0.8;
        for (let i = -20; i <= 22; i += 8) {
            ctx.beginPath();
            ctx.moveTo(i, -10);
            ctx.lineTo(i - 2, 7);
            ctx.stroke();
        }

        // Bamboo hood / ছই
        ctx.beginPath();
        ctx.arc(0, -11, 15, Math.PI, 0);
        ctx.fillStyle = '#94754a';
        ctx.fill();
        ctx.strokeStyle = '#604627';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Boatman (মাঝি) seated at the stern
        const manX = 23;
        ctx.fillStyle = '#73573c';
        ctx.fillRect(manX - 5, -27, 9.5, 16);

        // Head
        ctx.beginPath();
        ctx.arc(manX, -32, 5.2, 0, Math.PI * 2);
        ctx.fillStyle = '#b8855a';
        ctx.fill();

        // White Mathal / Pagri
        ctx.beginPath();
        ctx.arc(manX, -34, 5.8, Math.PI, 0);
        ctx.fillStyle = '#ede8dc';
        ctx.fill();

        // Rowing arm & wooden oar (বৈঠা)
        ctx.save();
        ctx.translate(manX - 2, -21);
        ctx.rotate(oarAngle);
        ctx.fillStyle = '#b8855a';
        ctx.fillRect(-2, 0, 3.8, 11);
        ctx.fillStyle = '#442a13';
        ctx.fillRect(-1.1, 9, 2.2, 32);
        ctx.fillStyle = '#563618';
        ctx.beginPath();
        ctx.ellipse(0, 43, 4.5, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    _drawSubtleWaterVapor(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.10;
        const drift = (this.time * 5) % WORLD.WIDTH;

        const vaporGrad = ctx.createLinearGradient(0, WORLD.RIVER_TOP + 10, 0, WORLD.RIVER_TOP + 35);
        vaporGrad.addColorStop(0, 'rgba(235, 242, 250, 0)');
        vaporGrad.addColorStop(0.5, 'rgba(240, 246, 252, 0.65)');
        vaporGrad.addColorStop(1, 'rgba(235, 242, 250, 0)');
        ctx.fillStyle = vaporGrad;

        ctx.fillRect(-100 + Math.sin(drift * 0.01) * 30, WORLD.RIVER_TOP + 15, WORLD.WIDTH + 200, 22);
        ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. MIDGROUND: Natural Bank, Ground, Road, Houses, School,
    //    Flora, and VILLAGERS WARMING THEMSELVES AROUND WOOD FIRE
    // ─────────────────────────────────────────────────────────────────
    drawMidground(ctx) {
        this._drawNearBank(ctx);
        this._drawVillageGround(ctx);
        this._drawRoad(ctx);
        this._drawHouses(ctx);
        this._drawSchool(ctx);
        this._drawTrees(ctx);
        this._drawFootbridge(ctx);
        this._drawVillagersWarmingByFire(ctx); // আগুন পোহানো
        this._drawLoneVillagers(ctx);
    }

    _drawNearBank(ctx) {
        const bankGrad = ctx.createLinearGradient(0, WORLD.NEAR_BANK_TOP, 0, WORLD.GROUND_TOP + 10);
        bankGrad.addColorStop(0, '#53714b');
        bankGrad.addColorStop(0.35, '#687851');
        bankGrad.addColorStop(0.8, '#786844');
        bankGrad.addColorStop(1, '#635133');
        ctx.fillStyle = bankGrad;
        ctx.fillRect(0, WORLD.NEAR_BANK_TOP, WORLD.WIDTH, WORLD.GROUND_TOP + 12 - WORLD.NEAR_BANK_TOP);

        // Natural undulating riverbank contour
        ctx.save();
        ctx.fillStyle = '#426139';
        ctx.beginPath();
        ctx.moveTo(0, WORLD.NEAR_BANK_TOP);
        for (let x = 0; x <= WORLD.WIDTH; x += 18) {
            const yOff = Math.sin(x * 0.04) * 3.2 + Math.sin(x * 0.09) * 2.0;
            ctx.lineTo(x, WORLD.NEAR_BANK_TOP + yOff);
        }
        ctx.lineTo(WORLD.WIDTH, WORLD.NEAR_BANK_TOP + 9);
        ctx.lineTo(0, WORLD.NEAR_BANK_TOP + 9);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Reeds & Kashful along river edge
        ctx.save();
        for (const reed of this.reeds) {
            const sway = Math.sin(this.time * 1.5 + reed.phase) * 3.8;
            ctx.strokeStyle = 'rgba(65, 96, 48, 0.75)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(reed.x, reed.y);
            ctx.quadraticCurveTo(reed.x + sway * 0.5, reed.y - reed.h * 0.5, reed.x + sway, reed.y - reed.h);
            ctx.stroke();

            if (reed.h > 24) {
                ctx.fillStyle = 'rgba(245, 245, 240, 0.85)';
                ctx.beginPath();
                ctx.ellipse(reed.x + sway, reed.y - reed.h - 4, 2.2, 6.5, 0.15, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();

        // Bank pebbles
        for (const s of this.bankStones) {
            ctx.fillStyle = s.color;
            drawEllipse(ctx, s.x, s.y, s.rx, s.ry);
            ctx.fill();
        }
    }

    _drawVillageGround(ctx) {
        const gGrad = ctx.createLinearGradient(0, WORLD.GROUND_TOP, 0, WORLD.HEIGHT);
        gGrad.addColorStop(0, '#587546');
        gGrad.addColorStop(0.18, '#69784e');
        gGrad.addColorStop(0.4, '#6d6242');
        gGrad.addColorStop(0.7, '#625032');
        gGrad.addColorStop(1, '#503f26');
        ctx.fillStyle = gGrad;
        ctx.fillRect(0, WORLD.GROUND_TOP, WORLD.WIDTH, WORLD.HEIGHT - WORLD.GROUND_TOP);

        // Ground texture
        ctx.save();
        ctx.globalAlpha = 0.12;
        for (let i = 0; i < 200; i++) {
            const gx = Math.random() * WORLD.WIDTH;
            const gy = WORLD.GROUND_TOP + 20 + Math.random() * (WORLD.FOREGROUND_TOP - WORLD.GROUND_TOP - 20);
            ctx.fillStyle = Math.random() > 0.5 ? '#483520' : '#5a6838';
            ctx.fillRect(gx, gy, 2 + Math.random() * 3, 1.2 + Math.random());
        }
        ctx.restore();

        // Courtyards in front of houses
        for (const h of WORLD.HOUSES) {
            ctx.fillStyle = 'rgba(185, 165, 132, 0.36)';
            ctx.fillRect(h.x - 14, h.y + h.h, h.w + 28, 38);
        }
    }

    _drawRoad(ctx) {
        const path = WORLD.MAIN_ROAD_PATH;
        const halfW = WORLD.ROAD_HALF_WIDTH;

        ctx.save();

        // Main red dirt road (লাল মাটির মেঠো পথ)
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y - halfW);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y - halfW);
        }
        for (let i = path.length - 1; i >= 0; i--) {
            ctx.lineTo(path[i].x, path[i].y + halfW);
        }
        ctx.closePath();
        ctx.fillStyle = '#835432';
        ctx.fill();

        // Worn center pathway
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y - halfW * 0.35);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y - halfW * 0.35);
        }
        for (let i = path.length - 1; i >= 0; i--) {
            ctx.lineTo(path[i].x, path[i].y + halfW * 0.35);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(165, 118, 76, 0.42)';
        ctx.fill();

        // Path curving into schoolyard
        ctx.beginPath();
        ctx.moveTo(1380, 746);
        ctx.quadraticCurveTo(1440, 738, 1480, 727);
        ctx.lineTo(1540, 712);
        ctx.lineTo(1560, 714);
        ctx.lineTo(1495, 734);
        ctx.quadraticCurveTo(1440, 748, 1400, 758);
        ctx.closePath();
        ctx.fillStyle = '#885935';
        ctx.fill();

        // Soft road border
        ctx.globalAlpha = 0.20;
        ctx.strokeStyle = '#52321a';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y - halfW);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y - halfW);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y + halfW);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y + halfW);
        }
        ctx.stroke();

        ctx.restore();
    }

    _drawHouses(ctx) {
        for (const h of WORLD.HOUSES) {
            this._drawSingleHouse(ctx, h);
        }
    }

    _drawSingleHouse(ctx, h) {
        ctx.save();

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.fillRect(h.x + 6, h.y + h.h - 3, h.w + 8, 8);

        // Wall
        ctx.fillStyle = h.wallColor;
        ctx.fillRect(h.x, h.y, h.w, h.h);

        // Bamboo weaving lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.09)';
        ctx.lineWidth = 0.8;
        for (let yy = h.y + 5; yy < h.y + h.h; yy += 6) {
            ctx.beginPath();
            ctx.moveTo(h.x, yy);
            ctx.lineTo(h.x + h.w, yy);
            ctx.stroke();
        }

        // Corrugated tin roof
        ctx.beginPath();
        ctx.moveTo(h.x - h.w * 0.12, h.y);
        ctx.lineTo(h.x + h.w * 0.5, h.y - h.roofH);
        ctx.lineTo(h.x + h.w * 1.12, h.y);
        ctx.closePath();
        ctx.fillStyle = h.roofColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(40, 50, 60, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Roof ridges
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 0.8;
        for (let i = 1; i < 9; i++) {
            const t = i / 9;
            const ly = h.y - h.roofH * (1 - t);
            const span = (h.w * 0.62) * t;
            ctx.beginPath();
            ctx.moveTo(h.x + h.w * 0.5 - span, ly);
            ctx.lineTo(h.x + h.w * 0.5 + span, ly);
            ctx.stroke();
        }

        // Door
        const dw = h.w * 0.24;
        const dh = h.h * 0.68;
        const dx = h.x + h.w * 0.38;
        const dy = h.y + h.h - dh;
        ctx.fillStyle = '#3a2612';
        ctx.fillRect(dx, dy, dw, dh);

        // Window
        const ws = h.w * 0.16;
        ctx.fillStyle = '#648296';
        ctx.fillRect(h.x + h.w * 0.12, h.y + h.h * 0.25, ws, ws);
        ctx.strokeStyle = '#3a2815';
        ctx.lineWidth = 1;
        ctx.strokeRect(h.x + h.w * 0.12, h.y + h.h * 0.25, ws, ws);

        // Bamboo fence
        if (h.hasFence) {
            ctx.strokeStyle = '#7c6a46';
            ctx.lineWidth = 1.8;
            const fx1 = h.x + h.w + 4;
            const fx2 = fx1 + 42;
            const fy = h.y + h.h - 26;
            ctx.beginPath();
            ctx.moveTo(fx1, fy);
            ctx.lineTo(fx2, fy);
            ctx.moveTo(fx1, fy + 12);
            ctx.lineTo(fx2, fy + 12);
            ctx.moveTo(fx1, fy + 24);
            ctx.lineTo(fx2, fy + 24);
            ctx.stroke();
            for (let px = fx1; px <= fx2; px += 9) {
                ctx.beginPath();
                ctx.moveTo(px, fy - 4);
                ctx.lineTo(px, fy + 27);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    _drawSchool(ctx) {
        const s = WORLD.SCHOOL;
        ctx.save();

        // 1. School courtyard ground
        ctx.fillStyle = 'rgba(195, 180, 148, 0.48)';
        ctx.beginPath();
        ctx.moveTo(s.x - 40, s.y + s.h);
        ctx.lineTo(s.x + s.w + 50, s.y + s.h);
        ctx.lineTo(s.x + s.w + 30, s.y + s.h + 38);
        ctx.lineTo(s.x - 20, s.y + s.h + 38);
        ctx.closePath();
        ctx.fill();

        // 2. Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.fillRect(s.x + 8, s.y + s.h - 2, s.w + 12, 10);

        // 3. Whitewashed walls
        ctx.fillStyle = '#e8dfcb';
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.strokeStyle = '#9c9278';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(s.x, s.y, s.w, s.h);

        // 4. Tin roof
        ctx.beginPath();
        ctx.moveTo(s.x - 18, s.y);
        ctx.lineTo(s.x + s.w / 2, s.y - 65);
        ctx.lineTo(s.x + s.w + 18, s.y);
        ctx.closePath();
        ctx.fillStyle = '#547688';
        ctx.fill();
        ctx.strokeStyle = '#3e5866';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 0.8;
        for (let i = 1; i < 11; i++) {
            const t = i / 11;
            const ly = s.y - 65 * (1 - t);
            const span = (s.w + 36) * t * 0.5;
            ctx.beginPath();
            ctx.moveTo(s.x + s.w / 2 - span, ly);
            ctx.lineTo(s.x + s.w / 2 + span, ly);
            ctx.stroke();
        }

        // 5. Windows
        for (let i = 0; i < 4; i++) {
            const wx = s.x + 14 + i * 40;
            const wy = s.y + 26;
            ctx.fillStyle = '#7298b0';
            ctx.fillRect(wx, wy, 24, 28);
            ctx.strokeStyle = '#485e6e';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(wx, wy, 24, 28);
            ctx.strokeStyle = '#334450';
            ctx.lineWidth = 0.8;
            for (let bx = wx + 5; bx < wx + 24; bx += 5) {
                ctx.beginPath();
                ctx.moveTo(bx, wy);
                ctx.lineTo(bx, wy + 28);
                ctx.stroke();
            }
        }

        // 6. Door & veranda steps
        const doorW = 32;
        const doorH = 55;
        const doorX = s.x + s.w / 2 - doorW / 2;
        const doorY = s.y + s.h - doorH;

        ctx.fillStyle = '#223824';
        ctx.fillRect(doorX, doorY, doorW, doorH);
        ctx.strokeStyle = '#182b1b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(doorX, doorY, doorW, doorH);

        ctx.fillStyle = '#c8bba0';
        ctx.fillRect(doorX - 6, s.y + s.h - 4, doorW + 12, 6);
        ctx.fillRect(doorX - 10, s.y + s.h + 2, doorW + 20, 6);

        // 7. School nameboard
        ctx.fillStyle = '#1c4254';
        drawRoundedRect(ctx, s.x + 22, s.y + 6, s.w - 44, 15, 3);
        ctx.fill();
        ctx.fillStyle = '#f5f8fa';
        ctx.font = 'bold 9px "Noto Sans Bengali", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('সরকারি প্রাথমিক বিদ্যালয়', s.x + s.w / 2, s.y + 17);

        // 8. Bangladeshi Flag
        const poleX = s.x + s.w + 22;
        const poleBaseY = s.y + s.h + 10;
        const poleTopY = s.y - 75;

        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(poleX, poleBaseY);
        ctx.lineTo(poleX, poleTopY);
        ctx.stroke();

        const flagWave = Math.sin(this.time * 2.5) * 4;
        ctx.fillStyle = '#006a4e';
        ctx.beginPath();
        ctx.moveTo(poleX, poleTopY);
        ctx.lineTo(poleX + 30, poleTopY + 4 + flagWave);
        ctx.lineTo(poleX + 27, poleTopY + 20 + flagWave * 0.6);
        ctx.lineTo(poleX, poleTopY + 16);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f42a41';
        ctx.beginPath();
        ctx.arc(poleX + 13, poleTopY + 10 + flagWave * 0.7, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawTrees(ctx) {
        const sorted = [...WORLD.TREES].sort((a, b) => a.y - b.y);
        for (const tree of sorted) {
            if (tree.type === 'bamboo' && tree.y > 850) continue;
            this._drawTree(ctx, tree);
        }
    }

    _drawTree(ctx, tree) {
        const sway = Math.sin(this.time * 0.8 + tree.x * 0.01) * (tree.sway || 1) * 2.4;

        switch (tree.type) {
            case 'coconut': this._drawGrandCoconutPalm(ctx, tree, sway); break;
            case 'date':    this._drawGrandDatePalm(ctx, tree, sway); break;
            case 'banana':  this._drawGrandBananaPlant(ctx, tree, sway); break;
            case 'bamboo':  this._drawGrandBambooCluster(ctx, tree, sway); break;
            case 'mango':   this._drawGrandMangoTree(ctx, tree, sway); break;
        }
    }

    _drawGrandCoconutPalm(ctx, tree, sway) {
        const { x, y, h, lean } = tree;
        const topX = x + lean + sway;
        const topY = y - h;

        ctx.save();
        ctx.fillStyle = '#4c351f';
        ctx.beginPath();
        ctx.ellipse(x, y, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#63492e';
        ctx.lineWidth = Math.max(9, h * 0.045);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + lean * 0.4 + sway * 0.35, y - h * 0.52, topX, topY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(78, 52, 28, 0.45)';
        ctx.lineWidth = 1.4;
        const ringCount = 18;
        for (let i = 1; i < ringCount; i++) {
            const t = i / ringCount;
            const rx = lerp(x, topX, t);
            const ry = lerp(y, topY, t);
            ctx.beginPath();
            ctx.moveTo(rx - 5, ry);
            ctx.lineTo(rx + 5, ry);
            ctx.stroke();
        }

        const frondCount = 15;
        for (let i = 0; i < frondCount; i++) {
            const angle = (i / frondCount) * Math.PI * 2 - Math.PI * 0.5;
            const frondLen = h * 0.46;
            const frondSway = sway * 0.6 + Math.sin(this.time * 1.3 + i * 0.8) * 3.5;
            const endX = topX + Math.cos(angle) * frondLen + frondSway;
            const endY = topY + Math.sin(angle) * frondLen * 0.55 + Math.abs(Math.cos(angle)) * 22;

            ctx.strokeStyle = '#28581e';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(topX, topY);
            ctx.quadraticCurveTo(
                topX + Math.cos(angle) * frondLen * 0.45 + frondSway * 0.35,
                topY + Math.sin(angle) * frondLen * 0.3 + 6,
                endX, endY
            );
            ctx.stroke();

            ctx.strokeStyle = '#387528';
            ctx.lineWidth = 1.0;
            const leafletCount = 12;
            for (let j = 2; j < leafletCount; j++) {
                const lt = j / leafletCount;
                const lx = lerp(topX, endX, lt);
                const ly = lerp(topY, endY, lt);
                const leafAngle = angle + Math.PI * 0.35;
                const leafL = 14 * (1 - lt * 0.4);

                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx + Math.cos(leafAngle) * leafL, ly + Math.sin(leafAngle) * leafL);
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx - Math.cos(leafAngle) * leafL, ly + Math.sin(leafAngle) * leafL + 3);
                ctx.stroke();
            }
        }

        ctx.fillStyle = '#4c6828';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(topX - 5 + (i % 3) * 5, topY + 6 + Math.floor(i / 3) * 5, 3.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    _drawGrandDatePalm(ctx, tree, sway) {
        const { x, y, h, lean, hasPot } = tree;
        const topX = x + lean + sway;
        const topY = y - h;

        ctx.save();
        ctx.strokeStyle = '#553e24';
        ctx.lineWidth = Math.max(12, h * 0.075);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + lean * 0.35 + sway * 0.35, y - h * 0.5, topX, topY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(60, 42, 22, 0.45)';
        ctx.lineWidth = 1.0;
        const cuts = 14;
        for (let i = 2; i < cuts; i++) {
            const t = i / cuts;
            const rx = lerp(x, topX, t);
            const ry = lerp(y, topY, t);
            ctx.beginPath();
            ctx.moveTo(rx - 6, ry);
            ctx.lineTo(rx - 4, ry);
            ctx.lineTo(rx + 6, ry);
            ctx.lineTo(rx + 4, ry);
            ctx.closePath();
            ctx.stroke();
        }

        // Clay Date Juice Pot (মাটির রসের হাঁড়ি)
        if (hasPot) {
            const potT = 0.82;
            const potX = lerp(x, topX, potT) + 7;
            const potY = lerp(y, topY, potT);

            ctx.strokeStyle = '#8a7a40';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(potX - 8, potY - 3);
            ctx.lineTo(potX, potY + 2);
            ctx.stroke();

            ctx.strokeStyle = '#a48b62';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(potX - 5, potY - 6);
            ctx.lineTo(potX, potY + 5);
            ctx.stroke();

            ctx.fillStyle = '#b55428';
            ctx.beginPath();
            ctx.arc(potX + 2, potY + 9, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#783515';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = '#8a3c18';
            ctx.fillRect(potX - 1, potY + 2, 6, 2.5);
        }

        const frondCount = 18;
        for (let i = 0; i < frondCount; i++) {
            const angle = (i / frondCount) * Math.PI * 2;
            const frondLen = h * 0.38;
            const fs = sway * 0.4 + Math.sin(this.time * 1.1 + i * 0.7) * 2.5;
            const endX = topX + Math.cos(angle) * frondLen + fs;
            const endY = topY + Math.sin(angle) * frondLen * 0.5 + 8;

            ctx.strokeStyle = '#27521e';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(topX, topY);
            ctx.quadraticCurveTo(topX + Math.cos(angle) * frondLen * 0.5 + fs * 0.3, topY + Math.sin(angle) * frondLen * 0.25 + 4, endX, endY);
            ctx.stroke();

            ctx.strokeStyle = '#3d742e';
            ctx.lineWidth = 0.9;
            for (let j = 2; j < 8; j++) {
                const lt = j / 8;
                const lx = lerp(topX, endX, lt);
                const ly = lerp(topY, endY, lt);
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(lx + Math.cos(angle + 0.6) * 8, ly + Math.sin(angle + 0.6) * 6);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    _drawGrandBananaPlant(ctx, tree, sway) {
        const { x, y, h } = tree;
        ctx.save();

        ctx.fillStyle = '#5c8038';
        ctx.fillRect(x - 6, y - h * 0.45, 12, h * 0.45);

        const leafCount = 7;
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            const leafLen = h * 0.88;
            const leafSway = sway * 0.7 + Math.sin(this.time * 1.4 + i * 1.2) * 3.5;

            const endX = x + Math.cos(angle) * leafLen + leafSway;
            const endY = y - h * 0.5 + Math.sin(angle) * leafLen * 0.38 + 12;

            ctx.fillStyle = `rgb(${55 + i * 6}, ${125 + i * 8}, ${38 + i * 4})`;
            ctx.beginPath();
            ctx.moveTo(x, y - h * 0.5);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * leafLen * 0.5 + leafSway * 0.4,
                y - h * 0.5 + Math.sin(angle) * leafLen * 0.18 - 8,
                endX, endY
            );
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * leafLen * 0.5 + leafSway * 0.4 + Math.sin(angle) * 12,
                y - h * 0.5 + Math.sin(angle) * leafLen * 0.18 + 12,
                x, y - h * 0.5
            );
            ctx.fill();

            ctx.strokeStyle = 'rgba(35, 75, 20, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x, y - h * 0.5);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * leafLen * 0.5 + leafSway * 0.4,
                y - h * 0.5 + Math.sin(angle) * leafLen * 0.18,
                endX, endY
            );
            ctx.stroke();
        }

        ctx.fillStyle = '#6a2444';
        ctx.beginPath();
        ctx.ellipse(x + 8, y - h * 0.35, 4.5, 9, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawGrandBambooCluster(ctx, tree, sway) {
        const { x, y, h } = tree;
        const stemCount = 9;
        ctx.save();

        for (let i = 0; i < stemCount; i++) {
            const sx = x + (i - stemCount / 2) * 8;
            const stemH = h * (0.78 + Math.abs(noise1D(i * 19)) * 0.32);
            const stemSway = sway * (0.85 + i * 0.12) + Math.sin(this.time * 0.95 + i * 0.5) * 4;
            const topX = sx + stemSway;
            const topY = y - stemH;

            ctx.strokeStyle = `rgb(${72 + i * 5}, ${115 + i * 8}, ${50 + i * 4})`;
            ctx.lineWidth = 3.8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(sx, y);
            ctx.quadraticCurveTo(sx + stemSway * 0.32, y - stemH * 0.5, topX, topY);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(45, 75, 30, 0.6)';
            ctx.lineWidth = 4.8;
            for (let n = 2; n < 9; n++) {
                const t = n / 9;
                const nx = lerp(sx, topX, t);
                const ny = lerp(y, topY, t);
                ctx.beginPath();
                ctx.moveTo(nx - 3, ny);
                ctx.lineTo(nx + 3, ny);
                ctx.stroke();
            }

            ctx.fillStyle = `rgba(${48 + i * 4}, ${95 + i * 7}, ${32 + i * 3}, 0.85)`;
            for (let l = 0; l < 7; l++) {
                const lt = 0.25 + l * 0.11;
                const lx = lerp(sx, topX, lt);
                const ly = lerp(y, topY, lt);
                const la = Math.sin(this.time * 1.0 + l + i) * 0.4;
                ctx.save();
                ctx.translate(lx, ly);
                ctx.rotate(la + (i % 2 === 0 ? 0.6 : -0.6));
                ctx.beginPath();
                ctx.ellipse(0, 0, 11, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        ctx.restore();
    }

    _drawGrandMangoTree(ctx, tree, sway) {
        const { x, y, h, w } = tree;
        ctx.save();

        ctx.fillStyle = '#4c3520';
        ctx.beginPath();
        ctx.moveTo(x - 14, y);
        ctx.quadraticCurveTo(x - 8, y - h * 0.45, x - 10, y - h * 0.6);
        ctx.lineTo(x + 10, y - h * 0.6);
        ctx.quadraticCurveTo(x + 8, y - h * 0.45, x + 14, y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#4c3520';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y - h * 0.55);
        ctx.quadraticCurveTo(x - w * 0.25 + sway * 0.3, y - h * 0.72, x - w * 0.38, y - h * 0.85);
        ctx.moveTo(x, y - h * 0.58);
        ctx.quadraticCurveTo(x + w * 0.25 + sway * 0.3, y - h * 0.70, x + w * 0.36, y - h * 0.82);
        ctx.stroke();

        const cy = y - h * 0.82;
        const lobes = [
            { ox: 0,        oy: 0,        r: h * 0.45, color: '#254b1f' },
            { ox: -w * 0.25, oy: h * 0.08, r: h * 0.38, color: '#1e421a' },
            { ox: w * 0.25,  oy: h * 0.08, r: h * 0.38, color: '#2a5323' },
            { ox: -w * 0.15, oy: -h * 0.18, r: h * 0.35, color: '#315e29' },
            { ox: w * 0.15,  oy: -h * 0.18, r: h * 0.35, color: '#386a2f' },
            { ox: 0,        oy: -h * 0.25, r: h * 0.30, color: '#457c39' },
        ];

        for (const l of lobes) {
            ctx.fillStyle = l.color;
            ctx.beginPath();
            ctx.arc(x + l.ox + sway * 0.25, cy + l.oy, l.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(75, 135, 55, 0.25)';
            for (let k = 0; k < 6; k++) {
                const kx = x + l.ox + sway * 0.25 + Math.cos(k) * (l.r * 0.5);
                const ky = cy + l.oy + Math.sin(k) * (l.r * 0.5);
                ctx.beginPath();
                ctx.arc(kx, ky, l.r * 0.35, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    _drawFootbridge(ctx) {
        const bx = 980;
        const by = WORLD.NEAR_BANK_TOP + 12;
        const bw = 65;
        const bh = 14;

        ctx.save();
        ctx.strokeStyle = '#5a492e';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(bx + 4, by + bh + 18);
        ctx.lineTo(bx + 8, by);
        ctx.moveTo(bx + bw - 4, by + bh + 18);
        ctx.lineTo(bx + bw - 8, by);
        ctx.stroke();

        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(bx, by, bw, bh);

        ctx.strokeStyle = '#8c734b';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(bx, by - 14);
        ctx.lineTo(bx + bw, by - 14);
        ctx.stroke();
        for (let px = bx + 6; px <= bx + bw; px += 14) {
            ctx.beginPath();
            ctx.moveTo(px, by);
            ctx.lineTo(px, by - 14);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────────
    // VILLAGERS WARMING THEMSELVES AROUND A WOOD FIRE (আগুন পোহানো)
    // ─────────────────────────────────────────────────────────────────
    _drawVillagersWarmingByFire(ctx) {
        const { x: fx, y: fy } = WORLD.FIRE_GATHERING; // x=460, y=680
        ctx.save();

        // 1. Warm radial firelight glow cast on ground and surroundings
        const flicker = Math.sin(this.time * 9) * 2.5 + Math.sin(this.time * 16) * 1.5;
        const glowRadius = 55 + flicker;
        const fireGlow = ctx.createRadialGradient(fx, fy - 5, 4, fx, fy - 5, glowRadius);
        fireGlow.addColorStop(0, 'rgba(255, 145, 40, 0.30)');
        fireGlow.addColorStop(0.4, 'rgba(255, 110, 25, 0.16)');
        fireGlow.addColorStop(0.75, 'rgba(255, 80, 15, 0.06)');
        fireGlow.addColorStop(1, 'rgba(255, 60, 10, 0)');
        ctx.fillStyle = fireGlow;
        ctx.beginPath();
        ctx.arc(fx, fy - 5, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Ground ash & charred earth ring
        ctx.fillStyle = 'rgba(38, 28, 20, 0.35)';
        ctx.beginPath();
        ctx.ellipse(fx, fy + 2, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Firewood logs (ছোট ছোট শুকনো ডালপালা ও লাকড়ি)
        ctx.strokeStyle = '#3e2715';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fx - 12, fy + 3);
        ctx.lineTo(fx + 10, fy - 2);
        ctx.moveTo(fx + 11, fy + 4);
        ctx.lineTo(fx - 9, fy - 1);
        ctx.moveTo(fx - 4, fy + 5);
        ctx.lineTo(fx + 3, fy - 4);
        ctx.stroke();

        // 3. Glowing embers bed (জ্বলন্ত কয়লা ও অঙ্গার)
        ctx.fillStyle = '#ff3b00';
        ctx.beginPath();
        ctx.ellipse(fx, fy, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.ellipse(fx, fy - 1, 5, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. Animated dancing flame tongues (আগুনের শিখা)
        const f1 = Math.sin(this.time * 12) * 2;
        const f2 = Math.cos(this.time * 15) * 2.5;
        const f3 = Math.sin(this.time * 19 + 1) * 1.8;

        // Outer orange flame
        ctx.fillStyle = '#ff5d00';
        ctx.beginPath();
        ctx.moveTo(fx - 7, fy);
        ctx.quadraticCurveTo(fx - 4 + f1, fy - 12 + f2, fx - 1, fy - 18 + f1);
        ctx.quadraticCurveTo(fx + 3 + f2, fy - 10 + f3, fx + 7, fy);
        ctx.closePath();
        ctx.fill();

        // Inner bright yellow flame
        ctx.fillStyle = '#ffd13b';
        ctx.beginPath();
        ctx.moveTo(fx - 4, fy);
        ctx.quadraticCurveTo(fx - 2 + f3, fy - 9 + f1, fx, fy - 14 + f2);
        ctx.quadraticCurveTo(fx + 2 + f1, fy - 7 + f3, fx + 4, fy);
        ctx.closePath();
        ctx.fill();

        // White core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(fx - 2, fy);
        ctx.lineTo(fx, fy - 6 + f1 * 0.5);
        ctx.lineTo(fx + 2, fy);
        ctx.closePath();
        ctx.fill();

        // 5. Rising winter smoke wisps (শীতের সকালে হালকা ধোঁয়া)
        ctx.strokeStyle = 'rgba(225, 230, 238, 0.22)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(fx, fy - 15);
        ctx.quadraticCurveTo(fx + 6 + f1 * 2, fy - 35, fx - 3 + f2 * 3, fy - 55);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(220, 226, 235, 0.15)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(fx + 3, fy - 12);
        ctx.quadraticCurveTo(fx - 5 + f2 * 2, fy - 30, fx + 4 + f1 * 3, fy - 48);
        ctx.stroke();

        // ── VILLAGER 1 (Left): Sitting on a cane mora, leaning forward, hands to fire ──
        ctx.save();
        const v1x = fx - 30;
        const v1y = fy + 4;
        ctx.translate(v1x, v1y);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        drawEllipse(ctx, 0, 2, 11, 4);
        ctx.fill();

        // Cane mora / stool (মোড়া)
        ctx.fillStyle = '#9b7e51';
        ctx.fillRect(-6, -10, 12, 10);
        ctx.strokeStyle = '#614828';
        ctx.lineWidth = 1.0;
        ctx.strokeRect(-6, -10, 12, 10);

        ctx.fillStyle = '#3a4b60';
        ctx.fillRect(-5, -12, 10, 8);

        // Torso wrapped in emerald green shawl (শাল)
        ctx.fillStyle = '#26573c';
        ctx.beginPath();
        ctx.moveTo(-7, -26);
        ctx.lineTo(6, -26);
        ctx.lineTo(8, -10);
        ctx.lineTo(-8, -10);
        ctx.closePath();
        ctx.fill();

        // Leaning arms stretching hands forward to the fire
        ctx.strokeStyle = '#26573c';
        ctx.lineWidth = 4.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-1, -22);
        ctx.quadraticCurveTo(7, -19, 14, -14);
        ctx.stroke();

        // Hands (উষ্ণতার ছোঁয়া নেওয়া হাত)
        ctx.fillStyle = '#b8855a';
        ctx.beginPath();
        ctx.arc(15, -14, 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(0, -31, 5.8, 0, Math.PI * 2);
        ctx.fillStyle = '#b8855a';
        ctx.fill();

        // Head scarf / muffler (মাফলার জড়ানো মাথা)
        ctx.beginPath();
        ctx.arc(0, -32, 6.2, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fillStyle = '#7a3224';
        ctx.fill();

        // Firelight glow on face and hands
        ctx.fillStyle = 'rgba(255, 170, 60, 0.35)';
        ctx.beginPath();
        ctx.arc(2, -31, 3.5, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.fill();
        ctx.restore();

        // ── VILLAGER 2 (Center Back): Squatting deep (উবু হয়ে বসা), wrapped in wool chadar ──
        ctx.save();
        const v2x = fx - 2;
        const v2y = fy - 18;
        ctx.translate(v2x, v2y);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
        drawEllipse(ctx, 0, 2, 10, 3.5);
        ctx.fill();

        // Squatting body completely enveloped in brown woolen blanket/chadar (চাদর মুড়ি দেওয়া)
        ctx.fillStyle = '#6b5138';
        ctx.beginPath();
        ctx.ellipse(0, -11, 10, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#5a422b';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-4, -10);
        ctx.lineTo(0, -2);
        ctx.moveTo(4, -10);
        ctx.lineTo(0, -2);
        ctx.stroke();

        ctx.fillStyle = '#b8855a';
        drawEllipse(ctx, 0, -2, 3.2, 1.8);
        ctx.fill();

        // Head with classic winter monkey cap (কানটুপি)
        ctx.beginPath();
        ctx.arc(0, -25, 5.6, 0, Math.PI * 2);
        ctx.fillStyle = '#b8855a';
        ctx.fill();

        ctx.fillStyle = '#2b394d';
        ctx.beginPath();
        ctx.arc(0, -26, 6.2, Math.PI * 0.85, Math.PI * 2.15);
        ctx.lineTo(3, -20);
        ctx.lineTo(-3, -20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 175, 60, 0.40)';
        ctx.beginPath();
        ctx.arc(0, -22, 3.2, 0, Math.PI);
        ctx.fill();
        ctx.restore();

        // ── VILLAGER 3 (Right): Sitting on low wooden pirhi, warming hands ──
        ctx.save();
        const v3x = fx + 28;
        const v3y = fy + 3;
        ctx.translate(v3x, v3y);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        drawEllipse(ctx, 0, 2, 11, 4);
        ctx.fill();

        // Low wooden stool / পিঁড়ি
        ctx.fillStyle = '#7a5a36';
        ctx.fillRect(-6, -7, 12, 6);

        ctx.fillStyle = '#42372d';
        ctx.fillRect(-5, -11, 10, 7);

        // Maroon winter sweater & shawl
        ctx.fillStyle = '#782635';
        ctx.beginPath();
        ctx.moveTo(-6, -25);
        ctx.lineTo(6, -25);
        ctx.lineTo(7, -9);
        ctx.lineTo(-7, -9);
        ctx.closePath();
        ctx.fill();

        // Yellow-gold scarf around neck
        ctx.fillStyle = '#d19e34';
        drawRoundedRect(ctx, -6, -26, 12, 4.5, 1.5);
        ctx.fill();

        ctx.strokeStyle = '#782635';
        ctx.lineWidth = 4.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -21);
        ctx.quadraticCurveTo(-6, -18, -13, -14);
        ctx.stroke();

        ctx.fillStyle = '#b8855a';
        ctx.beginPath();
        ctx.arc(-14, -14, 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, -30, 5.6, 0, Math.PI * 2);
        ctx.fillStyle = '#b8855a';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, -31.5, 6.0, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fillStyle = '#324036';
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 170, 60, 0.35)';
        ctx.beginPath();
        ctx.arc(-2, -30, 3.5, Math.PI * 0.6, Math.PI * 1.4);
        ctx.fill();
        ctx.restore();

        // ── VILLAGER 4 (Front Right / Side): Cross-legged in cream/grey blanket ──
        ctx.save();
        const v4x = fx + 16;
        const v4y = fy + 16;
        ctx.translate(v4x, v4y);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
        drawEllipse(ctx, 0, 2, 11, 4.5);
        ctx.fill();

        ctx.fillStyle = '#8f887b';
        ctx.beginPath();
        ctx.ellipse(0, -10, 10, 11, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#8f887b';
        ctx.lineWidth = 3.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(1, -12);
        ctx.lineTo(-7, -13);
        ctx.stroke();

        ctx.fillStyle = '#b8855a';
        ctx.beginPath();
        ctx.arc(-8, -13, 2.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(3, -22, 5.4, 0, Math.PI * 2);
        ctx.fillStyle = '#b8855a';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(3, -23.5, 5.8, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fillStyle = '#5c4632';
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 160, 50, 0.32)';
        ctx.beginPath();
        ctx.arc(-1, -14, 5.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    _drawLoneVillagers(ctx) {
        for (const v of this.loneVillagers) {
            this._drawSingleLoneVillager(ctx, v);
        }
    }

    _drawSingleLoneVillager(ctx, v) {
        const s = 0.68;
        ctx.save();
        ctx.translate(v.x, v.y);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        drawEllipse(ctx, 0, 2, 7, 2.5);
        ctx.fill();

        if (v.type === 'sweeping') {
            const sweep = Math.sin(v.phase * 2) * 0.22;
            ctx.fillStyle = '#a64253';
            ctx.fillRect(-5 * s, -28 * s, 10 * s, 21 * s);

            ctx.beginPath();
            ctx.arc(0, -31 * s, 5.5 * s, 0, Math.PI * 2);
            ctx.fillStyle = '#b8855a';
            ctx.fill();
            ctx.fillStyle = '#a64253';
            ctx.beginPath();
            ctx.arc(0, -32 * s, 6.2 * s, Math.PI, 0);
            ctx.fill();

            ctx.save();
            ctx.rotate(sweep);
            ctx.strokeStyle = '#94703a';
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.moveTo(5 * s, -22 * s);
            ctx.lineTo(14 * s, 2);
            ctx.stroke();
            ctx.restore();
        } else {
            // Walking with shawl wrapped around shoulders
            ctx.fillStyle = '#5c4836';
            ctx.fillRect(-6 * s, -30 * s, 12 * s, 22 * s);
            ctx.fillStyle = '#3a4e63';
            ctx.fillRect(-5 * s, -8 * s, 10 * s, 9 * s);

            ctx.beginPath();
            ctx.arc(0, -34 * s, 5.4 * s, 0, Math.PI * 2);
            ctx.fillStyle = '#b8855a';
            ctx.fill();
        }

        ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. FOREGROUND: Natural Field of Dew-Covered Grass & Bamboo Frame
    // ─────────────────────────────────────────────────────────────────
    drawForeground(ctx) {
        this._drawForegroundGroundBed(ctx);
        this._drawDewCoveredGrass(ctx);
        this._drawWildFlowers(ctx);
        this._drawFallenLeaves(ctx);
        this._drawForegroundBamboo(ctx);
    }

    _drawForegroundGroundBed(ctx) {
        // Natural uneven soil ground bed with visible open earth patches
        ctx.save();
        const top = WORLD.FOREGROUND_TOP;
        const h = WORLD.HEIGHT - top;

        // Rich earthen soil gradient
        const soilGrad = ctx.createLinearGradient(0, top, 0, WORLD.HEIGHT);
        soilGrad.addColorStop(0, '#4d3a24');
        soilGrad.addColorStop(0.3, '#3e2e1c');
        soilGrad.addColorStop(0.7, '#322416');
        soilGrad.addColorStop(1, '#251b10');
        ctx.fillStyle = soilGrad;
        ctx.fillRect(0, top, WORLD.WIDTH, h);

        // Open visible soil patches with gentle contours
        for (const sp of this.soilPatches) {
            ctx.fillStyle = sp.color;
            ctx.beginPath();
            ctx.ellipse(sp.x, sp.y, sp.rx, sp.ry, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Subtle morning sunlight rim along natural soil undulations
        ctx.strokeStyle = 'rgba(235, 210, 160, 0.12)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 0; x <= WORLD.WIDTH; x += 30) {
            const yOff = top + 8 + Math.sin(x * 0.02) * 5 + Math.sin(x * 0.05) * 3;
            if (x === 0) ctx.moveTo(x, yOff);
            else ctx.lineTo(x, yOff);
        }
        ctx.stroke();

        ctx.restore();
    }

    _drawDewCoveredGrass(ctx) {
        // Delicate, organic grass clumps with natural varying heights, angles, and glistening dew droplets
        ctx.save();
        ctx.lineCap = 'round';

        const breeze = Math.sin(this.time * 1.2) * 3.2;

        for (const tuft of this.grassTufts) {
            for (const b of tuft.blades) {
                // Individual organic blade sway in the winter breeze
                const bladeSway = Math.sin(this.time * b.swaySpeed + b.swayPhase) * 2.8 + breeze * 0.7;
                const tipX = tuft.cx + Math.sin(b.lean) * b.h + bladeSway + b.curve * b.h;
                const tipY = tuft.cy - Math.cos(b.lean) * b.h;

                // Control point for smooth natural curvature
                const cpX = tuft.cx + (tipX - tuft.cx) * 0.45 + b.curve * 12;
                const cpY = tuft.cy - b.h * 0.55;

                // Grass blade
                ctx.strokeStyle = b.color;
                ctx.lineWidth = b.w;
                ctx.beginPath();
                ctx.moveTo(tuft.cx, tuft.cy);
                ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
                ctx.stroke();

                // ── Delicate Dew Droplet (শিশিরবিন্দু) on Grass Blade ──
                if (b.hasDew) {
                    // Position along blade curve
                    const t = b.dewPos;
                    const mt = 1 - t;
                    // Quadratic bezier point
                    const dropX = mt * mt * tuft.cx + 2 * mt * t * cpX + t * t * tipX;
                    const dropY = mt * mt * tuft.cy + 2 * mt * t * cpY + t * t * tipY;

                    // Subtle, occasional morning shimmer highlight on the droplet
                    const shimmer = (Math.sin(this.time * 3.5 + b.dewShimmerPhase) + 1) / 2;
                    const alpha = 0.55 + shimmer * 0.40;

                    // Outer soft cool-white meniscus droplet
                    ctx.fillStyle = `rgba(235, 245, 255, ${alpha * 0.85})`;
                    ctx.beginPath();
                    ctx.arc(dropX, dropY, b.dewSize, 0, Math.PI * 2);
                    ctx.fill();

                    // Tiny pale golden-white sun reflection highlight on top-right of droplet
                    ctx.fillStyle = `rgba(255, 252, 235, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(dropX + b.dewSize * 0.35, dropY - b.dewSize * 0.35, b.dewSize * 0.45, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        ctx.restore();
    }

    _drawWildFlowers(ctx) {
        ctx.save();
        for (const wf of this.wildFlowers) {
            const sway = Math.sin(this.time * 1.3 + wf.swayPhase) * 2.0;

            // Thin delicate stem
            ctx.strokeStyle = '#4a5e35';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(wf.x, wf.y);
            ctx.quadraticCurveTo(wf.x + sway * 0.5, wf.y - wf.stemH * 0.5, wf.x + sway, wf.y - wf.stemH);
            ctx.stroke();

            // Tiny blossom petals
            ctx.fillStyle = wf.color;
            ctx.beginPath();
            ctx.arc(wf.x + sway, wf.y - wf.stemH, wf.r, 0, Math.PI * 2);
            ctx.fill();

            // Flower center
            ctx.fillStyle = 'rgba(255, 245, 200, 0.7)';
            ctx.beginPath();
            ctx.arc(wf.x + sway, wf.y - wf.stemH, wf.r * 0.45, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    _drawFallenLeaves(ctx) {
        for (const leaf of this.fallenLeaves) {
            ctx.save();
            ctx.translate(leaf.x, leaf.y);
            ctx.rotate(leaf.angle);
            ctx.fillStyle = leaf.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leaf.size * 0.5, -leaf.size * 0.6, leaf.size, 0);
            ctx.quadraticCurveTo(leaf.size * 0.5, leaf.size * 0.4, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }

    _drawForegroundBamboo(ctx) {
        const sway = Math.sin(this.time * 0.65) * 4.8;
        const stemCount = 12;

        ctx.save();
        for (let i = 0; i < stemCount; i++) {
            const sx = -20 + i * 14;
            const stemH = 340 + Math.abs(noise1D(i * 27)) * 80;
            const stemSway = sway * (0.8 + i * 0.08) + Math.sin(this.time * 0.75 + i * 0.45) * 5.2;
            const topX = sx + stemSway;
            const topY = 960 - stemH;

            ctx.strokeStyle = `rgb(${50 + i * 4}, ${88 + i * 6}, ${36 + i * 3})`;
            ctx.lineWidth = 5.5;
            ctx.beginPath();
            ctx.moveTo(sx, 960);
            ctx.quadraticCurveTo(sx + stemSway * 0.32, 960 - stemH * 0.5, topX, topY);
            ctx.stroke();

            // Bamboo nodes
            ctx.strokeStyle = 'rgba(35, 62, 25, 0.6)';
            ctx.lineWidth = 7;
            for (let n = 2; n < 12; n++) {
                const t = n / 12;
                const nx = lerp(sx, topX, t);
                const ny = lerp(960, topY, t);
                ctx.beginPath();
                ctx.moveTo(nx - 4, ny);
                ctx.lineTo(nx + 4, ny);
                ctx.stroke();
            }

            // Drooping bamboo leaves
            ctx.fillStyle = `rgba(${42 + i * 3}, ${84 + i * 5}, ${28 + i * 2}, 0.82)`;
            for (let l = 0; l < 8; l++) {
                const lt = 0.2 + l * 0.1;
                const lx = lerp(sx, topX, lt);
                const ly = lerp(960, topY, lt);
                const la = Math.sin(this.time * 0.8 + l + i) * 0.35;
                ctx.save();
                ctx.translate(lx, ly);
                ctx.rotate(la + (i % 2 === 0 ? 0.5 : -0.5));
                ctx.beginPath();
                ctx.ellipse(0, 0, 14, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. ATMOSPHERE: Thin, Soft, Subtle Horizontal Mist (NO circular blobs!)
    // ─────────────────────────────────────────────────────────────────
    drawAtmosphere(ctx) {
        this._drawSubtleMist(ctx);
    }

    _drawSubtleMist(ctx) {
        // Thin, delicate, horizontal winter morning mist layers (low opacity, soft linear gradients)
        ctx.save();

        for (let i = 0; i < WORLD.FOG_LAYERS.length; i++) {
            const layer = WORLD.FOG_LAYERS[i];
            const offset = (this.fogOffsets[i] * 1.2) % (WORLD.WIDTH * 2);

            ctx.globalAlpha = layer.opacity;

            // Pure horizontal linear gradient band
            const fogGrad = ctx.createLinearGradient(0, layer.y, 0, layer.y + layer.h);
            fogGrad.addColorStop(0, 'rgba(235, 240, 246, 0)');
            fogGrad.addColorStop(0.35, 'rgba(238, 243, 248, 0.7)');
            fogGrad.addColorStop(0.65, 'rgba(238, 243, 248, 0.65)');
            fogGrad.addColorStop(1, 'rgba(235, 240, 246, 0)');
            ctx.fillStyle = fogGrad;

            // Horizontal slow drift
            const shift = Math.sin(offset * 0.006 + i) * 35;
            ctx.fillRect(-150 + shift, layer.y, WORLD.WIDTH + 300, layer.h);
        }

        ctx.restore();
    }
}
