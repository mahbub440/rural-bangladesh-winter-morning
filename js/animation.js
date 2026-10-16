/**
 * animation.js — Easing, interpolation, and utility functions
 */

/** Linear interpolation between a and b by factor t */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/** Clamp v between min and max */
export function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
}

/** Smoothstep (Hermite) interpolation */
export function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
}

/** Ease-in-out cubic */
export function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Sine-based oscillation: returns value between min and max over period (seconds) */
export function oscillate(time, period, min = 0, max = 1) {
    const t = (Math.sin((time / period) * Math.PI * 2) + 1) / 2;
    return lerp(min, max, t);
}

/** Cosine-based oscillation (starts at max) */
export function oscillateCos(time, period, min = 0, max = 1) {
    const t = (Math.cos((time / period) * Math.PI * 2) + 1) / 2;
    return lerp(min, max, t);
}

/** Simple 1D value noise using sine hashing */
export function noise1D(x) {
    return (Math.sin(x * 127.1 + 311.7) * 43758.5453) % 1;
}

/** 2D pseudo-random from coordinates (deterministic) */
export function hash2D(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

/** Map a value from one range to another */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Create a color string with alpha */
export function rgba(r, g, b, a = 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Hex color to rgb components */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/** Lerp between two hex colors */
export function lerpColor(hex1, hex2, t) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const r = Math.round(lerp(c1.r, c2.r, t));
    const g = Math.round(lerp(c1.g, c2.g, t));
    const b = Math.round(lerp(c1.b, c2.b, t));
    return `rgb(${r}, ${g}, ${b})`;
}

/** Simple timer class */
export class Timer {
    constructor(duration, loop = false) {
        this.duration = duration;
        this.elapsed = 0;
        this.loop = loop;
    }

    update(dt) {
        this.elapsed += dt;
        if (this.loop && this.elapsed >= this.duration) {
            this.elapsed %= this.duration;
        }
    }

    get progress() {
        return clamp(this.elapsed / this.duration, 0, 1);
    }

    get isDone() {
        return this.elapsed >= this.duration;
    }

    reset() {
        this.elapsed = 0;
    }
}

/** Bezier curve point calculation */
export function quadBezier(p0x, p0y, p1x, p1y, p2x, p2y, t) {
    const mt = 1 - t;
    return {
        x: mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x,
        y: mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y
    };
}

/** Get point along a polyline path at parameter t (0-1) */
export function getPointOnPath(points, t) {
    if (points.length < 2) return points[0] || { x: 0, y: 0 };
    const totalSegments = points.length - 1;
    const segment = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
    const localT = (t * totalSegments) - segment;
    return {
        x: lerp(points[segment].x, points[segment + 1].x, localT),
        y: lerp(points[segment].y, points[segment + 1].y, localT)
    };
}
