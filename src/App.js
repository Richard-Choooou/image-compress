import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import './App.css';

class App extends Component {

    constructor(props) {
        super(props)
        this.onDrop = this.onDrop.bind(this) ;
    }

    onDrop(acceptedFiles) {
        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const fileAsBinaryString = reader.result;
                // do whatever you want with the file content
                console.log(fileAsBinaryString)
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');

            reader.readAsBinaryString(file);
        });
    }

    render() {
        return (
            <div className="App">
                <Dropzone onDrop="{ this.onDrop }" />
            </div>
        );
    }
}

export default App;
