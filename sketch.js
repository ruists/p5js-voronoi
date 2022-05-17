let colorNum = 6;
let palette = [];
let controlPoints = [];
let N_POINTS = 30;
let bg = undefined;

let img = undefined;

let mode = 1;
let x, y;

function preload() {
  img = loadImage("images/flower.jpg");
}

function getPalette() {
  palette = [];
  while(palette.length < colorNum) {
    palette = chromotome.get();
    if(!palette.background) {
      palette = [];
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

  img.loadPixels();
  image(img, 0, 0);

  getPalette();

  //background(bg);

  //other initializations needed
  prepareControlPoints();
  x = y = 0;
}

function draw() {
  if(mode == 1) {
    let c = findClosestColor(x,y);
    writeColor(x, y, red(c), green(c), blue(c), alpha(c));
  
    if(random(1) > 0.8) {
      getPalette();
    }

    if(y+1 == img.height) {
      y = 0;
      if(x + 1 == img.width) {
        x = 0;
        mode++;
      } else {
        x++;
      }
    } else {
      y++;
    }
  } else if (mode == 2) {
    let point = findClosestControlPoint(x,y);
    let color = getColor(point.x,point.y);
    writeColor(x, y, color.r, color.g, color.b, color.a);

    if(y+1 == img.height) {
      y = 0;
      if(x + 1 == img.width) {
        noLoop()
      } else {
        x++;
      }
    } else {
      y++;
    }
  }

  img.updatePixels();
  image(img, 0, 0);
}

function findClosestColor(xcoord,ycoord) {
  let c = getColor(xcoord,ycoord);
  let dist = 999999;
  let closeColor = null;

  for(let i = 0; i < palette.length; i++) {
    let distance = calculateColorDistance(c, palette[i]);
    if(distance <= dist) {
      dist = distance;
      closeColor = palette[i];
    }
  }


  return closeColor;
}

function findClosestControlPoint(xcoord,ycoord) {
  let dist = 9999999;

  let point = controlPoints.find(element => element.x == x && element.y == y);
  if(point === undefined) {
    for(let i = 0; i < controlPoints.length; i++) {
      let distance = calculateDistance(xcoord, ycoord, controlPoints[i].x, controlPoints[i].y);
      if(distance < dist) {
        dist = distance;
        point = controlPoints[i];
      }
    }
    return point;
  } else return point;
}

function writeColor(xcoord, ycoord, red, green, blue, alpha) {
  let index = (xcoord + ycoord * img.width) * 4;
  img.pixels[index] = red;
  img.pixels[index + 1] = green;
  img.pixels[index + 2] = blue;
  img.pixels[index + 3] = alpha;
}

function getColor(xcoord, ycoord) {
  let index = (xcoord + ycoord * img.width) * 4;
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