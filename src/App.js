import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import DirManager from './components/dir_manager/dir_manager'
import './App.scss'

const fs = window.require('fs')
// const electron = window.require('electron')
// const process = window.require('process')
const Https = window.require('https')
const uploadIcon = require('./static/images/upload.svg')

class App extends Component {

    // constructor(props) {
    //     super(props)
    // }

    onDrop(acceptedFiles) {
        this.imageFiles = acceptedFiles.filter(
            file => /^image\/(png|jpg|jpeg)$/.test(file.type)
        ).filter(
            file => file.size < 1024 * 1024 * 5
        )

        this.uploadFilesThenDownload()
    }

    uploadFilesThenDownload() {
        this.uploadList = this.imageFiles.map(file => this.uploadFileToServer(file))

        Promise.all(this.uploadList).then(fileList => {
            fileList.forEach(file => {
                Https.get(file.ServerData.output.url, (res) => {
                    if(res.statusCode === 200) {
                        res.on('data', (d) => {
                            fs.writeFile(`./${file.name}`, d, e => {
                                if(e) {
                                    console.error(e)
                                }
                            })
                            console.log('正在下载中', d)
                        });
    
                        res.on('close', () => {
                            console.log('下载完成')
                        })
                    }
                }).on('error', (e) => {
                    console.error(e);
                });
            })
            
        }).catch(e => {
            console.error(e)
        })
    }

    uploadFileToServer(file) {
        console.log(file)
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.open("POST", "https://tinypng.com/web/shrink")

            xhr.upload.onprogress = function() {
                console.log(arguments)
            }

            xhr.onabort = function(e) {
                console.log('onabort', arguments)
                reject(e)
            }

            xhr.onerror = function(e) {
                console.error('onerror', arguments)
                reject(e)
            }

            xhr.onload = function (event) {
                if(event.target.status === 201) {
                    const fileInfo = {}
                    fileInfo.name = file.name
                    fileInfo.ServerData = JSON.parse(event.target.responseText)
                    resolve(fileInfo)
                } else {
                    reject(event.target)
                }
            }
                
            xhr.send(file)    
        })
        
    }

    render() {
        const areaStyle = {
            margin: '0 auto',
            width: '350px',
            height: '200px',
            border: '2px #000 dashed',
            borderRadius: '8px'
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
                </div>
                
            </div>
        );
    }
}

export default App
