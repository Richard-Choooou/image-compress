import './style.scss'
import React, {Component} from 'react'
const electron = window.require('electron')
console.log(electron)
export default class DirManager extends Component {

    constructor(props) {
        super(props)
        this.state = {
            saveFileDir: ''
        }
        // console.log(app)
        // console.log(app.getPath('documents'))
    }
    
    openChooseDir() {
        console.log(this)
        this.refs.chooseFileInput.click()
    }

    choosedDir(e) {

    }

    render() {
        return (
            <div className="dir-manager-container">
            <input ref="chooseFileInput" onChange={(e) => this.choosedDir(e)} type="file" directory="" webkitdirectory="" hidden></input>
                <p className="dir-path">
                    /user/local/images
                </p><button className="btn" onClick={(e) => this.openChooseDir(e)}>选择</button>
                <label><input type="checkbox"/>是否创建独立文件夹存放图片</label>
            </div>
        )
    }
}