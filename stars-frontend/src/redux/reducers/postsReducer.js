import {
	LOAD_POSTS_SUCCESS,
	LOAD_ADDED_POSTS_SUCCESS,
	SET_IS_FETCHING,
	SET_IS_MORE_FETCHING,
	LOAD_POSTS_COMPLETE,
	CLEAR_POSTS,
	LOAD_MORE_POSTS_SUCCESS,
	REMOVE_POST,
	RESTORE_POST,
	SET_LIKE_ON_POST,
	SET_REPOST_ON_POST
} from '../actions/actionsTypes'

const initialState = {
	posts: [],
	cachePosts: [],
	lastPost: null,
	complete: false,
	isFetching: true,
	isMoreFetching: false,
	removePosts: []
}

export default function postsReducer(state = initialState, action) {
	const cachePosts = (posts) =>
		posts.map((post, index) => {
			if (!post) return false
			if (!!!state.cachePosts[index]) return posts[index]
			if (post.postId === state.cachePosts[index].postId) {
				return (posts[index] = post)
			}
			return action.posts[index]
		})

	switch (action.type) {
		case LOAD_POSTS_SUCCESS:
			let tempPosts = cachePosts(action.posts)
			if (tempPosts.length > 0) {
				tempPosts.sort((a, b) => {
					return b.timestamp.seconds - a.timestamp.seconds
				})
			}
			return {
				...state,
				posts: tempPosts,
				lastPost: action.lastPost,
				pathname: action.pathname,
				complete: false,
				cachePosts: !!state.posts.length ? state.cachePosts.concat(state.posts) : [],
				isFetching: false
			}
		case LOAD_MORE_POSTS_SUCCESS:
			return {
				...state,
				posts: state.posts.concat(cachePosts(action.posts)),
				lastPost: action.lastPost,
				isMoreFetching: false
			}
		case LOAD_ADDED_POSTS_SUCCESS:
			return {
				...state,
				posts: [ action.posts, ...state.posts ]
			}
		case SET_IS_FETCHING:
			return {
				...state,
				isFetching: true
			}
		case SET_IS_MORE_FETCHING:
			return {
				...state,
				isMoreFetching: true
			}
		case LOAD_POSTS_COMPLETE:
			return {
				...state,
				complete: true,
				isMoreFetching: false
			}
		case CLEAR_POSTS:
			state.cachePosts.concat(state.posts)
			return {
				...state,
				posts: [],
				complete: false,
				lastPost: null
			}
		case REMOVE_POST:
			return {
				...state,
				removePosts: state.removePosts.concat({
					uid: action.uid,
					post: action.post
				})
			}
		case RESTORE_POST:
			return {
				...state,
				removePosts: state.removePosts.filter((value) => {
					return value.uid !== action.uid
				})
			}
		case SET_LIKE_ON_POST:
			const setLike = (posts) =>
				posts.map((post, index) => {
					if (post.postId === action.postId) {
						post.liked = action.liked
						post.notes = post.notes + action.value
					}
					return post
				})
			return {
				...state,
				posts: setLike(state.posts)
			}
		case SET_REPOST_ON_POST:
			const setRepost = (posts) =>
				posts.map((post, index) => {
					if (post.postId === action.postId) {
						post.reposted = action.reposted
						post.notes = post.notes + action.value
					}
					return post
				})
			return {
				...state,
				posts: setRepost(state.posts)
			}
		default:
			return state
	}
}
