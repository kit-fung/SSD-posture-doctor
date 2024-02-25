let video
let stream
var main_canvas
let label = "waiting..."
let confidence = null
let sec_label = null
let sec_confidence = null
let classifier = {}
var cur_mouse
var cur_accessories = {}
//var pager = {'cur_page':'main','scroll':{'main':0,'album':30},'pre_scroll':{'main':0,'album':30}}
var pager = {}
var global_var = {'gender' : 'm', 'cur_posture':'auto','skin_tone':{'r': 255, 'g':220,'b': 200},'getting_canvas_color':Array(),'pre_getting_canvas_color_state':false,'curFacingMode':'user'}
let obj_classifiers = {'auto':"UjzJujuZr"}
let score_map = {'auto':{'label':'fist','well':0.8,'good':0.5}}
var img_tally = {}
var listInterval = {mouse1DownID:Array(),mouse1DownEle:{}}
function update_canvas(){resizeCanvas(min(max(window.innerWidth * 0.75,900),window.innerWidth),window.innerHeight)}
window.addEventListener('resize', function(){update_canvas()}, true);

function preload(){
    update_accessories()
    /*navigator.permissions.query({ name: 'camera' }).then((permissionStatus) => {
            console.log(`camera permission status is ${permissionStatus.state}`);
            permissionStatus.onchange = () => {
                console.log(`camera permission status has changed to ${permissionStatus.state}`,)
            }
    })*/// not implemented camera detection
    window.addEventListener('online',() => {cur_accessories['internet'] = navigator.onLine})
    window.addEventListener('offline',() => {cur_accessories['internet'] = navigator.onLine})
    window.addEventListener('mousemove',(e) => {cur_mouse = e})
    window.addEventListener('mouseup',(e)=>{
        if (e.button % 2 == 0){
            listInterval['mouse1DownID'].forEach((_id)=>{clearInterval(_id);eleMouseUp(listInterval['mouse1DownEle'][_id],e)})
        }
        listInterval['mouse1DownID'].length = 0
    })// unused
    let temp_array = document.getElementsByClassName('skin_tone_viewer')
    for (let i = 0; i < temp_array.length; i++){
        temp_array[i].style.setProperty('--r',global_var['skin_tone']['r'])
        temp_array[i].style.setProperty('--g',global_var['skin_tone']['g'])
        temp_array[i].style.setProperty('--b',global_var['skin_tone']['b'])
    }
}

function AddClassifier(key) {
    if (!(key in classifier)){
        console.log(obj_classifiers[key])
        classifier[key] = ml5.imageClassifier(`https://teachablemachine.withgoogle.com/models/${obj_classifiers[key]}/model.json`);
    }
}
async function setCameraConstraint(_facingMode = null){
    /*stream = await navigator.mediaDevices.getUserMedia({video: {width: 1920*10, height: 1080*10}})
    console.log(stream.getVideoTracks()[0].getSettings())
    video = createCapture({video: stream.getVideoTracks()[0].getSettings()},
    (_stream) => {cur_accessories['permit_camera'] = true; console.log(video)})
    video.hide();
    video.id('viewport')*/
    if(video){video.remove()} // see if this removes camera permission or persistence
    let _constraint
    _constraint = _constraint = {video: {width: 1920*10, height: 1080*10, frameRate: { min: 1, max: 360 }}}
    if (_facingMode){_constraint['video']['facingMode'] =  _facingMode}
    global_var['curFacingMode'] = _facingMode
    cur_accessories['loading_camera'] = true
    if (_facingMode){global_var['curFacingMode'] = _facingMode;_constraint['video']['facingMode'] =  {ideal : _facingMode}}
    video = await createCapture(_constraint,
        (_stream) => {cur_accessories['permit_camera'] = true; cur_accessories['loading_camera'] = false; stream = _stream;console.log(stream.getVideoTracks()[0].getSettings(),stream.getVideoTracks()[0].getSettings().frameRate);console.log(video);
        frameRate(stream.getVideoTracks()[0].getSettings().frameRate)})
    video.hide();
    video.id('viewport')
}
function setup() {
    main_canvas = createCanvas(0, 0)
    update_canvas()
    main_canvas.id('main_canvas')
    main_canvas.parent('main_canvas_wrapper')
    //document.getElementById('main_canvas').addEventListener('mousedown',(e)=>{eleMouseDown('canvas',e);let _id = setInterval(eleMouseDowning,10,'canvas',e); listInterval['mouse1DownEle'][_id] = 'canvas';listInterval['mouse1DownID'].push(_id)})
    
    //console.log("internet:",navigator.onLine)
    cur_accessories['internet'] = navigator.onLine
    cur_accessories['permit_camera'] = false
    cur_accessories['found_camera'] = false
    
    setCameraConstraint(global_var['curFacingMode'])
}

function classifyVideo(key) {
    if (key in obj_classifiers){
        console.log("classifying:",key)
        AddClassifier(key)
        let temp_key = video.canvas.toDataURL('image/jpeg',1.0)
        classifier[key].classify(video, gotResults)
        .then((t)=>{
            img_tally[temp_key] = {'img':loadImage(temp_key),'result':t,'posture':global_var['cur_posture']}
            const _frame = document.createElement('div')
            const _canvas = document.createElement('canvas')
            //const _decor = document.createElement('div')
            _frame.classList.add('frame')
            _canvas.setAttribute('width',`${stream.getVideoTracks()[0].getSettings().width}`)
            _canvas.setAttribute('height',`${stream.getVideoTracks()[0].getSettings().height}`)
            //console.log(temp_key)
            _canvas.setAttribute('data-img',`${temp_key}`)
            _canvas.setAttribute('onclick',`shareImage(this.getAttribute('data-img'))`)
            _canvas.style.setProperty('width','20%')
            //_canvas.style.setProperty('aspect-ratio',`${stream.getVideoTracks()[0].getSettings().aspectRatio}`)
            _canvas.style.setProperty('box-shadow',`inset 0 0 10px #000`)
            const _img = new Image
            _img.src = temp_key
            _img.onload = () => {_canvas.getContext("2d").drawImage(_img,0,0)}
            //_decor.classList.add('decor')
            //_canvas.appendChild(_decor)
            _frame.appendChild(_canvas)
            document.getElementById('album_wrapper').appendChild(_frame)
        },(f)=>{console.log(f)})
    }
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
    for(let i = 0; i < results.length; i++){
        if (results[i].label == score_map[global_var['cur_posture']]['label']){
            get_label(results[i].confidence)
        }
    }
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
    if(video && video.width >= 1 && video.height >= 1) {
        cur_accessories['found_camera'] = true
        if (pager['cur_page'] == 'main'){
            image(video, 0, 0.5 * (height - width * video.height / video.width), width, width * video.height / video.width)
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
        }
        else if (pager['cur_page'] == 'album'){
            /*if(Object.keys(img_tally).length >= 1){
                let temp_scale = 0.2
                let temp_length = Object.keys(img_tally).length
                //let cur_scroll = pager['scroll'][pager['cur_page']]
                for(let i = 0,x=0,y = 0; i < temp_length;){
                    image(img_tally[Object.keys(img_tally)[temp_length - i - 1]]['img'], width * temp_scale * x, y * width * video.height / video.width * temp_scale, width * temp_scale, width * video.height / video.width * temp_scale)
                    i++
                    x++
                    if(width * temp_scale * x >= width){x = 0, y++}
                }
            }*/
        }
    }
    else{
        cur_accessories['found_camera'] = false
    }

    if(global_var['getting_canvas_color'].length >= 1){
        if (!global_var['pre_getting_canvas_color_state']){
            global_var['pre_getting_canvas_color_state'] = true
            document.getElementById('canvas_color_pick_field').classList.add('picking_color_show')
            document.getElementById('canvas_color_pick_viewer').classList.add('picking_color_show')
            document.getElementById('right_wrapper').classList.add('picking_color_hide')
        }
        let temp_rect = main_canvas.canvas.getBoundingClientRect()
        let color_key = global_var['getting_canvas_color'][0]
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
        if (global_var['pre_getting_canvas_color_state']){
            global_var['pre_getting_canvas_color_state'] = false
            document.getElementById('canvas_color_pick_field').classList.remove('picking_color_show')
            document.getElementById('canvas_color_pick_viewer').classList.remove('picking_color_show')
            document.getElementById('right_wrapper').classList.remove('picking_color_hide')
        }
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
    console.log(document.querySelector('.quality_label'))
    setTimeout(() => {key_score = interpret_score(global_var['cur_posture'],score);
    temp[key_score].style.setProperty('--T',1);temp[key_score].style.setProperty('transition','--T 0.3s');},0)
}
function interpret_score(posture,score){
    return score >= score_map[posture]['well'] ? 0 : (score >= score_map[global_var['cur_posture']]['good'] ? 1 : 2)
}
function set_gestures(Val){
    temp = document.getElementsByClassName('posture_item')
    for (let i = 0; i < temp.length; i++) {
        temp[i].style.setProperty('background-image',`url(assets/posture_${temp[i].getAttribute('data-posture')}_${Val}.png)`)
        if(temp[i].style.getPropertyValue('--u') == 1)
        {document.getElementById('selected_posture').style.setProperty('background-image',`url(assets/posture_${temp[i].getAttribute('data-posture')}_${Val}.png)`)}
    }
}
function update_accessories(){
    if(cur_accessories['permit_camera']){
        if(!cur_accessories['loading_camera']){
            if(cur_accessories['found_camera']){
                if(cur_accessories['internet']){
                    document.getElementById('accessory_alert').setAttribute('src',"")
                    document.getElementById('cam_btn').classList.remove('accessory_fail')
                    document.getElementById('right_wrapper').classList.remove('accessory_fail')
                }
                else{
                    document.getElementById('accessory_alert').setAttribute('src',"assets/no-access_internet_cn.png")
                    document.getElementById('cam_btn').classList.add('accessory_fail')
                    document.getElementById('right_wrapper').classList.add('accessory_fail')
                }
            }
            else{
                document.getElementById('accessory_alert').setAttribute('src',"assets/missing_camera_cn.png")
                document.getElementById('cam_btn').classList.add('accessory_fail')
                document.getElementById('right_wrapper').classList.add('accessory_fail')
            }
        }
        else{
            document.getElementById('accessory_alert').setAttribute('src',"assets/loading_camera_cn.png")
            document.getElementById('cam_btn').classList.add('accessory_fail')
            document.getElementById('right_wrapper').classList.add('accessory_fail')
        }
    }
    else{
        document.getElementById('accessory_alert').setAttribute('src',"assets/permission_camera_cn.png")
        document.getElementById('cam_btn').classList.add('accessory_fail')
        document.getElementById('right_wrapper').classList.add('accessory_fail')
    }
}
function after(){
    set_page('main')
    const share_ui = document.querySelector('.share_ui')
    const share_overlay = document.querySelector('.share_overlay')
    const share_button = document.querySelector('.share_this')
    share_button.addEventListener('click',() => {shareImage(Object.keys(img_tally)[Object.keys(img_tally).length - 1])})
    share_overlay.addEventListener('click',() => {
        share_overlay.classList.remove('show_fallback_share')
        share_ui.classList.remove('show_fallback_share')
    })
}
async function createFile(_data,_name = null){
    var arr = _data.split(','), _format = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    //console.log(_data)
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr],`${_name == null ? 'null' : _name}.${_format.split('/')[1]}`,{type:_format})
}
async function shareImage(_data, _name = null){
    const IMG_KEY = _data// will be updated to enable image editing, {img_key: {history:[mod1,mod2],edited_img:key}}
    const SHARE_DATA = {
            title:'我的姿勢',
            url:window.document.location.href,
            text:`我得到 - ${Array('佳!','良','劣')[interpret_score(img_tally[IMG_KEY]['posture'],img_tally[IMG_KEY]['result'].find((bracket)=>bracket['label'] == score_map[img_tally[IMG_KEY]['posture']]['label'])['confidence'])]}`,
            files: Array(await createFile(IMG_KEY)) // is the async await here useful?
    }
    console.log(SHARE_DATA)
    if (navigator.share && navigator.canShare && navigator.canShare(SHARE_DATA)){
        console.log('has share api')
        navigator.share(SHARE_DATA).then(() => {console.log('share success?')}).catch((error)=>{console.log(error)})
    }
    else{
        console.log('doesn\'t have share api')
        share_overlay.classList.add('show_fallback_share')
        share_ui.classList.add('show_fallback_share')
    }
}
function set_page(_index){
    if (pager['cur_page'] == _index){return;}
    if (pager['cur_page'] == null || pager['cur_page'] == 'main'){
        document.querySelectorAll('[data-page="main"]').forEach((ele)=>{ele.classList.add('page_hide')})
    }
    if (pager['cur_page'] == null || pager['cur_page'] == 'album'){
        document.querySelectorAll('[data-page="album"]').forEach((ele)=>{ele.classList.add('page_hide')})
    }
    pager['cur_page'] = _index
    if (pager['cur_page'] == 'main'){
        document.querySelectorAll('[data-page="main"]').forEach((ele)=>{ele.classList.remove('page_hide')})
        document.querySelector('#left_btn').innerHTML = '相冊'
        document.querySelector('#left_btn').setAttribute('onclick','set_page("album")')
    }
    else if (pager['cur_page'] == 'album'){
        document.querySelectorAll('[data-page="album"]').forEach((ele)=>{ele.classList.remove('page_hide')})
        document.querySelector('#left_btn').innerHTML = '攝影'
        document.querySelector('#left_btn').setAttribute('onclick','set_page("main")')
    }
}
/*
function eleMouseDown(ele,initMouse){
    //console.log(initMouse)
    //pager['startMouseDown'] = new Date()
}
function eleMouseDowning(ele,initMouse){
    //console.log(initMouse)
    if (ele == 'canvas'){
        if(initMouse && !pager['isDragging']){
            if(performance.now()-initMouse.timeStamp > 50000){
                console.log('drag')
                pager['isDragging'] = true
                pager['pre_scroll'][pager['cur_page']] = pager['scroll'][pager['cur_page']]
            }
            if(cur_mouse){
                let _dx = cur_mouse.clientX - initMouse.clientX
                let _dy = cur_mouse.clientY - initMouse.clientY
                if(_dx * _dx + _dy * _dy > 100){
                    console.log('drag')
                    pager['isDragging'] = true
                    pager['pre_scroll'][pager['cur_page']] = pager['scroll'][pager['cur_page']]
                }
            }
        }
        if(pager['isDragging']){
            if(pager['cur_page'] == 'album'){
                pager['scroll']['album'] = max(0,pager['pre_scroll']['album'] + cur_mouse.clientX - initMouse.clientX)
            }
        }
    }
}
function eleMouseUp(ele,initMouse){
    console.log(initMouse)
    if (ele == 'canvas'){
        if (pager['isDragging']){
            pager['isDragging'] = false
        }
    }
}*/
