let video;
let label = "waiting...";
let confidence = null;
let sec_label = null;
let sec_confidence = null;
let classifier = {};
let snake;
let rez = 20;
var global_var = {'gender' : 'm', 'cur_posture':'auto'}
let obj_classifiers = {'auto':"UjzJujuZr"}
let score_map = {'auto':{'label':'fist','well':0.8,'good':0.5}}
function update_canvas(){resizeCanvas(window.innerWidth * 0.5,window.innerHeight)}
window.addEventListener('resize', function(){update_canvas()}, true);

function preload(){
    navigator.permissions.query({ name: "camera" }).then((permissionStatus) => {
            console.log(`camera permission status is ${permissionStatus.state}`);
            permissionStatus.onchange = () => {
                console.log(`camera permission status has changed to ${permissionStatus.state}`,)
            }
    })
    window.addEventListener('online',() => {console.log("internet:",navigator.onLine)})
    window.addEventListener('offline',() => {console.log("internet:",navigator.onLine)})
}

function AddClassifier(key) {
    // STEP D5: apply your own image classifier into the snake game by replacing the sharable link
    if (!(key in classifier)){
        console.log(obj_classifiers[key])
        classifier[key] = ml5.imageClassifier(`https://teachablemachine.withgoogle.com/models/${obj_classifiers[key]}/model.json`);
    }
}

function setup() {

    main_canvas = createCanvas(0, 0)
    main_canvas.parent('main_canvas_wrapper')
    console.log("internet:",navigator.onLine)

    video = createCapture(VIDEO);
    video.hide();
    video.id('viewport')
    update_canvas()
    frameRate(60)
}

function classifyVideo(key) {
    if (key in obj_classifiers){
        console.log("classifying:",key)
        AddClassifier(key)
        classifier[key].classify(video, gotResults);
    }
}

function gotResults(error, results) {
    if (error) {
        console.error(error);
        return;
    }
    //console.log(results)
    label = results[0].label;
    confidence = results[0].confidence;
    sec_label = results[1].label;
    sec_confidence = results[1].confidence;
    for(let i = 0; i < results.length; i++){
        //console.log(results[i].label,results[i].confidence)
        if (results[i].label == score_map[global_var['cur_posture']]['label']){
            get_label(results[i].confidence)
        }
    }
    //classifyVideo();
}

function foodLocation() {
    let x = floor(random(w));
    let y = floor(random(h));
    food = createVector(x, y);
}
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
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function set_class_style(Name,Attr,Val){
    temp = document.getElementsByClassName(Name)
    for(i = 0; i < temp.length; i++){temp[i].style.setProperty(Attr,Val)}
}
function get_score(){
    classifyVideo(global_var['cur_posture']);
}
function get_label(score){
    console.log(score)
    temp = document.getElementsByClassName('quality_label')
    for (let i = 0; i < temp.length; i++) {
        temp[i].style.setProperty('--T',0)
        temp[i].style.setProperty('transition','--T 0s')
    }
    setTimeout(() => {key_score = score >= score_map[global_var['cur_posture']]['well'] ? 0 : (score >= score_map[global_var['cur_posture']]['good'] ? 1 : 2);temp[key_score].style.setProperty('--T',1);temp[key_score].style.setProperty('transition','--T 0.3s');},0)
}
function set_gestures(Val){
    temp = document.getElementsByClassName('posture_item')
    for (let i = 0; i < temp.length; i++) {
        //console.log(`url(assets/${temp[i].getAttribute('data-posture')}_${Val == 1 ? 'm' : 'f'}.png)`)
        temp[i].style.setProperty('background-image',`url(assets/posture_${temp[i].getAttribute('data-posture')}_${Val == 0 ? 'm' : 'f'}.png)`)
        if(temp[i].style.getPropertyValue('--u') == 1)
        {document.getElementById('selected_posture').style.setProperty('background-image',`url(assets/posture_${temp[i].getAttribute('data-posture')}_${Val == 0 ? 'm' : 'f'}.png)`)}
    }
}
