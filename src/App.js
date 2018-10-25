import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import DirManager from './components/dir_manager/dir_manager'
import Progress from 'antd/lib/progress'
import Compress from './static/js/compress'
import 'antd/lib/progress/style/css'
import './App.scss'

// const electron = window.require('electron')
// const process = window.require('process')
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
        console.log(acceptedFiles)
        this.imageFiles = acceptedFiles.filter(
            file => /^image\/(png|jpg|jpeg)$/.test(file.type)
        ).filter(
            file => file.size < 1024 * 1024 * 5
        )

        const compressInstance = new Compress(this.imageFiles)
        
        compressInstance.on('stateChange', data => {
            console.log(data)
            this.setState({
                uploadList: compressInstance.getUploadList()
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
            const checkState = data => {
                if(data.state === 'error') {
                    return 'exception'
                } else if(data.isDone) {
                    return 'success'
                } else {
                    return 'active'
                }
            }
            return [...uploadList.values()].map((value, index) => {
                return (
                    <div className="progress-item"  key={index}>
                        <p>文件名：{value.name}</p>
                        {value.state === 'uploading'?<p>状态：上传中</p>:''}
                        {value.state === 'cancel'?<p>状态：已取消</p>:''}
                        {value.state === 'error'?<p>状态：网络错误</p>:''}
                        {value.state === 'compressing'?<p>状态：压缩中</p>:''}
                        {value.state === 'compressed'?<p>状态：压缩完成</p>:''}
                        {value.state === 'downloading'?<p>状态：下载中</p>:''}
                        {value.state === 'downloaded'?<p>状态：已完成</p>:''}
                        <Progress percent={+value.progress} status={checkState(value)}></Progress>
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
                        <p>正在使用在线压缩引擎</p>
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
