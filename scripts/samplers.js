const Animation = require("Animation");
import { rad } from './helper'

export const samplers = {
    roadRotation: Animation.samplers.linear(0, rad(-360)),
    colliderRotation: Animation.samplers.linear(rad(90), rad(-45)),
    characterRotation: Animation.samplers.linear(rad(0), rad(-90)),
    jump: Animation.samplers.easeInOutSine(0, 0.15),
    gameOut: Animation.samplers.linear(0, -0.4),
    opacityOut: Animation.samplers.linear(1, 0),
};