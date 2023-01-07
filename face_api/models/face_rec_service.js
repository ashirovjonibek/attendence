const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");
const canvas = require("canvas");
const {FaceRecognition} = require("../../models/FaceRecognation");
faceapi.env.monkeyPatch({ Canvas, Image });

async function loadModels() {
    await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/models");
    await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/models");
    console.log("models loaded!")
}

async function getDescriptions(images=[],label){
    try {
        let decs=[];
        if (images.length){
            for (const img of images) {
                const imgCanvas = await canvas.loadImage(img);
                const detections = await faceapi.detectSingleFace(imgCanvas).withFaceLandmarks().withFaceDescriptor();
                if (detections&&detections.descriptor){
                    decs.push(detections.descriptor);
                }
            }
        }
        return decs
    }catch (e){
        console.log(e)
        return e
    }
}

async function getDescriptorsFromDB(image) {
    // Get all the face data from mongodb and loop through each of them to read the data
    let faces = await FaceRecognition.findAll();
    for (let i = 0; i < faces.length; i++) {
        // Change the face data descriptors from Objects to Float32Array type
        for (let j = 0; j < faces[i].descriptions.length; j++) {
            faces[i].descriptions[j] = new Float32Array(Object.values(faces[i].descriptions[j]));
        }
        // Turn the DB face docs to
        faces[i] = new faceapi.LabeledFaceDescriptors(faces[i].key, faces[i].descriptions);
    }

    // Load face matcher to find the matching face
    const faceMatcher = new faceapi.FaceMatcher(faces, 0.6);

    // Read the image using canvas or other method
    const img = await canvas.loadImage(image);
    let temp = faceapi.createCanvasFromMedia(img);
    // Process the image for the model
    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(temp, displaySize);

    // Find matching faces
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
    return results;
}

module.exports = {
    loadModels,
    getDescriptions,
    getDescriptorsFromDB
}