
const loginBox = document.getElementById('login-container');
const video = document.getElementById('video');
const message = document.getElementById('result');
const trainButton = document.getElementById('btn');
let labeledFaceDescriptors;
let nameOfUser;

const a = Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)


function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);

  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)


  let faceMatcher;
  let labeledFaceDescriptors;
  labeledFaceDescriptors =  loadLabeledImages();


  trainButton.addEventListener('click', async () => {
    labeledFaceDescriptors = await loadLabeledImages();
    labeledFaceDescriptors = await loadLabeledImages()
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);


    
    
    setInterval(async () => {
      
    
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections =  faceapi.resizeResults(detections, displaySize);
    const results = await resizedDetections.map( (d )=> faceMatcher.findBestMatch(d.descriptor))
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      // drawBox.draw(canvas);

      // console.log("--------------------------",drawBox.options.label);
      nameOfUser = drawBox.options.label;
      
    })
    
    
  }, 100)



  
  setTimeout(() => {
  
    console.log("-----------",nameOfUser);
    
    try{
      let name = nameOfUser.split(" ")[0];
      console.log(name)
      
      if(name=='unknown')
      {
        console.log("login unsuccessfull");
        loginBox.style.display = 'none';
        message.innerHTML=` <p> Sorry You are known for me </p> <h1>Login Failed </h1>`
      }
      else{
        console.log(" login successfull")
        loginBox.style.display = 'none';
        message.innerHTML=`<p> Welcome ${name} , you are </p> <h1>Successfully Logined </h1>`;
        
      }
    }catch(err){
      
      let s = document.createElement('div');
      s.style.color = 'red';
      s.innerText="can't recognized try one more time";
      loginBox.append(s);
    }
  
  
  }, 2000);

  });


  
})




async function loadLabeledImages() {
  const labels = ['neha',"thor",'Captain America'];
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`/labeled-image/${label}/${i}.jpg`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}