let colorNum = 6;
let palette = [];
let controlPoints = [];
let N_POINTS = 30;
let bg = undefined;

let capturer;
let duration = 15000;
let startMillis = null;

let img = undefined;

function preload() {
  img = loadImage("images/flower.jpg");
}

function getPalette() {
  palette = [];
  while(palette.length < colorNum) {
    palette = chromotome.get();
    if(!palette.background) {
      palette = {};
      continue;
    }
    bg = color(palette.background);
    palette = shuffle(palette.colors);
  }
}

function prepareControlPoints() {
  for(let i = 0; i < N_POINTS; i++) {
    while(1) {
      let xcoord = Math.floor(random(0, img.width));
      let ycoord = Math.floor(random(0, img.height));
  
      let point = controlPoints.find(element => element.x == xcoord && element.y == ycoord);
      if(point === undefined) {
        controlPoints.push({x: xcoord, y: ycoord});
        break;
      } else {
        continue;
      }
    }
  }
}

function setup() {
  createCanvas(img.width, img.height);
  frameRate(60);
  noLoop();

  img.loadPixels();
  image(img, 0, 0);

  getPalette();

  background(bg);
  capturer = new CCapture({format: 'png', framerate: 60});

  //other initializations needed
  prepareControlPoints();
}

function draw() {
  if(frameCount === 1) {
    capturer.start();
  }
  if(!startMillis)
    startMillis = millis();
  let elapsed = millis() - startMillis;
  if(elapsed > duration) {
    noLoop();
    capturer.stop();
    capturer.save();
    return;
  }

  for(let x = 0; x < img.width; x++) {
    for(let y = 0; y < img.height; y++) {
      let c = color(findClosestColor(x,y));
      writeColor(x, y, red(c), green(c), blue(c), alpha(c));

      if(random(1) > 0.8) {
        getPalette();
      }
    }
  }

  img.updatePixels();

  for(let x = 0; x < img.width; x++) {
    for(let y = 0; y < img.height; y++) {
      let point = findClosestControlPoint(x,y);
      let color = getColor(point.x,point.y);
      writeColor(x, y, red(color), green(color), blue(color), alpha(color));
    }
  }

  img.updatePixels();

  capturer.capture(document.getElementById('defaultCanvas0'));
}

function findClosestColor(x,y) {
  let c = getColor(x,y);
  let dist = 9999999;
  let closeColor = null;

  for(let i = 0; i < palette.length; i++) {
    let distance = calculateColorDistance(c, palette[i]);
    if(distance < dist) {
      dist = distance;
      closeColor = palette[i];
    }
  }

  return closeColor;
}

function findClosestControlPoint(x,y) {
  let dist = 999999999;

  let point = controlPoints.find(element => element.x == x && element.y == y);
  if(point === undefined) {
    for(let i = 0; i < controlPoints.length; i++) {
      let distance = calculateDistance(x, y, controlPoints[i].x, controlPoints[i].y);
      if(distance < dist) {
        dist = distance;
        point = controlPoint[i];
      }
    }
    return point;
  } else return point;
}

function writeColor(x, y, red, green, blue, alpha) {
  let index = (x + y * width) * 4;
  img.pixels[index] = red;
  img.pixels[index + 1] = green;
  img.pixels[index + 2] = blue;
  img.pixels[index + 3] = alpha;
}

function getColor(x,y) {
  let index = (x + y * width) * 4;
  let color = {};
  color.r = img.pixels[index];
  color.g = img.pixels[index + 1];
  color.b = img.pixels[index + 2];
  color.a = img.pixels[index + 3];

  return color;
}

function calculateColorDistance(c1, c2) {
  c2 = color(c2);
  return Math.sqrt(Math.pow(red(c2)-c1.r, 2) + Math.pow(green(c2)-c1.g, 2) + Math.pow(blue(c2)-c1.b, 2));
}

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}