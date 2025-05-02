const riveCanvas = document.getElementById('riveCanvas');
const drawCanvas = document.getElementById('drawCanvas');
const ctx = drawCanvas.getContext("2d");
const TOOLBAR_HEIGHT = 100;
let drawModeInput;


const r = new rive.Rive({
  src: "puzzletime.riv",
  canvas: riveCanvas,
  autoplay: true,
  stateMachines: ["main-sm"],
  fit: rive.Fit.cover,
  onLoad: () => {
    r.resizeDrawingSurfaceToCanvas();
    resizeCanvas();
    const inputs = r.stateMachineInputs("main-sm");
    drawModeInput = inputs.find(i => i.name === 'drawMode');
    toggleDrawCanvas(drawModeInput?.value);
  },
});




// r.on(EventType.RiveEvent, onRiveEventReceived);

function onRiveEventReceived(riveEvent) {
  let eventName = riveEvent.data.name;
  let properties = riveEvent.data.properties;
  switch (eventName) {
    case "triggerClear":
      clearCanvas()
      break;
    case "triggerThick":
      thickPen()
      break;
      
    //  if (riveEvent.data.properties["isHovering"]) {
    //    const audio = new Audio(FireballAudio);
    //    audio.play()
    //    document.body.style.cursor = "pointer";
    //  } else {
    //    document.body.style.cursor = "auto";

    //  }
    //  break;

    }}

// maybe wrong
//r.on("rive_event", (event) => {
//  const eventName = event.data.name;
//  const properties = event.data.properties || {};
//  console.log("Rive Event Received:", event.data);
//  switch (eventName) {
//    case "triggerClear":
//      clearCanvas();
//      break;
//    case "triggerThick":
//      thickPen();
//        break;
//    case "triggerThin":
//      thinPen();
//        break;
//    default:
//      console.log("Unhandled event:", eventName);
//      console.log(event);
//      break;
//  }
//});


// State change listeners??
r.on("statechange", (event) => {
  const states = event.data.states;
  const stateMachineName = event.data.stateMachineName;
  console.log("State Change:", event.data); 

  if (drawModeInput) {
    toggleDrawCanvas(drawModeInput.value);
  }

  if (stateMachineName === "main-sm") {
    states.forEach((state) => {
      switch (state) {
        case "ClearBtn Click":
          clearCanvas();
          break;
      }
    });
  }
});

//hiding drawCanvas
function toggleDrawCanvas(isDrawingEnabled) {
  if (isDrawingEnabled) {
    drawCanvas.classList.remove("hidden");
    drawCanvas.style.pointerEvents = "auto";
    drawCanvas.style.cursor = "crosshair";
  } else {
    drawCanvas.classList.add("hidden");
    drawCanvas.style.pointerEvents = "none";
    drawCanvas.style.cursor = "default";
  }
}

// Resize logic
window.addEventListener("resize", () => {
  r.resizeDrawingSurfaceToCanvas();
  resizeCanvas();
});

function resizeCanvas(restoreDrawing = true) {
  const wasHidden = drawCanvas.classList.contains("hidden");
  if (wasHidden) drawCanvas.classList.remove("hidden");

  const toolbarHeight = TOOLBAR_HEIGHT;
  const newWidth = riveCanvas.clientWidth;
  const newHeight = riveCanvas.clientHeight - toolbarHeight;

  if (restoreDrawing) {
    const oldImage = new Image();
    oldImage.onload = () => {
      ctx.drawImage(oldImage, 0, 0, newWidth, newHeight);
    };
    oldImage.src = drawCanvas.toDataURL();
  }

  drawCanvas.width = newWidth;
  drawCanvas.height = newHeight;

  if (wasHidden) drawCanvas.classList.add("hidden");
}

//button functions
function clearCanvas() {
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

function thickPen() {
  ctx.lineWidth = 20;
}

function thinPen() {
  ctx.lineWidth = 9;
}

// Drawing
ctx.strokeStyle = "black";
ctx.lineCap = "round";

let isDrawing = false;
let lastX = 0;
let lastY = 0;

drawCanvas.addEventListener("mousedown", (e) => {
  if (drawCanvas.classList.contains("hidden")) return;
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
});

drawCanvas.addEventListener("mousemove", (e) => {
  if (!isDrawing || drawCanvas.classList.contains("hidden")) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

["mouseup", "mouseleave"].forEach((event) => {
  drawCanvas.addEventListener(event, () => {
    if (isDrawing) {
      isDrawing = false;
      ctx.closePath();
    }
  });
});