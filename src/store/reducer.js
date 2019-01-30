import actions from './actions'
const electron = window.require('electron')
const { app } = electron.remote
const DOCUMENTS_PATH = app.getPath('documents')

const defaultState = {
    saveFilesDir: DOCUMENTS_PATH,
    isCreateNewDir: true,
    compressMode: 'online',
    compressLevel: 4
}

export default (state = defaultState, action) => {
  return actions[action.type] ? actions[action.type](JSON.parse(JSON.stringify(state)), action.value) : state
}