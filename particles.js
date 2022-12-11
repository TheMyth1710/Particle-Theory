var time;
var oldValues = [];
if(document.readyState === "complete" && window.history.replaceState) window.history.replaceState( null, null, window.location.href );
function zoom(elm, zoomIn=true, initial=false, factor=0.2){
    var scale = parseFloat(elm.style.scale)
    if (!scale) scale = initial;
    if (initial) scale = 1;
    if (zoomIn && scale <= 1.8) elm.style.scale = scale + factor;
    else if (!zoomIn && scale >= 0.4) elm.style.scale = scale - factor;
}

function particleGenerator(){
    const valueRanges = {"Polygon Size": [2,12], "Dimension (m)": [0,1000], "Velocity (m/s)": [0,1000]};
    var moveAhead = true;
    var count = 0;
    document.querySelectorAll(".inputField").forEach(input => {
        var value = input.querySelector("input").value;
        var text = input.querySelector("span").innerHTML;
        if (value == '' || oldValues.includes(parseInt(value)) || value <= valueRanges[text][0] || value > valueRanges[text][1]){
            var inc = 0
            count += 1;
            if (text == "Polygon Size") inc = 1;
            if (!oldValues.includes(parseInt(value))){
              input.parentElement.querySelector(".error-text").innerHTML = `Only values between ${valueRanges[text][0]+inc} - ${valueRanges[text][1]} are allowed!`;
              input.parentElement.classList.add("error");
            }
            moveAhead = false;
        }
        else if (value.includes('.') && text == "Polygon Size"){
            input.parentElement.classList.add("error")
            input.parentElement.querySelector(".error-text").innerHTML = `Size can't be in decimals!`;
            moveAhead = false;
        }
        else{
            input.parentElement.classList.remove("error");
            input.parentElement.querySelector(".error-text").innerHTML = "";
            moveAhead = true;
        }
    })
    if (count < 3) moveAhead = true;
    else moveAhead = false;
    if (moveAhead){
        var n = parseInt(document.querySelector("#size").value), len = parseInt(document.querySelector("#length").value), v = parseInt(document.querySelector("#velocity").value);
        oldValues = [n, len, v]
        ctx.reset();
        main(n, 1+v/1000);
        zoom(ctx.canvas, true, true, len/1000);
        document.querySelector(".zoom-holder").style.animation = "scaleIn 0.5s forwards";
        if (document.body.clientWidth > 720) document.querySelector(".zoom-holder").style.display = "flex";
        time = getTime(n, len, parseFloat(document.querySelector("#velocity").value));
        document.querySelector(".time").innerHTML = "<span class='cursor'>&nbsp;</span>";
        type();
    }
}
function getTime(n, s, v){
  console.log(n, s, v)
  return Math.round(s/(v*Math.cos((180*n - 360)/(2*n) * Math.PI/180))*100)/100;
}

const ctx = document.getElementById('poly').getContext('2d');
var state = {}
const main = (n, v) => {
  ctx.reset();
  init(n, v);
  requestAnimationFrame(update);
};

const init = (n, v) => {
  Object.assign(ctx, { strokeStyle: 'green', lineWidth: 1 });
  state = {
    magnitude: v,
    origin: {
      x: ctx.canvas.width / 2,
      y: ctx.canvas.height / 2
    },
    points: n,
    radius: 50,
    rotation: Math.PI / 4,
    nodeInset: 10,
    nodeSize: 5,
    nodeRotation: Math.PI / 4,
  };
};

const FPS = 30;
let lastTimestamp = 0;

const update = (timestamp) => {
  let inset = state.nodeInset + state.magnitude;
  if (inset > state.radius) {
    inset = state.radius;
    state.magnitude *= -1;
  } else if (inset < state.nodeSize) {
    inset = state.nodeSize;
    state.magnitude *= -1;
  }
  state.nodeInset = inset;
  state.nodeRotation += (Math.PI / 36);
  
  requestAnimationFrame(update);
  if (timestamp - lastTimestamp < 1000 / FPS) return;
  
  redraw();
  lastTimestamp = timestamp;
};
const redraw = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawPolygon(ctx, state.origin.x, state.origin.y, state.points, state.radius, {
    nodeInset: state.nodeInset,
    nodeSize: state.nodeSize,
    nodeRotation: state.nodeRotation,
    rotation: state.rotation
  });
}

const defaultPolygonOptions = {
  nodeInset: 10,
  nodeSize: 5,
  rotation: 0,
};

/**
//  * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
//  * @param {Number} x - origin x-position
//  * @param {Number} y - origin y-position
//  * @param {Number} n - number of points
//  * @param {Number} radius - radius of polygon
//  * @param {Object} [options] - configuration options
//  * @param {Number} [options.nodeInset] - insets for nodes
//  * @param {Number} [options.nodeSize] - size of node
//  * @param {Number} [options.nodeRotation] - rotation of nodes
//  * @param {Number} [options.rotation] - polygon rotation
 */
const drawPolygon = (ctx, x, y, n, radius, options = {}) => {
  const opts = { ...defaultPolygonOptions, ...options };
  ctx.beginPath();
  ctx.moveTo(
    x + radius * Math.cos(opts.rotation),
    y + radius * Math.sin(opts.rotation)
  );          
  for (let i = 1; i <= n; i += 1) {
    const angle = (i * (2 * Math.PI / n)) + opts.rotation;
    ctx.lineTo(
      x + radius * Math.cos(angle),
      y + radius * Math.sin(angle)
    );
  }
  ctx.fillStyle = "#00818A";
  ctx.fill();

  if (!opts.nodeSize) return;
  const dist = radius - opts.nodeInset;
  for (let i = 1; i <= n; i += 1) {
    const angle = (i * (2 * Math.PI / n)) + opts.nodeRotation;
    ctx.beginPath();         
    ctx.arc(
      x + dist * Math.cos(angle),
      y + dist * Math.sin(angle),
      opts.nodeSize,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "#F9F7F7";
    ctx.fill();
  }
};


function tempDisable(elm){
  elm.disabled = true
  setTimeout(() => {elm.disabled = false}, 250);
}

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", ()=>{
        tempDisable(btn)
    })
})

const typingDelay = 100;
let charIndex = 0;
function type() {
    var timeText = `Time: ${time}s`
    var textDOM = document.querySelector(".time");
    var cursorSpan = document.querySelector(".cursor");
    // textDOM.innerHTML += "<span class='cursor'>&nbsp;</span>"
    Object.assign(cursorSpan.style, {"background-color": "var(--white)", "animation": "blink 1s 5"})
    cursorSpan.addEventListener("animationend", () => {
      cursorSpan.style.animation = "";
      cursorSpan.style.backgroundColor = "transparent";
    })
    function repeatType(){
      if (charIndex < timeText.length) {
          if(!cursorSpan.classList.contains("typing")) cursorSpan.classList.add("typing");
          textDOM.innerHTML += timeText.charAt(charIndex);
          charIndex++;
      setTimeout(repeatType, typingDelay);
    } 
    else {
      cursorSpan.classList.remove("typing");
      charIndex = 0;
    }
  }
  repeatType();
}