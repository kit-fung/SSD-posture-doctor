let video;
let label = "waiting...";
let confidence = null;
let sec_label = null;
let sec_confidence = null;
let classifier;
let snake;
let rez = 20;
let food;
let w;
let h;

function preload() {
   // STEP D5: apply your own image classifier into the snake game by replacing the sharable link
  classifier = ml5.imageClassifier('https://teachablemachine.withgoogle.com/models/UjzJujuZr/model.json');
}

function setup() {

  createCanvas(300, 400);

  video = createCapture(VIDEO);
  video.hide();
  video.id('viewport')

  classifyVideo();

  w = floor(width / rez);
  h = floor(height / rez);
  frameRate(5);
  snake = new Snake();
  foodLocation();
}

function classifyVideo() {
  classifier.classify(video, gotResults);
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
    label = results[0].label;
    confidence = results[0].confidence;
    sec_label = results[1].label;
    sec_confidence = results[1].confidence;
    //console.log(results[0].confidence)
  // Step E3, add a call function " controlSnake(); " in line 42
  
  classifyVideo();
}

function foodLocation() {
  let x = floor(random(w));
  let y = floor(random(h));
  food = createVector(x, y);
}

// Step E2: Change this function from "keyPressed" to "controlSnake" and the keyCode to label
function keyPressed() {

  if (keyCode === LEFT_ARROW) {
    snake.setDir(-1, 0);
  } else if (keyCode === RIGHT_ARROW) {
    snake.setDir(1, 0);
  } else if (keyCode === DOWN_ARROW) {
    snake.setDir(0, 1);
  } else if (keyCode === UP_ARROW) {
    snake.setDir(0, -1);
  }
}

function draw() {
  
  background(220);
  image(video, 0, 150, width, width * video.height / video.width);
  textSize(30);
  fill(255);
  text(label, 10, 30);
  text(confidence === null ? "":confidence.toString(), 10, 80);
  text(sec_label === null ? "" : sec_label, 10, 130);
  text(sec_confidence === null ? "":sec_confidence.toString(), 10, 180);
  /*
  scale(rez);
  
  if (snake.eat(food)) {
    foodLocation();
  }
  snake.update();
  snake.show();

  if (snake.endGame()) {
    print('END GAME');
    background(255, 0, 0);
    noLoop();
  }

  noStroke();
  fill(255, 0, 0);
  rect(food.x, food.y, 1, 1);*/
}
