const Animation = require("Animation");

export const drivers = {
    roadRotation: Animation.timeDriver({
        durationMilliseconds: 5000,
        loopCount: Infinity,
        mirror: false
    }),
    collectorRotation: Animation.timeDriver({
        durationMilliseconds: 2500,
        loopCount: Infinity,
        mirror: false
    }),
    avoiderRotation: Animation.timeDriver({
        durationMilliseconds: 2500,
        loopCount: Infinity,
        mirror: false
    }),
    characterRotation: Animation.timeDriver({
        durationMilliseconds: 800,
        loopCount: 1,
        mirror: false
    }),
    jump: Animation.timeDriver({
        durationMilliseconds: 400,
        loopCount: 1,
        mirror: false
    }),
    gameOut: Animation.timeDriver({
        durationMilliseconds: 3000,
        loopCount: 1,
        mirror: false
    }),
};