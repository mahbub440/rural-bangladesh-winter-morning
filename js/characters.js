/**
 * characters.js — Schoolchildren, cyclist, and walking animation
 * Enhancements:
 * - Schoolchildren made 30–35% larger with rich facial features and clear winter uniform details
 * - White shirt collars peeking from colorful winter sweaters
 * - Detailed schoolbags with flaps, buckles, and natural bouncing motion
 * - Girls with neat braids & hair ribbons; boys with warm mufflers
 * - Solid ground-anchored walking cycle (no sliding or floating)
 * - Clear perspective scaling: nearer children appear larger, children near school smaller
 */

import { lerp, clamp, oscillate, getPointOnPath, mapRange } from './animation.js';
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

function calculatePathLength(path) {
    let total = 0;
    for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;
        total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
}

// ═══════════════════════════════════════════════════════════════════════
// DETAILED HAND-DRAWN 2D SCHOOLCHILD (30-35% LARGER & RICHLY DETAILED)
// ═══════════════════════════════════════════════════════════════════════

function drawChild(ctx, x, y, config, walkPhase) {
    const s = config.scale;
    // Total height increased ~35% (62 * s vs 46 * s previously)
    const totalH = 62 * s;
    const legSwing = Math.sin(walkPhase) * 0.42;
    const armSwing = Math.sin(walkPhase) * 0.38;
    const bodyBob = Math.abs(Math.sin(walkPhase)) * 2.2 * s;
    const headTilt = Math.sin(walkPhase * 2) * 0.04;

    ctx.save();
    if (config.opacity !== undefined) {
        ctx.globalAlpha = config.opacity;
    }
    ctx.translate(x, y - bodyBob);

    // ── Ground shadow at feet ──
    ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
    ctx.beginPath();
    ctx.ellipse(0, 2.5 * s, 14 * s, 4.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── LEGS & SHOES ──
    const legLen = totalH * 0.33;
    const hipY = -totalH * 0.33;
    const legW = 4.8 * s;
    const skinColor = config.skinColor || '#c4956a';

    // Left leg (back stride)
    ctx.save();
    ctx.translate(-4.2 * s, hipY);
    ctx.rotate(legSwing);
    // Pants / Skirt unders
    ctx.fillStyle = config.pantColor || config.skirtColor || '#283852';
    drawRoundedRect(ctx, -legW / 2, 0, legW, legLen * 0.70, 1.5 * s);
    ctx.fill();
    // Socks / skin
    ctx.fillStyle = config.gender === 'girl' ? '#e2dfd8' : skinColor;
    ctx.fillRect(-legW / 2, legLen * 0.70, legW, legLen * 0.18);
    // School Shoe (কালো বাটা কেডস)
    ctx.fillStyle = '#18120d';
    drawRoundedRect(ctx, -legW / 2 - 1.2 * s, legLen * 0.88, legW + 4.2 * s, legLen * 0.14, 2 * s);
    ctx.fill();
    // Shoe sole
    ctx.fillStyle = '#3a2e24';
    ctx.fillRect(-legW / 2 - 1.2 * s, legLen * 0.98, legW + 4.2 * s, 1.5 * s);
    ctx.restore();

    // Right leg (front stride)
    ctx.save();
    ctx.translate(4.2 * s, hipY);
    ctx.rotate(-legSwing);
    ctx.fillStyle = config.pantColor || config.skirtColor || '#283852';
    drawRoundedRect(ctx, -legW / 2, 0, legW, legLen * 0.70, 1.5 * s);
    ctx.fill();
    ctx.fillStyle = config.gender === 'girl' ? '#e2dfd8' : skinColor;
    ctx.fillRect(-legW / 2, legLen * 0.70, legW, legLen * 0.18);
    ctx.fillStyle = '#18120d';
    drawRoundedRect(ctx, -legW / 2 - 1.2 * s, legLen * 0.88, legW + 4.2 * s, legLen * 0.14, 2 * s);
    ctx.fill();
    ctx.fillStyle = '#3a2e24';
    ctx.fillRect(-legW / 2 - 1.2 * s, legLen * 0.98, legW + 4.2 * s, 1.5 * s);
    ctx.restore();

    // ── SKIRT (for schoolgirls) ──
    if (config.gender === 'girl' && config.skirtColor) {
        const skirtTop = hipY - 2.5 * s;
        ctx.fillStyle = config.skirtColor;
        ctx.beginPath();
        ctx.moveTo(-8.0 * s, skirtTop);
        ctx.lineTo(-11.5 * s, skirtTop + legLen * 0.58);
        ctx.lineTo(11.5 * s, skirtTop + legLen * 0.58);
        ctx.lineTo(8.0 * s, skirtTop);
        ctx.closePath();
        ctx.fill();

        // Skirt pleat lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.moveTo(-4.0 * s, skirtTop);
        ctx.lineTo(-5.5 * s, skirtTop + legLen * 0.58);
        ctx.moveTo(0, skirtTop);
        ctx.lineTo(0, skirtTop + legLen * 0.58);
        ctx.moveTo(4.0 * s, skirtTop);
        ctx.lineTo(5.5 * s, skirtTop + legLen * 0.58);
        ctx.stroke();
    }

    // ── TORSO & WINTER SWEATER ──
    const torsoTop = -totalH * 0.68;
    const torsoH = totalH * 0.37;
    const torsoW = 18 * s;

    // Sweater body
    ctx.fillStyle = config.shirtColor;
    drawRoundedRect(ctx, -torsoW / 2, torsoTop, torsoW, torsoH, 3.5 * s);
    ctx.fill();

    // Knitted sweater texture lines (উলের সোয়েটার)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)';
    ctx.lineWidth = 0.8 * s;
    for (let yy = torsoTop + 6 * s; yy < torsoTop + torsoH - 2 * s; yy += 5 * s) {
        ctx.beginPath();
        ctx.moveTo(-torsoW / 2 + 2 * s, yy);
        ctx.lineTo(torsoW / 2 - 2 * s, yy);
        ctx.stroke();
    }

    // White school uniform shirt collar peeking above sweater
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-5 * s, torsoTop);
    ctx.lineTo(-2 * s, torsoTop + 4 * s);
    ctx.lineTo(0, torsoTop + 2 * s);
    ctx.lineTo(2 * s, torsoTop + 4 * s);
    ctx.lineTo(5 * s, torsoTop);
    ctx.closePath();
    ctx.fill();

    // ── SCHOOLBAG ON BACK (বইখাতার ব্যাগ) ──
    if (config.bagColor) {
        const bagBounce = Math.abs(Math.sin(walkPhase + 0.5)) * 1.6 * s;
        const bagW = 10 * s;
        const bagH = torsoH * 0.75;
        const bagX = -torsoW / 2 - bagW + 3 * s;
        const bagY = torsoTop + 5 * s + bagBounce;

        ctx.fillStyle = config.bagColor;
        drawRoundedRect(ctx, bagX, bagY, bagW, bagH, 2.5 * s);
        ctx.fill();

        // Flap & buckle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        drawRoundedRect(ctx, bagX, bagY, bagW, bagH * 0.38, 2 * s);
        ctx.fill();
        ctx.fillStyle = '#ffd700'; // brass buckle
        ctx.fillRect(bagX + bagW / 2 - 1.5 * s, bagY + bagH * 0.32, 3 * s, 2 * s);

        // Shoulder strap
        ctx.strokeStyle = config.bagColor;
        ctx.lineWidth = 2.2 * s;
        ctx.beginPath();
        ctx.moveTo(bagX + bagW, bagY + 2 * s);
        ctx.quadraticCurveTo(-torsoW / 2 + 4 * s, torsoTop + 2 * s, -2 * s, torsoTop + 4 * s);
        ctx.stroke();
    }

    // ── ARMS & HANDS ──
    const shoulderY = torsoTop + 6 * s;
    const armLen = totalH * 0.28;
    const armW = 4.2 * s;

    // Back arm (swinging)
    ctx.save();
    ctx.translate(-torsoW / 2 - 0.8 * s, shoulderY);
    ctx.rotate(-armSwing * 0.9);
    ctx.fillStyle = config.shirtColor;
    drawRoundedRect(ctx, -armW / 2, 0, armW, armLen * 0.60, 1.5 * s);
    ctx.fill();
    ctx.fillStyle = skinColor;
    drawRoundedRect(ctx, -armW / 2, armLen * 0.60, armW, armLen * 0.40, 1.5 * s);
    ctx.fill();
    ctx.restore();

    // Front arm (swinging opposite)
    ctx.save();
    ctx.translate(torsoW / 2 + 0.8 * s, shoulderY);
    ctx.rotate(armSwing * 0.9);
    ctx.fillStyle = config.shirtColor;
    drawRoundedRect(ctx, -armW / 2, 0, armW, armLen * 0.60, 1.5 * s);
    ctx.fill();
    ctx.fillStyle = skinColor;
    drawRoundedRect(ctx, -armW / 2, armLen * 0.60, armW, armLen * 0.40, 1.5 * s);
    ctx.fill();
    ctx.restore();

    // ── WINTER SCARF / MUFFLER (শীতের মাফলার) ──
    if (config.scarfColor) {
        ctx.fillStyle = config.scarfColor;
        drawRoundedRect(ctx, -10 * s, torsoTop - 2.5 * s, 20 * s, 7 * s, 2.5 * s);
        ctx.fill();

        // Trailing scarf end waving in the wind
        ctx.save();
        const tailSway = Math.sin(walkPhase * 0.8) * 3.5 * s;
        ctx.beginPath();
        ctx.moveTo(7.5 * s, torsoTop + 2 * s);
        ctx.quadraticCurveTo(10.5 * s + tailSway, torsoTop + 12 * s, 7.5 * s + tailSway * 0.6, torsoTop + 20 * s);
        ctx.lineWidth = 4.2 * s;
        ctx.strokeStyle = config.scarfColor;
        ctx.stroke();

        // Scarf fringe
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(6.5 * s + tailSway * 0.6, torsoTop + 20 * s);
        ctx.lineTo(8.5 * s + tailSway * 0.6, torsoTop + 23 * s);
        ctx.stroke();
        ctx.restore();
    }

    // ── HEAD & DETAILED FACIAL EXPRESSION ──
    const headR = 8.2 * s;
    const headY = torsoTop - headR + 1.2 * s;

    ctx.save();
    ctx.rotate(headTilt);

    // Face
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.fillStyle = skinColor;
    ctx.fill();

    // Ear
    ctx.beginPath();
    ctx.arc(-headR * 0.85, headY + 1 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = skinColor;
    ctx.fill();

    // Hair
    ctx.beginPath();
    ctx.arc(0, headY - 1.8 * s, headR + 0.8 * s, Math.PI * 1.1, Math.PI * 1.95);
    ctx.lineTo(headR * 0.9, headY - headR * 0.2);
    ctx.quadraticCurveTo(headR * 0.5, headY - headR * 1.2, -headR * 0.4, headY - headR * 1.0);
    ctx.fillStyle = '#100d0a';
    ctx.fill();

    // Eye looking forward (সকালের উচ্ছ্বসিত দৃষ্টি)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(4.0 * s, headY - 1.2 * s, 2.4 * s, 2.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#100d0a';
    ctx.beginPath();
    ctx.arc(4.6 * s, headY - 1.2 * s, 1.4 * s, 0, Math.PI * 2);
    ctx.fill();
    // Glistening catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(5.0 * s, headY - 1.6 * s, 0.65 * s, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrow
    ctx.strokeStyle = '#100d0a';
    ctx.lineWidth = 1.0 * s;
    ctx.beginPath();
    ctx.moveTo(2.2 * s, headY - 3.8 * s);
    ctx.lineTo(6.5 * s, headY - 3.8 * s);
    ctx.stroke();

    // Gentle happy smile (শিশুর মুখে মিষ্টি হাসি)
    ctx.strokeStyle = 'rgba(125, 45, 30, 0.75)';
    ctx.lineWidth = 1.0 * s;
    ctx.beginPath();
    ctx.arc(3.8 * s, headY + 2.8 * s, 2.8 * s, 0.15, Math.PI * 0.85);
    ctx.stroke();

    // Schoolgirl long braided hair & ribbon (বেনী ও ফিতা)
    if (config.gender === 'girl') {
        ctx.strokeStyle = '#100d0a';
        ctx.lineWidth = 4.2 * s;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-headR * 0.5, headY + headR * 0.6);
        ctx.quadraticCurveTo(-headR * 0.9, headY + headR * 1.9, -headR * 0.4, headY + headR * 3.0);
        ctx.stroke();

        if (config.ribbonColor) {
            ctx.fillStyle = config.ribbonColor;
            ctx.beginPath();
            ctx.arc(-headR * 0.4, headY + headR * 3.0, 2.4 * s, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════
// CYCLIST
// ═══════════════════════════════════════════════════════════════════════

function drawCyclist(ctx, x, y, scale, pedalPhase) {
    const s = scale;
    ctx.save();
    ctx.translate(x, y);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 3 * s, 24 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const wheelR = 13 * s;
    const wheelBase = 46 * s;

    // Bicycle wheels
    ctx.strokeStyle = '#282828';
    ctx.lineWidth = 2.0 * s;
    ctx.beginPath();
    ctx.arc(-wheelBase / 2, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wheelBase / 2, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    // Spokes
    ctx.lineWidth = 0.6 * s;
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.40)';
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + pedalPhase;
        ctx.beginPath();
        ctx.moveTo(-wheelBase / 2, 0);
        ctx.lineTo(-wheelBase / 2 + Math.cos(a) * wheelR, Math.sin(a) * wheelR);
        ctx.moveTo(wheelBase / 2, 0);
        ctx.lineTo(wheelBase / 2 + Math.cos(a) * wheelR, Math.sin(a) * wheelR);
        ctx.stroke();
    }

    // Cycle frame
    ctx.strokeStyle = '#183854';
    ctx.lineWidth = 2.6 * s;
    const seatX = -wheelBase * 0.15;
    const seatY = -wheelR * 2.1;
    const handleX = wheelBase * 0.36;
    const handleY = -wheelR * 2.3;

    ctx.beginPath();
    ctx.moveTo(-wheelBase / 2, 0);
    ctx.lineTo(seatX, seatY);
    ctx.lineTo(wheelBase / 2, 0);
    ctx.moveTo(seatX, seatY);
    ctx.lineTo(handleX, handleY);
    ctx.lineTo(wheelBase / 2, 0);
    ctx.moveTo(-wheelBase / 2, 0);
    ctx.lineTo(0, -wheelR * 0.5);
    ctx.lineTo(wheelBase / 2, 0);
    ctx.stroke();

    // Seat
    ctx.fillStyle = '#221508';
    ctx.fillRect(seatX - 5 * s, seatY - 2.5 * s, 10 * s, 3.5 * s);

    // Handlebars
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(handleX - 4 * s, handleY - 4 * s);
    ctx.lineTo(handleX + 4 * s, handleY - 1 * s);
    ctx.stroke();

    // Pedaling legs
    const skinColor = '#b8855a';
    const crankLen = 7.5 * s;
    const crankCenterX = -wheelBase * 0.05;
    const crankCenterY = -wheelR * 0.35;
    const pedalX1 = Math.cos(pedalPhase) * crankLen;
    const pedalY1 = Math.sin(pedalPhase) * crankLen * 0.5;
    const pedalX2 = Math.cos(pedalPhase + Math.PI) * crankLen;
    const pedalY2 = Math.sin(pedalPhase + Math.PI) * crankLen * 0.5;

    ctx.lineWidth = 4.0 * s;
    ctx.lineCap = 'round';

    // Left leg (lungi)
    const hipLX = seatX - 2 * s;
    const footLX = crankCenterX + pedalX1;
    const footLY = crankCenterY + pedalY1;
    ctx.strokeStyle = '#4e5a78';
    ctx.beginPath();
    ctx.moveTo(hipLX, seatY);
    ctx.quadraticCurveTo(hipLX + 5 * s, (seatY + footLY) / 2 - 4 * s, footLX, footLY);
    ctx.stroke();

    // Right leg
    const footRX = crankCenterX + pedalX2;
    const footRY = crankCenterY + pedalY2;
    ctx.beginPath();
    ctx.moveTo(hipLX + 4 * s, seatY);
    ctx.quadraticCurveTo(hipLX + 9 * s, (seatY + footRY) / 2 - 4 * s, footRX, footRY);
    ctx.stroke();

    // Rider Torso
    ctx.fillStyle = '#6e7a56';
    const bodyTop = seatY - 21 * s;
    drawRoundedRect(ctx, seatX - 6.5 * s, bodyTop, 13 * s, 21 * s, 2.5 * s);
    ctx.fill();

    // Arms
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = 3.0 * s;
    ctx.beginPath();
    ctx.moveTo(seatX + 4 * s, bodyTop + 5 * s);
    ctx.quadraticCurveTo(handleX - 6 * s, bodyTop + 3 * s, handleX, handleY - 2 * s);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(seatX, bodyTop - 6.5 * s, 6.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = skinColor;
    ctx.fill();

    // Monkey cap
    ctx.beginPath();
    ctx.arc(seatX, bodyTop - 8.0 * s, 6.8 * s, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fillStyle = '#8a342a';
    ctx.fill();

    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════
// CHARACTER MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════

export class CharacterManager {
    constructor() {
        this.schoolPathLength = calculatePathLength(WORLD.ROAD_PATH);
        this.mainRoadPathLength = calculatePathLength(WORLD.MAIN_ROAD_PATH);

        // 10 diverse, clearly recognizable Bangladeshi schoolchildren
        // Moderately increased base scales (1.00 - 1.12 vs 0.86 - 0.95 previously)
        this.children = [
            // Group 1 — leading group, walking along the road toward school courtyard
            {
                progress: 0.70, speed: 21, baseScale: 1.08,
                gender: 'boy', skinColor: '#c4956a',
                shirtColor: '#36537a', pantColor: '#323440',
                scarfColor: '#c22f2f', bagColor: '#455986',
                walkPhase: 0, ribbonColor: null,
            },
            {
                progress: 0.67, speed: 20, baseScale: 1.05,
                gender: 'girl', skinColor: '#d4a57a',
                shirtColor: '#7a2233', skirtColor: '#25264f',
                scarfColor: '#e29ab0', bagColor: '#357545',
                walkPhase: 1.2, ribbonColor: '#e03060',
            },
            {
                progress: 0.64, speed: 22, baseScale: 1.06,
                gender: 'boy', skinColor: '#b8855a',
                shirtColor: '#586b36', pantColor: '#453522',
                scarfColor: null, bagColor: '#656565',
                walkPhase: 2.5, ribbonColor: null,
            },

            // Group 2 — middle group walking and chatting
            {
                progress: 0.45, speed: 22, baseScale: 1.04,
                gender: 'girl', skinColor: '#c4956a',
                shirtColor: '#59366a', skirtColor: '#1a1844',
                scarfColor: '#d4c23d', bagColor: '#8a2b2b',
                walkPhase: 0.8, ribbonColor: '#d4c23d',
            },
            {
                progress: 0.42, speed: 23, baseScale: 1.06,
                gender: 'boy', skinColor: '#b88050',
                shirtColor: '#6e4825', pantColor: '#242424',
                scarfColor: '#d47c2b', bagColor: '#583e1c',
                walkPhase: 3.0, ribbonColor: null,
            },
            {
                progress: 0.39, speed: 21, baseScale: 1.02,
                gender: 'boy', skinColor: '#c4956a',
                shirtColor: '#1c2d52', pantColor: '#424242',
                scarfColor: null, bagColor: '#384d72',
                walkPhase: 1.7, ribbonColor: null,
            },

            // Group 3 — walking along the red dirt path
            {
                progress: 0.23, speed: 18, baseScale: 1.00,
                gender: 'girl', skinColor: '#d4a57a',
                shirtColor: '#275936', skirtColor: '#591d1d',
                scarfColor: '#e5e5e5', bagColor: '#be6ea2',
                walkPhase: 2.2, ribbonColor: '#e5e5e5',
            },
            {
                progress: 0.20, speed: 17, baseScale: 0.98,
                gender: 'boy', skinColor: '#b8855a',
                shirtColor: '#585858', pantColor: '#382614',
                scarfColor: '#b32b2b', bagColor: '#242424',
                walkPhase: 0.5, ribbonColor: null,
            },

            // Trailing lonely child walking slowly with schoolbag
            {
                progress: 0.06, speed: 16, baseScale: 0.98,
                gender: 'boy', skinColor: '#c4956a',
                shirtColor: '#266868', pantColor: '#252636',
                scarfColor: null, bagColor: '#346634',
                walkPhase: 4.0, ribbonColor: null,
            },

            // Child entering the school compound gate
            {
                progress: 0.84, speed: 16, baseScale: 1.00,
                gender: 'girl', skinColor: '#d4a57a',
                shirtColor: '#be5c7c', skirtColor: '#222346',
                scarfColor: '#88bede', bagColor: '#633c1a',
                walkPhase: 1.5, ribbonColor: '#be5c7c',
            },
        ];

        // Cyclist on the main road
        this.cyclist = {
            progress: 0.12,
            speed: 52,
            baseScale: 1.10,
            pedalPhase: 0,
        };
    }

    update(dt, totalTime) {
        const schoolSpeedFactor = 1 / this.schoolPathLength;
        const mainRoadSpeedFactor = 1 / this.mainRoadPathLength;

        // Update schoolchildren
        for (const child of this.children) {
            child.progress += child.speed * schoolSpeedFactor * dt;
            child.walkPhase += child.speed * dt * 0.17;

            // When a child reaches the school veranda steps (progress > 0.98),
            // reset smoothly back to the beginning
            if (child.progress > 0.98) {
                child.progress = -0.06 - Math.random() * 0.14;
            }
        }

        // Update cyclist along the main village road
        this.cyclist.progress += this.cyclist.speed * mainRoadSpeedFactor * dt;
        this.cyclist.pedalPhase += this.cyclist.speed * dt * 0.13;
        if (this.cyclist.progress > 1.08) {
            this.cyclist.progress = -0.10;
        }
    }

    draw(ctx) {
        const entities = [];

        // Collect schoolchildren
        for (const child of this.children) {
            if (child.progress < 0 || child.progress > 1) continue;

            const pos = getPointOnPath(WORLD.ROAD_PATH, clamp(child.progress, 0, 1));
            // Realistic perspective scaling: farther (lower y, near school) = ~0.84x, closer = ~1.12x
            const perspScale = mapRange(pos.y, 712, 765, 0.84, 1.12);
            const finalScale = child.baseScale * clamp(perspScale, 0.78, 1.18);

            // Smooth fade out as child steps into the dark school classroom door
            let opacity = 1.0;
            if (child.progress > 0.88) {
                opacity = mapRange(child.progress, 0.88, 0.98, 1.0, 0.0);
            } else if (child.progress < 0.04) {
                opacity = mapRange(child.progress, 0.0, 0.04, 0.0, 1.0);
            }

            entities.push({
                type: 'child',
                x: pos.x,
                y: pos.y,
                scale: finalScale,
                opacity: clamp(opacity, 0, 1),
                data: child,
            });
        }

        // Collect cyclist along main road
        if (this.cyclist.progress >= 0 && this.cyclist.progress <= 1) {
            const pos = getPointOnPath(WORLD.MAIN_ROAD_PATH, clamp(this.cyclist.progress, 0, 1));
            const perspScale = mapRange(pos.y, 742, 765, 0.90, 1.12);

            entities.push({
                type: 'cyclist',
                x: pos.x,
                y: pos.y,
                scale: this.cyclist.baseScale * clamp(perspScale, 0.85, 1.15),
                opacity: 1.0,
                data: this.cyclist,
            });
        }

        // Sort by y-position so ground overlap is physically accurate
        entities.sort((a, b) => a.y - b.y);

        // Draw all entities
        for (const e of entities) {
            if (e.type === 'child') {
                drawChild(ctx, e.x, e.y, { ...e.data, scale: e.scale, opacity: e.opacity }, e.data.walkPhase);
            } else if (e.type === 'cyclist') {
                drawCyclist(ctx, e.x, e.y, e.scale * 0.90, e.data.pedalPhase);
            }
        }
    }
}
