import './style.scss'
import React, { Component } from 'react'
import Checkbox from 'antd/lib/checkbox'
import 'antd/lib/checkbox/style/css'
import { connect } from 'react-redux'
const electron = window.require('electron')
const { app, dialog, shell } = electron.remote

class DirManager extends Component {

    constructor(props) {
        super(props)
    }

    openChooseDir() {
        dialog.showOpenDialog({
            title: '请选择一个文件夹',
            defaultPath: this.props.saveFilesDir,
            properties: ['openDirectory', 'createDirectory']
        }, dirs => {
            if (!dirs) return
            this.props.setSaveFileDir(dirs[0])
        })
    }

    openChoosedDir() {
        shell.openItem(this.props.saveFilesDir)
    }

    isCreateNewDirChange(e) {
        this.props.setCreateNewDirState(e.target.checked)
    }

    render() {
        return (
            <div className="dir-manager-container">
                <div className="dir-tool">
                    <p className="dir-path">{this.props.saveFilesDir}</p>
                    <button className="btn" onClick={(e) => this.openChooseDir(e)}>选择</button>
                    <button className="btn" onClick={(e) => this.openChoosedDir(e)}>打开目录</button>
                </div>
                <Checkbox onChange={(e) => this.isCreateNewDirChange(e)} checked={this.props.isCreateNewDir}>是否创建独立文件夹存放图片</Checkbox>
            </div>
        )
    }
}

export default connect(state => {
    return {
        saveFilesDir: state.saveFilesDir,
        isCreateNewDir: state.isCreateNewDir
    }
}, dispatch => {
    return {
        setSaveFileDir(path) {
            const action = {
                type: 'SET_SAVE_FILE_DIR',
                value: path
            }
            dispatch(action)
        },
        setCreateNewDirState(state) {
            const action = {
                type: 'SET_CREATE_NEW_DIR_STATE',
                value: state
            }
            dispatch(action)
        }
    }
})(DirManager)