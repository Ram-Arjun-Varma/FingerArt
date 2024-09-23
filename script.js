let model;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clear-btn'); // Get button element

let prevX = null;  // Store previous finger X position
let prevY = null;  // Store previous finger Y position

// Load the handpose model
async function loadModel() {
  model = await handpose.load();
  console.log("Handpose model loaded");
  detectHands();
}

// Set up the camera
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// Detect hand and get landmarks
async function detectHands() {
  const predictions = await model.estimateHands(video);
  
  if (predictions.length > 0) {
    predictions.forEach(prediction => {
      const indexFingerTip = prediction.landmarks[8]; // Index finger tip
      
      // Flip the X-axis (mirror the x coordinate)
      const x = canvas.width - indexFingerTip[0];
      const y = indexFingerTip[1];

      // Draw line from previous position to current position
      if (prevX != null && prevY != null) {
        drawLine(prevX, prevY, x, y);
      }

      // Update previous position
      prevX = x;
      prevY = y;
    });
  }

  requestAnimationFrame(detectHands); // Continuously detect hands
}

// Draw a line on the canvas
function drawLine(x1, y1, x2, y2) {
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x1, y1); // Move to previous finger position
  ctx.lineTo(x2, y2); // Draw a line to the current finger position
  ctx.stroke();
}

// Clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  prevX = null; // Reset the previous finger position
  prevY = null;
}

// Add event listener to the clear button
clearBtn.addEventListener('click', clearCanvas);

setupCamera().then(loadModel);