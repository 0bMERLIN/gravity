const G = 6.67430e-11;
const AU = 1.49597870691 * 10 ** 11;
const SOLAR_MASS = 1.989 * 10 ** 30;

const MASS_EARTH = 5.972 * 10**24;
const MASS_MOON = 7.34767309 * 10**22;

const secToDay = (t: number) => ((t / 60) / 60) / 24

export {
    G, AU, SOLAR_MASS, MASS_EARTH, MASS_MOON, secToDay
}
