import AddEvents from './events'
// import imagemin from 'imagemin'
const fs = window.require('fs') 
const Https = window.require('https')
const imagemin = window.imagemin
const imageminJpegtran = window.imageminJpegtran
const imageminPngquant = window.imageminPngquant
const imageminGifsicle = window.imageminGifsicle

class Compress {
    constructor(files, options) {
        this.isOnline = window.navigator.onLine
        console.log(files)
        this.files = files

        this.options = Object.assign({
            userSavedPath: window.userSavedPath,
            createNewfolder: true
        }, options)

        this.uploadList = new Map()

        if(this.isOnline) {
            this.onlineCompress()
            // this.offlineCompress()
        } else {
            this.offlineCompress()
        }
    }

    getUploadList() {
        return this.uploadList
    }

    onlineCompress() {
        this.uploadList = this.files.reduce((last, file) => {
            let uploadPromise = this.uploadFileToServer(file)
            
            uploadPromise.then((xhrResponse => {
                return this.downloadToLocal(xhrResponse, uploadPromise, file)
            }))

            last.set(uploadPromise, {})
            return last
        }, new Map())

        Promise.all(this.uploadList.keys()).then(data => {
            console.log('全部压缩完成')
        }).catch(e => {
            console.log(e)
        }).finally(data => {
            this.dispatchEvent('allDone')
        })
    }

    uploadFileToServer(file) {
        const xhrPromise = new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.open("POST", "https://tinypng.com/web/shrink")

            const setState = (obj) => {
                obj = Object.assign({
                    name: file.name,
                    state: 'upload',
                    progress: 0,
                    isDone: false
                }, this.uploadList.get(xhrPromise), obj) 

                this.uploadList.set(xhrPromise, obj)

                this.dispatchEvent('stateChange', obj)
            }

            xhr.upload.onprogress = (e) => {
                if(e.type === "progress") {
                    let progress = (e.loaded / e.total * 100).toFixed(0)
                    let state = {}
                    if(progress < 100) {
                        state = {
                            progress,
                            state: 'uploading'
                        }
                    } else {
                        state = {
                            progress,
                            state: 'compressing'
                        }
                    }
                    setState(state)
                }
            }

            xhr.onabort = (e) => {
                console.log('onabort', arguments)
                setState({
                    progress: 0,
                    state: 'cancel'
                })
                reject(e)
            }

            xhr.onerror = function(e) {
                console.error('onerror', arguments)
                setState({
                    state: 'error'
                })
                reject(e)
            }
 
            xhr.onload = function (event) {
                if(event.target.status === 201) {
                    setState({
                        state: 'compressed'
                    })
                    resolve(JSON.parse(event.target.responseText))
                } else {
                    reject(event.target)
                }
            }
                
            xhr.send(file)    
        })

        return xhrPromise
    }

    downloadToLocal(ServerData, xhrPromise, file) {

        const setState = (state) => {
            state = Object.assign({
                progress: 100,
                isDone: false,
                state: 'downloading',
                name: file.name
            }, state)

            this.uploadList.set(xhrPromise, state)
            this.dispatchEvent('stateChange', state)
        }

        return new Promise((resolve, reject) => {
            Https.get(ServerData.output.url, (res, req) => {
                res.setEncoding('binary')
                if(res.statusCode === 200) {
                    let imgData = ''
                    res.on('data', (d) => {
                        imgData += d
                        setState({
                            state: 'downloading',
                        })
                        console.log('正在下载中')
                    });

                    res.on('end', () => {
                        fs.writeFile(`${window.userSavedPath}/${file.name}`, imgData, 'binary', e => {
                            if(e) {
                                console.error(e)
                                setState({
                                    state: 'error',
                                })
                            } else {
                                console.log('保存成功')
                            }
                        })
                        setState({
                            isDone: true,
                            state: 'downloaded',
                        })
                        resolve('下载完成')
                    })
                }
            }).on('error', (e) => {
                console.error(e);
                setState({
                    isDone: true,
                    state: 'error',
                })
                reject('下载失败')
            })
        })
    }

    async offlineCompress() {
        console.log(this.files)
        let paths = this.files.map(file => file.path)
        console.log(paths)
        await imagemin(paths, window.userSavedPath, {
            use: [
                imageminGifsicle(),
                imageminPngquant(),
                imageminJpegtran()
            ]
        });
    }
}

AddEvents(Compress)
export default Compress