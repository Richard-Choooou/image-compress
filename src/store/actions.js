import TYPES from './action_types'

function setUserConfigToStorage(config) {
    localStorage.setItem('userConfig', JSON.stringify(config))
}

export default {
    [TYPES.SET_SAVE_FILE_DIR](state, value) {
        state.saveFilesDir = value
        setUserConfigToStorage(state)
        return state
    },

    [TYPES.SET_CREATE_NEW_DIR_STATE](state, value) {
        state.isCreateNewDir = value
        setUserConfigToStorage(state)
        return state
    },

    [TYPES.SET_COMPRESS_MODE](state, value) {
        state.compressMode = value
        setUserConfigToStorage(state)
        return state
    },

    [TYPES.SET_COMPRESS_LEVEL](state, value) {
        state.compressLevel = value
        setUserConfigToStorage(state)
        return state
    }
}