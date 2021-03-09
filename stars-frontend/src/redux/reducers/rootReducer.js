import { combineReducers } from 'redux'
import postsList from './postsList'
import popularTags from './popularTags'
import profileReducer from './profileReducer'
import authReducer from './authReducer'
import uploadReducer from './uploadReducer'
import { firebaseReducer } from 'react-redux-firebase'

export default combineReducers({
    post: postsList,
    tag: popularTags,
    progress: uploadReducer,
    profile: profileReducer,
    auth: authReducer,
    firebase: firebaseReducer
})