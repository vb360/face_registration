const video = document.getElementById("video");


const socket = io()


Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
])
  .then(startWebcam)
  .then(faceRecognition);

function startWebcam(){
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}



async function getLabeledFaceDescriptions() {
  // const response =  await fetch('http://localhost:3000/getLabels')
  // const labels = await response.json()
  // console.log(labels)

  socket.emit('hello')
  socket.on('labels',async (labels)=>{

  return Promise.all(
    labels.map(async (label) => {
      
      const descriptions = [];
      for (let i = 1; i <= 1; i++){
        const img = await faceapi.fetchImage(`../assets/images/labels/${label}/${i}.png`); // firebase folder path??
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
  })
}

async function faceRecognition() {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
  
    video.addEventListener("playing", () => {
    location.reload();
  });

    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();

        // console.log(detections)

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      const results = resizedDetections.map((d) => {
        // console.log(d)
        return faceMatcher.findBestMatch(d.descriptor);
      });
      results.forEach((result, i) => {
        // console.log(result._label)
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result._label,
        });
        drawBox.draw(canvas);
      });
    }, 100);
}
