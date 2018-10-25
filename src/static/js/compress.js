import AddEvents from './events'
const fs = window.require('fs') 
const Https = window.require('https')
// const imagemin = require('../../../node_modules/imagemin') 
const imagemin = require('imagemin') 
// const imageminJpegtran = require('imagemin-jpegtran')
// const imageminPngquant = require('imagemin-pngquant')


class Compress {
    constructor(files, options) {
        this.isOnline = window.navigator.onLine
        this.files = files
        this.options = Object.assign({
            userSavedPath: window.userSavedPath,
            createNewfolder: true
        }, options)
        this.uploadList = new Map()
        if(this.isOnline) {
            // this.onlineCompress()
            this.offlineCompress()
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

            return (last.set(uploadPromise, {}), last)
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
            Https.get(ServerData.output.url, (res) => {
                if(res.statusCode === 200) {
                    res.on('data', (d) => {
                        fs.writeFile(`${window.userSavedPath}/${file.name}`, d, e => {
                            if(e) {
                                console.error(e)
                                setState({
                                    state: 'error',
                                })
                            }
                        })

                        setState({
                            state: 'downloading',
                        })
                        console.log('正在下载中')
                    });
    
                    res.on('close', () => {
                        console.log('下载完成')
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


    offlineCompress() {
        // (async () => {
        //     let filePathList = this.files.map(file => file.path)
        //     const files = await imagemin(filePathList, this.options.userSavedPath, {
        //         plugins: [
        //             imageminJpegtran(),
        //             imageminPngquant({quality: '65-80'})
        //         ]
        //     });
         
        //     console.log(files);
        //     //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
        // })();
    }
}

AddEvents(Compress)
export default Compress