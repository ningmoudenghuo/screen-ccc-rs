class screenRs {
    constructor(options = { mimeType: "video/webm;codecs=vp8" }) {
        this.tracks = [];
        this.displayStream = null;
        this.mediaRecorder = null;
        this.options = options
        this.canvas = null
        this.ctx = null
        this.container = null
        this.toolDiv = null
        this.toolShot = null
        this.toolRecord = null
        this.videoReplay = null
        this.input = null
        this.cur_doing = ''
        this.curBtn = ''
        this.positions = {
            x: 0,
            y: 0
        }
        this.color = "red"
        this.text = ""
        this.step = 0
        this.canvasHistory = []
        this.init()
        this.dragging = false
        this.scale = 1
    }
    init() {
        //文字输入框
        this.input = document.createElement('div');
        this.input.setAttribute('id', 'textBox')
        this.input.setAttribute('contenteditable', true)
        this.input.setAttribute('placeholder', '请输入内容')
        this.input.style.position = 'fixed';
        this.input.style.fontSize = '20px';
        this.input.style.color = this.color;
        //创建容器
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.left = '0';
        this.container.style.top = '0';
        this.container.style.zIndex = '100000';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.background = 'rgba(0,0,0,0.5)';
        this.container.style.display = 'none';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        this.container.style.overflow = 'auto';
        //创建canvas标签，用于截图显示和下载
        this.canvas = document.createElement('canvas');
        //创建video标签，用于视频回放
        this.videoReplay = document.createElement('video');
        this.videoReplay.style.height = window.innerHeight * 0.9 + 'px';
        this.videoReplay.style.width = window.innerWidth * 0.9 + 'px';
        //工具栏
        this.toolDiv = document.createElement('div')
        this.toolDiv.style.position = 'absolute';
        this.toolDiv.style.left = '10px';
        this.toolDiv.style.top = '10px';
        //功能按钮
        let shotBtn = document.createElement('button')
        shotBtn.classList.add('ccc-btn')
        shotBtn.style.marginLeft = "10px"
        let svg_shot = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689901856063" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="1491" width="16" height="16"><path d="M715.98 634.01h80.07V308.02c0-21.61-7.94-40.35-23.83-56.24-15.89-15.89-34.63-23.83-56.24-23.83H389.99v80.07h325.99v325.99z m-407.96 81.97V64h-80.07v163.95H64v80.07h163.95v407.97c0 21.6 7.94 40.35 23.83 56.24 15.89 15.89 34.63 23.83 56.24 23.83h407.97V960h80.07V796.05H960v-80.07H308.02z" p-id="1492"></path></svg>
        &nbsp;<span>裁剪</span>
        </div>`
        shotBtn.innerHTML = svg_shot
        shotBtn.onclick = () => {
            this.removeBtnStatus()
            shotBtn.classList.add('active-btn')
            this.strokeShotRect()
        }
        let penBtn = document.createElement('button')
        penBtn.classList.add('ccc-btn')
        penBtn.style.marginLeft = "10px"
        let svg_pen = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689215698932" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="7206" width="16" height="16"><path d="M895.855 313.163l-78.107 78.107-185.04-185.041 78.07-78.107c26.508-26.51 53.017 0 53.017 0l132.06 132.022c0 0.001 26.509 26.51 0 53.019zM116.359 907.654l224.337-39.37-185.452-185.452-38.885 224.822z m64.902-249.993l185.066 185.066 423.009-423.009L604.27 234.652l-423.01 423.01z" p-id="7207"></path></svg>
        &nbsp;<span>画笔</span>
        </div>`
        penBtn.innerHTML = svg_pen
        penBtn.onclick = () => {
            this.removeBtnStatus()
            penBtn.classList.add('active-btn')
            this.strokeLine()
        }
        let rectBtn = document.createElement('button')
        rectBtn.classList.add('ccc-btn')
        rectBtn.style.marginLeft = "10px"
        let svg_rect = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689215650398" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="5871" width="16" height="16"><path d="M898.8 199.6v624.8H125.2V199.6h773.6m59.5-59.5H65.7v743.8h892.5V140.1h0.1z" p-id="5872"></path></svg>
        &nbsp;<span>矩形</span>
        </div>`
        rectBtn.innerHTML = svg_rect
        rectBtn.onclick = () => {
            this.removeBtnStatus()
            rectBtn.classList.add('active-btn')
            this.strokeRect()
        }
        let wordBtn = document.createElement('button')
        wordBtn.classList.add('ccc-btn')
        wordBtn.style.marginLeft = "10px"
        let svg_word = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689215577593" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="4839" width="16" height="16"><path d="M429.056 919.552h166.4l-0.512-1.024c-32.768-40.96-50.688-92.16-50.688-144.384V228.352h154.112c44.032 0 87.04 14.848 121.856 42.496l11.776 9.216V154.112s-128 20.48-319.488 20.48-321.024-20.48-321.024-20.48v125.44l8.192-6.656c35.328-28.672 79.36-44.544 124.928-44.544h155.648v545.28c0 52.736-17.92 103.424-50.688 144.384l-0.512 1.536z" fill="currentColor" p-id="4840"></path></svg>
        &nbsp;<span>文字</span>
        </div>`
        wordBtn.innerHTML = svg_word
        wordBtn.onclick = () => {
            this.removeBtnStatus()
            wordBtn.classList.add('active-btn')
            this.strokeWord()
        }
        let backBtn = document.createElement('button')
        backBtn.classList.add('ccc-btn')
        backBtn.style.marginLeft = "10px"
        let svg_back = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689215549677" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="3691" width="16" height="16"><path d="M704 320 231.552 320l141.504-141.376c12.032-11.968 12.032-31.36 0-43.328-12.032-12.032-31.424-12.032-43.456 0L135.296 329.344c-12.032 11.968-12.032 31.36 0 43.392L329.6 566.784c12.032 11.968 31.424 11.968 43.456 0 12.032-12.032 12.032-31.36 0-43.392L233.408 384 704 384c106.048 0 192 85.952 192 192s-85.952 192-192 192L288 768C270.336 768 256 782.336 256 800S270.336 832 288 832L704 832c141.376 0 256-114.624 256-256S845.376 320 704 320z" p-id="3692"></path></svg>
        &nbsp;<span>撤回</span>
        </div>`
        backBtn.innerHTML = svg_back
        backBtn.onclick = () => {
            this.goBack()
        }
        let downloadBtn = document.createElement('button')
        downloadBtn.classList.add('ccc-btn')
        downloadBtn.style.marginLeft = "10px"
        let svg_downlog = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689214502963" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="1486" width="16" height="16"><path d="M328 576h152V128h64v448h152L512 768 328 576z m568-64h-64v320H192V512h-64v384h768V512z" p-id="1487"></path></svg>
        &nbsp;<span>下载</span>
        </div>`
        downloadBtn.innerHTML = svg_downlog
        downloadBtn.onclick = () => {
            if (this.cur_doing == 'shot') {
                this.downloadImg()
            } else if (this.cur_doing == 'record') {
                this.downloadVideo()
            }
        }
        let closeBtn = document.createElement('button')
        closeBtn.classList.add('ccc-btn')
        closeBtn.style.marginLeft = "10px"
        let svg_close = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689215472725" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="2645" width="16" height="16"><path d="M512 128C300.8 128 128 300.8 128 512s172.8 384 384 384 384-172.8 384-384S723.2 128 512 128zM512 832c-179.2 0-320-140.8-320-320s140.8-320 320-320 320 140.8 320 320S691.2 832 512 832z" p-id="2646"></path><path d="M672 352c-12.8-12.8-32-12.8-44.8 0L512 467.2 396.8 352C384 339.2 364.8 339.2 352 352S339.2 384 352 396.8L467.2 512 352 627.2c-12.8 12.8-12.8 32 0 44.8s32 12.8 44.8 0L512 556.8l115.2 115.2c12.8 12.8 32 12.8 44.8 0s12.8-32 0-44.8L556.8 512l115.2-115.2C684.8 384 684.8 364.8 672 352z" p-id="2647"></path></svg>
        &nbsp;<span>关闭</span>
        </div>`
        closeBtn.innerHTML = svg_close
        closeBtn.onclick = () => {
            if (this.cur_doing == 'shot') {
                this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height)
            } else if (this.cur_doing == 'record') {
                this.tracks = [];
                this.videoReplay.src = ''
            }
            this.container.style.display = 'none'
            this.cur_doing = ''
            this.removeBtnStatus()
            this.offlisten()
        }
        this.toolShot = document.createElement('div')
        this.toolShot.appendChild(shotBtn)
        this.toolShot.appendChild(penBtn)
        this.toolShot.appendChild(rectBtn)
        this.toolShot.appendChild(wordBtn)
        this.toolShot.appendChild(backBtn)
        this.toolDiv.appendChild(downloadBtn)
        this.toolDiv.appendChild(closeBtn)
        this.toolDiv.appendChild(this.toolShot)
        this.container.appendChild(this.canvas);
        this.container.appendChild(this.toolDiv);
        this.container.appendChild(this.videoReplay);
        this.container.appendChild(this.input);
        document.body.appendChild(this.container);
    }
    getDisplayMedia() {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }).then(stream => {
                this.displayStream = stream;
                // 设置视频分辨率
                // const videoTrack = stream.getVideoTracks()[0];
                // const constraints = { width: 1920, height: 1080 };
                // videoTrack.applyConstraints(constraints)
                //   .then(function() {
                //     // 分辨率设置成功
                //     console.log('分辨率设置成功')
                //   })
                //   .catch(function(error) {
                //     // 分辨率设置失败
                //     console.log('分辨率设置失败')
                //   });
                this.mediaRecorder = new MediaRecorder(this.displayStream, this.options);
                this.mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        this.tracks.push(event.data); // 存储媒体数据
                    }
                };
                resolve();
            }).catch(err => {
                reject(err);
            })
        })
    }
    async shot() {
        this.cur_doing = 'shot'
        this.toolShot.style.display = 'inline-block'
        if (!this.displayStream) await this.getDisplayMedia()
        const video = document.createElement('video');
        video.classList.add('ccc-video');
        video.srcObject = this.displayStream;
        video.controls = false;
        const canvas = this.canvas
        const ctx = this.ctx = canvas.getContext("2d");
        let that = this
        video.addEventListener('canplay', function () {
            let canvasHeight = window.innerHeight * 0.9;
            let canvasWidth = window.innerHeight * 0.9 * this.videoWidth / this.videoHeight;
            let ratio = window.devicePixelRatio;
            that.scale = this.videoHeight / canvasHeight
            canvas.setAttribute('width', this.videoWidth * ratio)
            canvas.setAttribute('height', this.videoHeight * ratio)
            canvas.style.width = canvasWidth + "px";
            canvas.style.height = canvasHeight + "px";
            ctx.scale(ratio, ratio);
        });
        // 获取Canvas元素
        video.play();
        document.body.style.cursor = 'none'
        setTimeout(() => {
            // 创建一个2D绘图上下文
            ctx.drawImage(video, 0, 0);
            document.body.style.cursor = ''
            video.pause();
            this.stop()
            this.showContainer()
        }, 500)
    }
    offlisten() {
        this.canvas.onmousedown = () => { };
        this.canvas.onmouseup = () => { };
    }
    async strokeWord() {
        await this.offlisten();
        this.curBtn = 'word';
        // this.ctx.fillText('Hello world', 10, 50)
        const textBox = this.input
        const that = this;
        this.canvas.onmousedown = function mouseDownAction(e) {
            if (textBox.innerText) {
                that.addHistory();
                that.ctx.font = "20px Microsoft YaHei";
                that.ctx.fillStyle = that.color; // 填充颜色为红色
                that.ctx.strokeStyle = that.color; // 画笔的颜色
                that.ctx.lineWidth = 5; // 指定描边线的宽度
                var rect = that.input.getBoundingClientRect();
                var max_width = that.canvas.getBoundingClientRect().width - rect.width
                console.log(max_width)
                that.ctx.fillText(
                    textBox.innerText,
                    that.positions.x * that.scale < max_width ? that.positions.x * that.scale : max_width,
                    that.positions.y * that.scale < 20 ? 20 : that.positions.y * that.scale
                );
                textBox.style.display = "none";
                textBox.innerText = "";
                that.text = "";
                return;
            }
            that.positions.x = e.offsetX;
            that.positions.y = e.offsetY;
            textBox.style.left = e.offsetX + that.canvas.getBoundingClientRect().left + "px";
            textBox.style.top = e.offsetY + that.canvas.getBoundingClientRect().top - 20 + "px";
            textBox.style.display = "block";
            setTimeout(() => {
                textBox.focus();
            });
        };
    }
    async strokeRect() {
        await this.offlisten();
        this.curBtn = 'rect';
        this.clear();
        let postx = {
            startX: 0,
            endX: 0,
            startY: 0,
            endY: 0,
        };
        const that = this;
        this.canvas.onmousedown = function mouseDownAction(e) {
            postx.startX = e.offsetX;
            postx.startY = e.offsetY;
            that.addHistory();
            that.ctx.fillStyle = "red"; // 填充颜色为红色
            that.ctx.strokeStyle = that.color; // 画笔的颜色
            that.ctx.lineWidth = 5; // 指定描边线的宽度
            that.dragging = true
            console.log(that.scale)
        };
        this.canvas.onmousemove = function mouseMove(event) {
            if (!that.dragging) return
            that.ctx.putImageData(that.canvasHistory[that.canvasHistory.length - 1].data, 0, 0);
            that.ctx.beginPath();
            that.ctx.strokeRect(
                postx.startX * that.scale,
                postx.startY * that.scale,
                (event.offsetX - postx.startX) * that.scale,
                (event.offsetY - postx.startY) * that.scale
            );
        }
        this.canvas.onmouseup = function mouseUp(e) {
            that.dragging = false
            that.ctx.closePath();
        };
    }
    async strokeLine() {
        await this.offlisten();
        this.curBtn = 'line';
        const that = this;
        this.ctx.fillStyle = "#FF0000";
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = this.color; //将画笔设置为红色
        let x = undefined;
        let y = undefined;
        this.canvas.onmousedown = function (event) {
            x = event.offsetX;
            y = event.offsetY;

            that.addHistory();
            document.onmousemove = function (event) {
                var x1 = event.offsetX;
                var y1 = event.offsetY;
                // this.huabi(x, y, x1, y1, ctx);
                that.ctx.beginPath();
                that.ctx.globalAlpha = 1;
                that.ctx.lineWidth = 5;
                that.ctx.strokeStyle = that.color;
                that.ctx.moveTo(x * that.scale, y * that.scale);
                that.ctx.lineTo(x1 * that.scale, y1 * that.scale);
                that.ctx.closePath();
                that.ctx.stroke();
                x = x1;
                y = y1;
            };
        };

        document.onmouseup = function () {
            this.onmousemove = null;
        };
    }
    async strokeShotRect() {
        await this.offlisten();
        this.clear();
        this.curBtn = 'shotRect';
        let postx = {
            startX: 0,
            endX: 0,
            startY: 0,
            endY: 0,
        };
        const that = this;
        this.canvas.onmousedown = function mouseDownAction(e) {
            postx.startX = e.offsetX;
            postx.startY = e.offsetY;
            that.addHistory();
            // 设置线条样式为虚线
            that.ctx.setLineDash([5, 3]); // 设置线条为5个像素实线，3个像素空白
            that.ctx.strokeStyle = "#81d4fa"; // 画笔的颜色
            that.ctx.lineWidth = 2; // 指定描边线的宽度
            that.dragging = true
        };
        this.canvas.onmousemove = function mouseMove(event) {
            if (!that.dragging) return
            that.ctx.putImageData(that.canvasHistory[that.canvasHistory.length - 1].data, 0, 0);
            that.ctx.beginPath();
            that.ctx.strokeRect(
                postx.startX * that.scale,
                postx.startY * that.scale,
                (event.offsetX - postx.startX) * that.scale,
                (event.offsetY - postx.startY) * that.scale
            );
        }
        this.canvas.onmouseup = function mouseUp(e) {
            that.dragging = false
            that.ctx.closePath();
            that.ctx.putImageData(that.canvasHistory[that.canvasHistory.length - 1].data, 0, 0);
            let ratio = window.devicePixelRatio;
            let startX = postx.startX * that.scale * ratio;
            let startY = postx.startY * that.scale * ratio;
            let endX = Math.abs((e.offsetX - postx.startX) * that.scale * ratio);
            let endY = Math.abs((e.offsetY - postx.startY) * that.scale * ratio);
            if (e.offsetX < postx.startX) {
                startX = e.offsetX * that.scale * ratio;
                startY = e.offsetY * that.scale * ratio;
            }
            var data = that.ctx.getImageData(startX, startY, endX, endY);
            that.ctx.clearRect(0, 0, that.canvas.width / ratio, that.canvas.height / ratio);
            that.canvas.width = endX;
            that.canvas.height = endY;
            that.ctx.putImageData(data, 0, 0);
            that.canvas.style.width = endX / ratio / that.scale + "px";
            that.canvas.style.height = endY / ratio / that.scale + "px";
            that.ctx.scale(ratio, ratio);
        };
    }
    async goBack() {
        await this.clear();
        // await this.offlisten();
        if (this.canvasHistory.length) {
            let that = this;
            let last = this.canvasHistory.pop()
            let size = last.size
            let cssSize = last.cssSize
            let canvasPic = last.data
            that.canvas.width = size[0];
            that.canvas.height = size[1];
            that.canvas.style.width = cssSize[0];
            that.canvas.style.height = cssSize[1];
            that.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            that.ctx.putImageData(canvasPic, 0, 0);
        } else {
            alert("不能再撤回了");
        }
    }
    clear() {
        // 去掉所有绘制
        this.input.style.display = "none";
    }
    removeBtnStatus() {
        var btns = this.toolShot.childNodes
        Array.from(btns).forEach(btn => {
            btn.classList.remove('active-btn')
        })
        this.curBtn = ''
    }
    addHistory() {
        this.canvasHistory.push(
            {
                size: [this.canvas.width, this.canvas.height],
                cssSize: [this.canvas.style.width, this.canvas.style.height],
                data: this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
            }
        );
    }
    isMark() {
        // 有长度就是有标记
        return this.canvasHistory.length;
    }
    async record() {
        this.cur_doing = 'record'
        this.toolShot.style.display = 'none'
        if (!this.displayStream) await this.getDisplayMedia()
        this.mediaRecorder.start()
    }
    stopRecord(bool) {
        if (!this.mediaRecorder) return
        this.stop()
        this.showContainer()
        if (bool) {
            setTimeout(() => {
                this.replay()
            }, 200)
        }
    }
    showContainer() {
        if (this.cur_doing == 'record') {
            this.canvas.style.display = 'none'
            this.videoReplay.style.display = 'block'
        } else if (this.cur_doing == 'shot') {
            this.videoReplay.style.display = 'none'
            this.canvas.style.display = 'block'
        }
        this.container.style.display = 'flex'
    }
    downloadVideo(filename = 'record.webm') {
        const blob = new Blob(this.tracks, { type: this.tracks[0].type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }
    stop() {
        this.mediaRecorder && this.mediaRecorder.stop()
        if (this.displayStream) {
            this.displayStream.getTracks().forEach(track => track.stop());
            this.displayStream = null;
            this.mediaRecorder = null;
        }
    }
    downloadImg(filename = 'shot.jpeg') {
        const url = this.canvas.toDataURL('image/jpeg', 1)
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }
    replay(id) {
        let video;
        if (id) {
            video = document.getElementById(id);
        } else {
            video = this.videoReplay
        }
        const blob = new Blob(this.tracks, { type: this.tracks[0].type });
        video.src = window.URL.createObjectURL(blob);
        video.srcObject = null;
        video.controls = true;
        video.play();
    }
}
export default screenRs