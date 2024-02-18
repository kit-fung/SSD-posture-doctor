let video;
var main_canvas
let label = "waiting...";
let confidence = null;
let sec_label = null;
let sec_confidence = null;
let classifier = {};
let snake;
let rez = 20;
var cur_mouse
var cur_accessories = {}
var global_var = {'gender' : 'm', 'cur_posture':'auto','skin_tone':{'r': 255, 'g':220,'b': 200},'getting_canvas_color':Array()}
let obj_classifiers = {'auto':"UjzJujuZr"}
let score_map = {'auto':{'label':'fist','well':0.8,'good':0.5}}
var img_tally = {}
function update_canvas(){resizeCanvas(window.innerWidth * 0.5,window.innerHeight)}
window.addEventListener('resize', function(){update_canvas()}, true);

function preload(){
    navigator.permissions.query({ name: 'camera' }).then((permissionStatus) => {
            console.log(`camera permission status is ${permissionStatus.state}`);
            permissionStatus.onchange = () => {
                console.log(`camera permission status has changed to ${permissionStatus.state}`,)
            }
    })
    window.addEventListener('online',() => {cur_accessories['internet'] = navigator.onLine})
    window.addEventListener('offline',() => {cur_accessories['internet'] = navigator.onLine})
    window.addEventListener('mousemove',(e) => {cur_mouse = e})
    let temp_array = document.getElementsByClassName('skin_tone_viewer')
    for (let i = 0; i < temp_array.length; i++){
        temp_array[i].style.setProperty('--r',global_var['skin_tone']['r'])
        temp_array[i].style.setProperty('--g',global_var['skin_tone']['g'])
        temp_array[i].style.setProperty('--b',global_var['skin_tone']['b'])
    }
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
    cur_accessories['internet'] = navigator.onLine
    cur_accessories['permit_camera'] = false
    cur_accessories['found_camera'] = false
    video = createCapture(VIDEO, () => {cur_accessories['permit_camera'] = true; console.log(video)});
    video.hide();
    video.id('viewport')
    update_canvas()
    frameRate(60)
    update_accessories()
}

function classifyVideo(key) {
    if (key in obj_classifiers){
        console.log("classifying:",key)
        AddClassifier(key)
        let temp_key = video.canvas.toDataURL('image/jpeg',1.0)
        classifier[key].classify(video, gotResults).then((t)=>{img_tally[temp_key] = {'img':loadImage(temp_key),'result':t}},(f)=>{console.log(f)})
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

function draw() { // this function calls every frame
    background(220);
    if(video.width >= 1 && video.height >= 1) {
        cur_accessories['found_camera'] = true
        image(video, 0, 0.5 * (height - width * video.height / video.width), width, width * video.height / video.width)
    }
    else{
        cur_accessories['found_camera'] = false
    }
    if(Object.keys(img_tally).length >= 1){
        let temp_scale = 0.2
        let temp_length = Object.keys(img_tally).length
        for(let i=0; i < temp_length;){
            image(img_tally[Object.keys(img_tally)[temp_length - i - 1]]['img'], width * temp_scale * i, height - width * video.height / video.width * temp_scale, width * temp_scale, width * video.height / video.width * temp_scale)
            i++
            if(width * temp_scale * i > width){break}
        }
    }
    textSize(30)
    fill(200, 135, 100)
    text(label, 10, 30)
    text(confidence === null ? "":confidence.toString(), 10, 80)
    text(sec_label === null ? "" : sec_label, 10, 130)
    text(sec_confidence === null ? "":sec_confidence.toString(), 10, 180)

    if(global_var['getting_canvas_color'].length >= 1){
        let temp_rect = main_canvas.canvas.getBoundingClientRect()
        let color_key = global_var['getting_canvas_color'][0]
        document.getElementById('canvas_color_pick_field').style.setProperty('display','block')
        document.getElementById('canvas_color_pick_viewer').style.setProperty('display','block')
        if (cur_mouse != null && (cur_mouse.clientX >= temp_rect.left) && (cur_mouse.clientX < temp_rect.right) && (cur_mouse.clientY >= temp_rect.top) && (cur_mouse.clientY < temp_rect.bottom)){
            let color_data = main_canvas.canvas.getContext('2d').getImageData((cur_mouse.clientX - temp_rect.left) * (main_canvas.canvas.width / temp_rect.width), (cur_mouse.clientY - temp_rect.top) * (main_canvas.canvas.height / temp_rect.height), 1, 1).data
            global_var[color_key]['r'] = color_data[0]
            global_var[color_key]['g'] = color_data[1]
            global_var[color_key]['b'] = color_data[2]
            let temp_array = document.getElementsByClassName(`${color_key}_viewer`)
            for (let i = 0; i < temp_array.length; i++){
                temp_array[i].style.setProperty('--r',global_var[color_key]['r'])
                temp_array[i].style.setProperty('--g',global_var[color_key]['g'])
                temp_array[i].style.setProperty('--b',global_var[color_key]['b'])
            }
        }
        temp_ele = document.getElementById('canvas_color_pick_viewer')
        temp_ele.style.setProperty('--r',global_var[color_key]['r'])
        temp_ele.style.setProperty('--g',global_var[color_key]['g'])
        temp_ele.style.setProperty('--b',global_var[color_key]['b'])
    }
    else{
        document.getElementById('canvas_color_pick_field').style.setProperty('display','none')
        document.getElementById('canvas_color_pick_viewer').style.setProperty('display','none')
    }
    update_accessories()
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function set_class_style(Name,Attr,Val){
    temp = document.getElementsByClassName(Name)
    for(i = 0; i < temp.length; i++){temp[i].style.setProperty(Attr,Val)}
}
function ArrayUnion(_array, _ele){if((_array.constructor === Array) && !_array.includes(_ele)){_array.push(_ele)}}
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
        temp[i].style.setProperty('background-image',`url(assets/posture_${temp[i].getAttribute('data-posture')}_${Val}.png)`)
        if(temp[i].style.getPropertyValue('--u') == 1)
        {document.getElementById('selected_posture').style.setProperty('background-image',`url(assets/posture_${temp[i].getAttribute('data-posture')}_${Val}.png)`)}
    }
}
function update_accessories(){
    if(cur_accessories['permit_camera']){
        if(cur_accessories['found_camera']){
            if(cur_accessories['internet']){
                document.getElementById('accessory_alert').setAttribute('src',"")
                document.getElementById('cam_btn').style.setProperty('display','block')
            }
            else{
                document.getElementById('accessory_alert').setAttribute('src',"assets/no-access_internet_cn.png")
                document.getElementById('cam_btn').style.setProperty('display','none')
            }
        }
        else{
            document.getElementById('accessory_alert').setAttribute('src',"assets/missing_camera_cn.png")
            document.getElementById('cam_btn').style.setProperty('display','none')
        }
    }
    else{
        document.getElementById('accessory_alert').setAttribute('src',"assets/permission_camera_cn.png")
        document.getElementById('cam_btn').style.setProperty('display','none')
    }
}
