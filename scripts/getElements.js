const Scene = require('Scene');
const Materials = require('Materials');
const Textures = require('Textures');
const Diagnostics = require('Diagnostics');

export default function getElements(elementNames, materialNames=[], textureNames=[]) {
    return new Promise((resolve, reject) => {
        let elementsObject = {};
        Promise.all(elementNames.map(name => (Scene.root.findFirst(name))))
        .then(elementsArray => {
            elementNames.forEach((name, i) => {
                elementsObject[name] = elementsArray[i];
            })
            if(materialNames.length > 0) {
                elementsObject.material = {}
                Promise.all(materialNames.map(name => (Materials.findFirst(name))))
                .then(materialsArray => {
                    materialNames.forEach((name, i) => {
                        elementsObject['material'][name] = materialsArray[i];
                    })
                    if(textureNames.length>0) {
                        elementsObject.texture = {}
                        Promise.all(textureNames.map(name => (Textures.findFirst(name))))
                        .then(texturesArray => {
                            textureNames.forEach((name, i) => {
                                elementsObject['texture'][name] = texturesArray[i];
                            })
                            resolve(elementsObject);
                        })
                        .catch((err) => {
                            Diagnostics.log("Error finding the textures");
                            reject(err);
                        });
                    }
                    else resolve(elementsObject);
                })
                .catch((err) => {
                    Diagnostics.log("Error finding the materials");
                    reject(err);
                });
            }
            else resolve(elementsObject);
        })
        .catch((err) => {
            Diagnostics.log("Error finding the elements");
            reject(err);
        });
    });
}