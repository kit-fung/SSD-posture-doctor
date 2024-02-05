function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
function set_class_style(Name,Attr,Val){
    temp = document.getElementsByClassName(Name)
    for(i = 0; i < temp.length; i++){temp[i].style.setProperty(Attr,Val)}
}
function get_label(){
    temp = document.getElementsByClassName('quality_label')
    for (let i = 0; i < temp.length; i++) {
        temp[i].style.setProperty('--T',0)
        temp[i].style.setProperty('transition','--T 0s')
    }
    setTimeout(() => {ran_int = getRandomInt(3);temp[ran_int].style.setProperty('--T',1);temp[ran_int].style.setProperty('transition','--T 0.3s');},0)
}
function set_gestures(Val){
    temp = document.getElementsByClassName('quality_label')
    for (let i = 0; i < temp.length; i++) {
        temp[i].style.setProperty('background-image',`assets/${temp[i].getAttribute('')}`)
        temp[i].style.setProperty('transition','--T 0s')
    }
}