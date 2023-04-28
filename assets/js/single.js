const video = document.getElementById("video");
var labels = []

// const socket = io()
const firebaseConfig = {
      apiKey: "AIzaSyBZnFJQJlCQEFdvmFLI0gkSCHHiH1lUAWo",
      authDomain: "node-file-uploader.firebaseapp.com",
      projectId: "node-file-uploader",
      storageBucket: "node-file-uploader.appspot.com",
      messagingSenderId: "345185058962",
      appId: "1:345185058962:web:8629baa36820a3c410a64b",
      measurementId: "G-GSV81VWQE1"
    };
  
firebase.initializeApp(firebaseConfig);

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
  // const response =  await fetch('https://face-registration.onrender.com/getLabels')
  // const labels = await response.json()
  // console.log(labels)
  var listRef = await firebase.storage().ref(`labels`);
    // Find all the prefixes and items.
    await listRef.listAll()
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
          // console.log(folderRef.location.path_.slice(7))
          labels.push(folderRef.location.path_.slice(7))
        });
        // res.items.forEach((itemRef) => {
          // All the items under listRef.
        // });
      }).catch((error) => {
        // Uh-oh, an error occurred!
        console.error(error)
      });
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      // for (let i = 1; i <= 1; i++){
        let path = `labels/${label}`
        firebase.storage().ref(path).child(`1`).getDownloadURL()
        .then(async (url) => {
          // const img = await faceapi.fetchImage(`../assets/images/labels/${label}/${i}.png`); // firebase folder path??
          const img = await faceapi.fetchImage(url)
          const detections = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          descriptions.push(detections.descriptor);
          })
  .catch((error) => {
    // Handle any errors
  });
      // }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
  // })
}
// video.addEventListener("playing", () => {
// // location.reload();
// // console.log('Hello!')
// faceRecognition()
// });

async function faceRecognition() {
  const faceDescriptions = await getLabeledFaceDescriptions();
//   const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

    const threshold = 0.6
    const faceMatcher = new faceapi.FaceMatcher(faceDescriptions)

    const results = faceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))
    console.log(results)
    // results.forEach((bestMatch, i) => {
    //     const box = faceDescriptions[i].detection.box
    //     const text = bestMatch.toString()
    //     const drawBox = new faceapi.draw.DrawBox(box, { label: text })
    //     drawBox.draw(canvas)
    // })

    // const canvas = faceapi.createCanvasFromMedia(video);
    // document.body.append(canvas);

    // const displaySize = { width: video.width, height: video.height };
    // faceapi.matchDimensions(canvas, displaySize);
    // setInterval(async () => {
    //   // Recognition Function
    //   const detections = await faceapi
    //     .detectSingleFace(video)
    //     .withFaceLandmarks()
    //     .withFaceDescriptor();
    //     // console.log(detections)

    //   // Bounding Box Display function
    //   const resizedDetections = faceapi.resizeResult(detections, displaySize);

    //   canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    //   const results = resizedDetections.map((d) => {
    //     // console.log(d)
    //     return faceMatcher.findBestMatch(d.descriptor);
    //   });
    //   results.forEach((result, i) => {
    //     // console.log(result._label)
    //     const box = resizedDetections[i].detection.box;
    //     const drawBox = new faceapi.draw.DrawBox(box, {
    //       label: result._label,
    //     });
    //     drawBox.draw(canvas);
    //   });
    // }, 100);
}
