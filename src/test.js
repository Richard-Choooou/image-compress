import React, { Component } from 'react';

export default class Test extends Component{

    onClickFn() {
        console.log(12111)
    }

    render() {
        return(
            <div>
                <button onClick="{() => this.onClickFn()}">测试</button>
            </div>
        )
    }
}