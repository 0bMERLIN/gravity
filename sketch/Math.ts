import { Vector } from "p5";
const G = 6.67408 * (10 ** (-11));
const AU = 1.49597870691 * 10 ** 8;
const SOLAR_MASS = 1.989 * 10 ** 30;

const MASS_EARTH = 3.00273 * 10 ** (-6) * SOLAR_MASS;
const MASS_SUN = SOLAR_MASS;
const MASS_MOON = 3.69432 * 10 ** (-8) * SOLAR_MASS;

const GM = (combinedMass: number) => G * combinedMass * 10 ** (-9);

const secToDay = (t: number) => ((t / 60) / 60) / 24

export {
    G, GM, AU, SOLAR_MASS, MASS_EARTH, MASS_SUN, MASS_MOON, secToDay
}
