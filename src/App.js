import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import DirManager from './components/dir_manager/dir_manager'
import Progress from 'antd/lib/progress'
import Compress from './static/js/compress'
import 'antd/lib/progress/style/css'
import './App.scss'
import Slider from 'antd/lib/slider'
import 'antd/lib/slider/style/css'
import Switch from 'antd/lib/switch'
import 'antd/lib/switch/style/css'
import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style/css'
import Tooltip from 'antd/lib/tooltip'
import 'antd/lib/tooltip/style/css'
import { connect } from 'react-redux'
const electron = window.require('electron')
const { shell } = electron.remote


const uploadIcon = require('./static/images/upload.svg')

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            uploadList: new Map()
        }

        window.addEventListener('online',  () => {
            this.props.setCompressMode('online')
        })

        window.addEventListener('offline',  () => {
            this.props.setCompressMode('offline')
        })

        this.fileFilter = {
            online: /^image\/(png|jpg|jpeg)$/,
            offline: /^image\/(png|jpg|jpeg|gif)$/
        }
    }

    onDrop(acceptedFiles) {
        this.setState({
            uploadList: new Map()
        })
        this.imageFiles = acceptedFiles.filter(
            file => this.props.compressMode === 'online' ? this.fileFilter.online.test(file.type) : this.fileFilter.offline.test(file.type) 
        ).filter(
            file => this.props.compressMode === 'offline' ? true : file.size < 1024 * 1024 * 5
        )

        const compressInstance = new Compress(this.imageFiles)
        
        compressInstance.on('stateChange', data => {
            // console.log(data)
            this.setState({
                uploadList: compressInstance.getUploadList()
            })
        })
    }

    onCompressModeChange(checked) {
        if (!window.navigator.onLine) return
        this.props.setCompressMode(checked ? 'online' : 'offline')
    }

    onCompressLevelChange(value) {
        // console.log(value)
        this.props.setCompressLevel(value)
    }

    goToGitHub() {
        shell.openExternal('https://github.com/Richard-Choooou/image-compress')
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
                <img onClick={this.goToGitHub} width="120" height="120" src="https://github.blog/wp-content/uploads/2008/12/forkme_right_gray_6d6d6d.png?resize=149%2C149" className="attachment-full size-full" alt="Fork me on GitHub" data-recalc-dims="1" />
                <div className="container">
                    <Dropzone onDrop={(e) => this.onDrop(e)} className="drag-area" style={areaStyle}>
                        <img src={uploadIcon} alt="upload"></img>
                        <p>将图片拖至此处进行压缩</p>
                        {this.props.compressMode === 'online' && <div><p>正在使用在线压缩引擎</p><p>一次不能超过20张，且大小不能超过5mb</p></div>}
                        {this.props.compressMode === 'offline' && <div><p>正在使用离线压缩引擎</p><p>支持gif格式文件压缩</p></div>}
                    </Dropzone>
                    <DirManager></DirManager>
                    <div className="compress-level">
                        <Switch className="left" size="small" checkedChildren="online" unCheckedChildren="offline" checked={this.props.compressMode === 'online'} defaultChecked onChange={e => this.onCompressModeChange(e)} />
                        <div className="right">
                            <span>
                                压缩等级
                                <Tooltip title="压缩等级越高，图片质量越差，建议等级4">
                                    <Icon  style={{margin: '0 5px'}} type="question-circle" />
                                </Tooltip>
                               ：</span>
                            <Slider disabled={this.props.compressMode === 'online'} onChange={e => this.onCompressLevelChange(e)} className="compress-level-slider" defaultValue={3} value={this.props.compressLevel} dots={true} step={1} min={1} max={10} />
                        </div>
                    </div>
                    <div className="progress-container">
                        {getProgressList(this.state.uploadList)}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => {
    return {
        compressMode: state.compressMode,
        compressLevel: state.compressLevel
    }
}, dispatch => {
    return {
        setCompressMode(mode) {
            const action = {
                type: 'SET_COMPRESS_MODE',
                value: mode
            }
            dispatch(action)
        },

        setCompressLevel(level) {
            const action = {
                type: 'SET_COMPRESS_LEVEL',
                value: level
            }
            dispatch(action)
        }
    }
})(App)
