import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import DirManager from './components/dir_manager/dir_manager'
import Progress from 'antd/lib/progress'
import 'antd/lib/progress/style/css'
import './App.scss'

// const electron = window.require('electron')
// const process = window.require('process')
const fs = window.require('fs')
const Https = window.require('https')
const uploadIcon = require('./static/images/upload.svg')

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            uploadList: new Map()
        }
    }

    onDrop(acceptedFiles) {
        this.setState({
            uploadList: new Map()
        })
        this.imageFiles = acceptedFiles.filter(
            file => /^image\/(png|jpg|jpeg)$/.test(file.type)
        ).filter(
            file => file.size < 1024 * 1024 * 5
        )

        this.uploadFiles()
    }

    uploadFiles() {
        let map = new Map()

        this.imageFiles.forEach(file => {
            map.set(this.uploadFileToServer(file), {})
        })
        this.setState({
            uploadList: map
        })

        Promise.all(map.keys()).then(() => {
            console.log('down', arguments)
        }).catch(e => {
            console.error(e)
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
                }, this.state.uploadList.get(xhrPromise), obj) 

                this.state.uploadList.set(xhrPromise, obj)
                this.setState({
                    uploadList: this.state.uploadList
                })
            }

            xhr.upload.onprogress = (e) => {
                if(e.type === "progress") {
                    let progress = (e.loaded / e.total * 100).toFixed(0)
                    
                    setState({
                        progress,
                        state: 'upload'
                    })
                }
            }

            xhr.onabort = (e) => {
                console.log('onabort', arguments)
                setState({
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
                        state: 'uploaded'
                    })
                    resolve(JSON.parse(event.target.responseText))
                } else {
                    reject(event.target)
                }
            }
                
            xhr.send(file)    
        }).then((ServerData) => {
            return this.downloadToLocal(ServerData, xhrPromise, file)
        })

        return xhrPromise
    }

    downloadToLocal(ServerData, xhrPromise, file) {
        return new Promise((resolve, reject) => {
            Https.get(ServerData.output.url, (res) => {
                if(res.statusCode === 200) {
                    res.on('data', (d) => {
                        fs.writeFile(`${window.userSavedPath}/${file.name}`, d, e => {
                            if(e) {
                                console.error(e)
                            }
                        })
                        console.log('正在下载中')
                    });
    
                    res.on('close', () => {
                        console.log('下载完成')
                        resolve('下载完成')
                        this.state.uploadList.set(xhrPromise, {
                            progress: 100,
                            isDone: true,
                            state: 'downloaded',
                            name: file.name
                        })
    
                        this.setState({
                            uploadList: this.state.uploadList
                        })
                    })
                }
            }).on('error', (e) => {
                console.error(e);
                reject('下载失败')
            })
        })
    }

    render() {
        const areaStyle = {
            margin: '0 auto',
            width: '440px',
            height: '200px',
            border: '2px #000 dashed',
            borderRadius: '8px'
        }

        const getProgressList = function(uploadList) {
            return [...uploadList.values()].map((value, index) => {
                return (
                    <div class="progress-item"  key={index}>
                        <p>状态：{+value.progress !== 100 ? '上传中' : value.isDone ? '已完成' : '下载中'}</p>
                        <p>文件名：{value.name}</p>
                        <Progress percent={+value.progress} status={value.isDone ? 'success' : 'active'}></Progress>
                    </div>
                )
            })
        }


        return (
            <div className="App">
                <div className="container">
                    <Dropzone onDrop={(e) => this.onDrop(e)} className="drag-area" style={areaStyle}>
                        <img src={uploadIcon} alt="upload"></img>
                        <p>将图片拖至此处进行压缩</p>
                        <p>一次不能超过20张，且大小不能超过5mb</p>
                    </Dropzone>
                    <DirManager></DirManager>
                    <div className="progress-container">
                    {getProgressList(this.state.uploadList)}
                    </div>
                </div>
                
            </div>
        );
    }
}

export default App
