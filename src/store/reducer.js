import actions from './actions'
const electron = window.require('electron')
const { app } = electron.remote
const DOCUMENTS_PATH = app.getPath('documents')


/**
 * init user config
 */
if (!localStorage.getItem('userConfig')) {
  localStorage.setItem('userConfig', JSON.stringify({}))
}
const userConfig = JSON.parse(localStorage.getItem('userConfig'))

const defaultState = Object.assign({}, {
    saveFilesDir: DOCUMENTS_PATH,
    isCreateNewDir: true,
    compressMode: 'online',
    compressLevel: 4
}, userConfig)

export default (state = defaultState, action) => {
  return actions[action.type] ? actions[action.type](JSON.parse(JSON.stringify(state)), action.value) : state
}