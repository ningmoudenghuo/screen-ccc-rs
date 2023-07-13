## screen-ccc-rs

# 屏幕截图和录屏

# 利用navigator.mediaDevices.getDisplayMedia获取用户分享的屏幕源进行录屏和截图

# npm
npm install -S screen-ccc-rs

# git
https://github.com/ningmoudenghuo/screen-ccc-rs.git

# 使用方法
import screenRs from 'screen-ccc-rs'
import 'screen-ccc-rs/style.css' // 引入样式

const screenSharing = new screenRs();

screenSharing.record(); // 开始录屏

screenSharing.stopRecord(true); // 结束录屏，自动回放, 参数是个bool, 代表是否自动回放画面, 默认true

screenSharing.replay(videoDomId); // 手动回放, 传入回放的video的id

screenSharing.shot(); //截图