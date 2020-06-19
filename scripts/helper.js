const Random = require('Random');

export function rad(degrees) {
    return degrees*(Math.PI/180);
}

export function random(start, end) {
    let minusSeed = Random.random();
    return (Random.random()*end+start)*(minusSeed<=0.5 ? -1 : 1);
}

export function strictRandom(start, end) {
    return Math.floor(Random.random()*end+start)
}