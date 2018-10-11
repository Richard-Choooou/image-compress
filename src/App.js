import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import './App.scss';
const fs = require('fs');
const uploadIcon = require('./static/images/upload.svg');

class App extends Component {

    constructor(props) {
        super(props)
        this.uploadList = []
    }

    onDropAndUploadFile(acceptedFiles) {
        this.imageFiles = acceptedFiles.filter(file => {
            return  /^image\/(png|jpg|jpeg)$/.test(file.type)
        })

        this.uploadFiles()
    }

    uploadFiles() {
        this.uploadList.push(this.imageFiles.map(file => this.uploadFile(file)))

        Promise.all(this.uploadList).then(dataList => {
            console.log(1123, dataList)
        }).catch(e => {
            console.error(e)
        })
    }

    uploadFile(file) {
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
                    const repData = JSON.parse(event.target.responseText)
                    console.log(repData)
                    resolve(repData)
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
            'border-radius': '8px'
        }

        return (
            <div className="App">
                <div class="container">
                    <Dropzone onDrop={(e) => this.onDropAndUploadFile(e)} class="drag-area" style={areaStyle}>
                        <img src={uploadIcon} alt="upload"></img>
                        <p>将图片拖至此处进行压缩</p>
                        <p>一次不能超过20张，且大小不能超过5mb</p>
                    </Dropzone>
                </div>
                
            </div>
        );
    }
}

export default App;
