import './style.scss'
import React, {Component} from 'react'

export default class DirManager extends Component {
    render() {
        return (
            <div className="dir-manager-container">
                <p className="dir-path">
                    /user/local/images
                </p>
            </div>
        )
    }
}