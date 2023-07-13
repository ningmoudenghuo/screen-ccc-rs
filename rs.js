import screenRs from './index.js'
// 创建screenRs实例并开始屏幕共享
const screenSharing = new screenRs();
function record() {
    screenSharing.record();
}
function stopRecord() {
    screenSharing.stopRecord(true);
}
function shot() {
    screenSharing.shot();
}
var btn1 = document.getElementById('bnt1');
var btn2 = document.getElementById('bnt2');
var btn3 = document.getElementById('bnt3');
btn1.onclick = record;
btn2.onclick = stopRecord;
btn3.onclick = shot;

