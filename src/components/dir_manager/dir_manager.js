import './style.scss'
import React, {Component} from 'react'
import { Checkbox } from 'antd'
const electron = window.require('electron')
const {app, dialog, shell} = electron.remote
const DOCUMENTS_PATH = app.getPath('documents')
console.log(DOCUMENTS_PATH)

export default class DirManager extends Component {

    constructor(props) {
        super(props)
        window.userSavedPath = localStorage.getItem('userSavedPath') || DOCUMENTS_PATH
        this.state = {
            saveFileDir: window.userSavedPath
        }
    }
    
    openChooseDir() {
        dialog.showOpenDialog({
            title: '请选择一个文件夹',
            defaultPath: DOCUMENTS_PATH,
            properties: ['openDirectory', 'createDirectory']
        }, dirs => {
            if(!dirs) return
            
            window.userSavedPath = dirs[0]
            localStorage.setItem('userSavedPath', window.userSavedPath)
            this.setState({
                saveFileDir: window.userSavedPath
            })
        }) 
    }

    openChoosedDir() {
        shell.openExternal(window.userSavedPath)
    }

    checkboxChange(e) {
        console.log(e)
    }

    render() {
        return (
            <div className="dir-manager-container">
                <div className="dir-tool">
                    <p className="dir-path">{this.state.saveFileDir}</p>
                    <button className="btn" onClick={(e) => this.openChooseDir(e)}>选择</button>
                    <button className="btn" onClick={(e) => this.openChoosedDir(e)}>打开目录</button>
                </div>
                
                <label><Checkbox onChange={e => this.checkboxChange(e)}>是否创建独立文件夹存放图片</Checkbox></label>
            </div>
        )
    }
}