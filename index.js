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
        let penBtn = document.createElement('button')
        penBtn.style.marginLeft = "10px"
        let svg_pen = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689215698932" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="7206" width="16" height="16"><path d="M895.855 313.163l-78.107 78.107-185.04-185.041 78.07-78.107c26.508-26.51 53.017 0 53.017 0l132.06 132.022c0 0.001 26.509 26.51 0 53.019zM116.359 907.654l224.337-39.37-185.452-185.452-38.885 224.822z m64.902-249.993l185.066 185.066 423.009-423.009L604.27 234.652l-423.01 423.01z" p-id="7207"></path></svg>
        &nbsp;<span>画笔</span>
        </div>`
        penBtn.innerHTML = svg_pen
        penBtn.onclick = () => {
            this.strokeLine()
        }
        let rectBtn = document.createElement('button')
        rectBtn.style.marginLeft = "10px"
        let svg_rect = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689215650398" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="5871" width="16" height="16"><path d="M898.8 199.6v624.8H125.2V199.6h773.6m59.5-59.5H65.7v743.8h892.5V140.1h0.1z" p-id="5872"></path></svg>
        &nbsp;<span>矩形</span>
        </div>`
        rectBtn.innerHTML = svg_rect
        rectBtn.onclick = () => {
            this.strokeRect()
        }
        let wordBtn = document.createElement('button')
        wordBtn.style.marginLeft = "10px"
        let svg_word = `<div style="display: flex;justify-content: space-between;align-items: center">
        <svg t="1689215577593" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" p-id="4839" width="16" height="16"><path d="M429.056 919.552h166.4l-0.512-1.024c-32.768-40.96-50.688-92.16-50.688-144.384V228.352h154.112c44.032 0 87.04 14.848 121.856 42.496l11.776 9.216V154.112s-128 20.48-319.488 20.48-321.024-20.48-321.024-20.48v125.44l8.192-6.656c35.328-28.672 79.36-44.544 124.928-44.544h155.648v545.28c0 52.736-17.92 103.424-50.688 144.384l-0.512 1.536z" fill="currentColor" p-id="4840"></path></svg>
        &nbsp;<span>文字</span>
        </div>`
        wordBtn.innerHTML = svg_word
        wordBtn.onclick = () => {
            this.strokeWord()
        }
        let backBtn = document.createElement('button')
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
        }
        this.toolShot = document.createElement('div')
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
        this.toolShot.style.display='inline-block'
        document.body.style.cursor = 'none'
        if (!this.displayStream) await this.getDisplayMedia()
        const video = document.createElement('video');
        video.classList.add('ccc-video');
        video.srcObject = this.displayStream;
        video.controls = false;
        const canvas = this.canvas
        const ctx = this.ctx = canvas.getContext("2d");
        video.addEventListener('canplay', function () {
            let canvasHeight = window.innerHeight * 0.9;
            let canvasWidth = window.innerHeight * 0.9 * this.videoWidth / this.videoHeight;
            canvas.setAttribute('width', canvasWidth)
            canvas.setAttribute('height', canvasHeight)
            // ctx.scale(canvasWidth / this.videoWidth, canvasHeight / this.videoHeight);
        });
        // 获取Canvas元素
        video.play();
        setTimeout(() => {
            // 创建一个2D绘图上下文
            ctx.drawImage(video, 0, 0);
            document.body.style.cursor = ''
            // var pattern = ctx.createPattern(canvas, "no-repeat");
            // ctx.fillStyle = pattern;
            // ctx.fillRect(0, 0, canvas.width, canvas.height);
            video.pause();
            this.stop()
            this.showBtn()
            this.showContainer()
        }, 500)
    }
    offlisten() {
        this.canvas.onmousedown = () => { };
        this.canvas.onmouseup = () => { };
    }
    async strokeWord() {
        await this.offlisten();
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
                that.ctx.fillText(
                    textBox.innerText,
                    that.positions.x < max_width ? that.positions.x : max_width,
                    that.positions.y < 20 ? 20 : that.positions.y
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
    async fillY() {
        await this.offlisten();
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
        };
        this.canvas.onmouseup = function mouseUp(e) {
            postx.endX = e.offsetX;
            postx.endY = e.offsetY;
            that.ctx.fillStyle = "red"; // 填充颜色为红色
            that.ctx.strokeStyle = that.color; // 画笔的颜色
            that.ctx.lineWidth = 5; // 指定描边线的宽度
            that.ctx.beginPath();
            const length = Math.sqrt(
                Math.pow(postx.startX - postx.endX, 2) +
                Math.pow(postx.startY - postx.endY, 2)
            );

            that.ctx.arc(postx.startX, postx.startY, length, 0, 2 * Math.PI);
            that.ctx.stroke();
            that.ctx.closePath();
            postx = {
                startX: 0,
                endX: 0,
                startY: 0,
                endY: 0,
            };
        };
    }
    async strokeRect() {
        await this.offlisten();
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
            // document.onmousemove = function (event) {
            //     if (!that.dragging) return
            //     // this.canvasHistory.length && that.ctx.putImageData(this.canvasHistory[this.canvasHistory.length - 1], 0, 0)
            //     that.ctx.beginPath();
            //     that.ctx.strokeRect(
            //         postx.startX,
            //         postx.startY,
            //         event.offsetX - postx.startX,
            //         event.offsetY - postx.startY
            //     );
            // };
        };
        this.canvas.onmousemove = function mouseMove(event) {
            if (!that.dragging) return
            that.ctx.putImageData(that.canvasHistory[that.canvasHistory.length - 1], 0, 0);
            that.ctx.beginPath();
            that.ctx.strokeRect(
                postx.startX,
                postx.startY,
                event.offsetX - postx.startX,
                event.offsetY - postx.startY
            );
        }
        this.canvas.onmouseup = function mouseUp(e) {
            that.dragging = false
            postx.endX = e.offsetX;
            postx.endY = e.offsetY;
            // that.ctx.fillStyle = "red"; // 填充颜色为红色
            // that.ctx.strokeStyle = that.color; // 画笔的颜色
            // that.ctx.lineWidth = 5; // 指定描边线的宽度

            that.ctx.beginPath();
            that.ctx.strokeRect(
                postx.startX,
                postx.startY,
                postx.endX - postx.startX,
                postx.endY - postx.startY
            );

            that.ctx.closePath();
            postx = {
                startX: 0,
                endX: 0,
                startY: 0,
                endY: 0,
            };
        };
    }
    async strokeLine() {
        await this.offlisten();
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
                that.ctx.moveTo(x, y);
                that.ctx.lineTo(x1, y1);
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
    async goBack() {
        await this.clear();
        await this.offlisten();
        if (this.canvasHistory.length) {
            let that = this;
            let canvasPic = this.canvasHistory.pop()
            that.ctx.putImageData(canvasPic, 0, 0);
        } else {
            alert("不能再撤回了");
        }
    }
    clear() {
        // 去掉所有绘制
        this.input.style.display = "none";
    }
    addHistory() {
        this.canvasHistory.push(
            // this.canvas.toDataURL("image/png")
            this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        );
    }
    isMark() {
        // 有长度就是有标记
        return this.canvasHistory.length;
    }
    showBtn() {

    }
    async record() {
        this.cur_doing = 'record'
        this.toolShot.style.display='none'
        if (!this.displayStream) await this.getDisplayMedia()
        this.mediaRecorder.start()
    }
    stopRecord(bool) {
        if (!this.mediaRecorder) return
        this.stop()
        this.showContainer()
        if(bool){
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