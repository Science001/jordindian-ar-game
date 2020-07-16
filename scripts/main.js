const Diagnostics = require("Diagnostics");
const FaceTracking = require("FaceTracking");
const FaceGestures = require("FaceGestures");
const Instruction = require('Instruction');
const Animation = require("Animation");
const Patches = require("Patches");
const TouchGestures = require("TouchGestures");
const Time = require("Time");

Diagnostics.log("Script Loaded")

import getElements from "./getElements";
import { drivers } from "./drivers";
import { samplers } from './samplers';
import { random, strictRandom, rad } from "./helper";


const mainElements = ["mover", "jumper", "roadCylinder", "collectors", "avoiders", "game", "characterRotator"];
const collectors = ["shawarma", "falafel", "hummus"];
const avoiders = ["cactus", "camel", "books"];
const characters = ["raju", "bdb", "khaleel"];
const rectangles = ["gameCanvas", "greenVignette", "redVignette", "lifeBar", "progressBar", "speechBubble", "text", "instructions", "scoreCard", "scoreText"];
const faceFilters = ["nothingHolder", "glassHolder", "headClothHolder"];
const collectedTexts = ["Wow!", "Tasty!", "Habibi!"];
const hittedTexts = ["Ouch!", "AH!", "Yakhi!"];
const materialNames = ["lifeBar", "progressBar", "speechBubble"];
const textureNames = ["normalBubble", "alertBubble"];
const elementNames = [...mainElements, ...collectors, ...avoiders, ...characters, ...rectangles, ...faceFilters];
const HITBOX = 0.05346;
const face = FaceTracking.face(0);
var gameStarted = false;
var currentCollectorPosition = 0, currentAvoiderPosition = 0;
var collected = 0, life = 3;
var jumping = false;

getElements(elementNames, materialNames, textureNames)
    .then(l => {
        Diagnostics.log("Starting");
        initialize(l);
        TouchGestures.onTap().subscribe(() => (startGame(l)));
        drivers.collectorRotation.onAfterIteration().subscribe(() => (setCollector(l)));
        drivers.avoiderRotation.onAfterIteration().subscribe(() => (setAvoider(l)));
        l.collectors.transform.rotationX.monitor().subscribe(e => {
            if (e.newValue < rad(1) && e.newValue > rad(-1)) {
                let characterPositionX = l.mover.transform.x.pinLastValue();
                let characterPositionY = l.jumper.transform.y.pinLastValue();
                if (currentCollectorPosition + HITBOX > characterPositionX && currentCollectorPosition - HITBOX < characterPositionX && characterPositionY < 0.02)
                    onCollector(l);
            }
        })
        l.avoiders.transform.rotationX.monitor().subscribe(e => {
            if (e.newValue < rad(1) && e.newValue > rad(-1)) {
                let characterPositionX = l.mover.transform.x.pinLastValue();
                let characterPositionY = l.jumper.transform.y.pinLastValue();
                if (currentAvoiderPosition + HITBOX > characterPositionX && currentAvoiderPosition - HITBOX < characterPositionX && characterPositionY < 0.02)
                    onAvoider(l);
            }
        })
        FaceGestures.hasMouthOpen(face).monitor().subscribe(e => {
            if (e.newValue && e.newValue != e.oldValue) {
                if (!jumping) {
                    jumping = true;
                    drivers.jump.start();
                    drivers.jump.onCompleted().subscribe(() => {
                        if (jumping) {
                            drivers.jump.reverse();
                            jumping = false;
                        }
                    });
                }
            }
        })
    })
    .catch(e => {
        Diagnostics.log("There has been an error Jack! What are ya doing?!");
        Diagnostics.log(e);
    })

function initialize(l) {
    // Road
    l.roadCylinder.transform.rotationX = Animation.animate(drivers.roadRotation, samplers.roadRotation);

    // Character
    l.characterRotator.transform.rotationX = Animation.animate(drivers.characterRotation, samplers.characterRotation);
    l.jumper.transform.y = Animation.animate(drivers.jump, samplers.jump);

    // Collectors
    setCollector(l);
    l.collectors.transform.rotationX = Animation.animate(drivers.collectorRotation, samplers.colliderRotation);


    // Avoiders
    setAvoider(l);
    l.avoiders.transform.rotationX = Animation.animate(drivers.avoiderRotation, samplers.colliderRotation);

    // Patches
    Patches.inputs.setScalar("lifeFrame", 0);
    Patches.inputs.setScalar("progressFrame", 0);
    Patches.inputs.setBoolean("stopRunning", true);
    Patches.inputs.setString("bubbleText", "Let's go!");

    // Gameover
    l.game.transform.y = Animation.animate(drivers.gameOut, samplers.gameOut);
    l.material.progressBar.opacity = Animation.animate(drivers.gameOut, samplers.opacityOut);
    l.material.lifeBar.opacity = Animation.animate(drivers.gameOut, samplers.opacityOut);

    // Instructions
    Instruction.bind(true, 'tilt_head_side_to_side');
    Time.setTimeout(() => (Instruction.bind(true, 'open_mouth')), 2000);
    Time.setTimeout(() => (Instruction.bind(true, 'tap_to_play')), 4000);
    Time.setTimeout(() => (Instruction.bind(false, '')), 6000);
}

function startGame(l) {
    if (!gameStarted) {
        gameStarted = true;
        drivers.roadRotation.start();
        drivers.collectorRotation.start();
        Time.setTimeout(() => (drivers.avoiderRotation.start()), 1000);
        Patches.inputs.setBoolean("stopRunning", false);
        l.speechBubble.hidden = false;
        l.text.hidden = false;
        l.gameCanvas.hidden = false;
        l.instructions.hidden = true;
    }
}

function setCollector(l) {
    l.collectors.hidden = false;
    currentCollectorPosition = random(0, 0.06992);
    l.collectors.transform.x = currentCollectorPosition;
    let currentFood = strictRandom(0, 3);
    collectors.forEach((food, index) => (l[food].hidden = index !== currentFood));
}

function setAvoider(l) {
    l.avoiders.hidden = false;
    currentAvoiderPosition = random(0, 0.06992);
    l.avoiders.transform.x = currentAvoiderPosition;
    let currentObstacle = strictRandom(0, 3);
    avoiders.forEach((obstacle, index) => (l[obstacle].hidden = index !== currentObstacle));
        if (!life) {
            Diagnostics.log("Game Over");
            drivers.avoiderRotation.stop();
            drivers.collectorRotation.stop();
            drivers.roadRotation.stop();
            drivers.gameOut.start();
            l.speechBubble.hidden = true;
            l.text.hidden = true;
            l.scoreCard.hidden = false;
            l.scoreText.hidden = false;
            Patches.inputs.setString("score", collected.toString());
        }
}

function onAvoider(l) {
    l.greenVignette.hidden = true;
    l.redVignette.hidden = false;
    Time.setTimeout(() => (l.redVignette.hidden = true), 300);
    l.avoiders.hidden = true;
    life -= 1;
    Patches.inputs.setScalar("lifeFrame", 3 - life);
    Patches.inputs.setString("bubbleText", hittedTexts[strictRandom(0, 3)]);
    l.material.speechBubble.diffuse = l.texture.alertBubble;
    if (!life) {
        drivers.characterRotation.start();
        Patches.inputs.setBoolean("stopRunning", true);
    }
}

function onCollector(l) {
    l.greenVignette.hidden = false;
    l.redVignette.hidden = true;
    Time.setTimeout(() => (l.greenVignette.hidden = true), 300);
    l.collectors.hidden = true;
    collected += 1;
    Patches.inputs.setScalar("progressFrame", collected < 10 ? collected : 10);
    Patches.inputs.setString("bubbleText", collectedTexts[strictRandom(0, 3)]);
    l.material.speechBubble.diffuse = l.texture.normalBubble;
    if (collected % 5 === 0) {
        let characterIndex = (collected / 5) < 3 ? collected / 5 : 2;
        characters.forEach((character, index) => (l[character].hidden = index !== characterIndex));
        faceFilters.forEach((filter, index) => (l[filter].hidden = index !== characterIndex));
    }
}