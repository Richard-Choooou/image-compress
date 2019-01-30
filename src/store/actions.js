import TYPES from './action_types'
export default {
    [TYPES.SET_SAVE_FILE_DIR](state, value) {
        state.saveFilesDir = value
        return state
    },

    [TYPES.SET_CREATE_NEW_DIR_STATE](state, value) {
        state.isCreateNewDir = value
        return state
    },

    [TYPES.SET_COMPRESS_MODE](state, value) {
        state.compressMode = value
        return state
    },

    [TYPES.SET_COMPRESS_LEVEL](state, value) {
        state.compressLevel = value
        return state
    }
}