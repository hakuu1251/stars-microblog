import { UPLOAD_ON_PROGRESS, UPLOAD_LOADED, UPLOAD_RESET, LOAD_PROFILE_PHOTO, LOAD_ADDED_POSTS_SUCCESS } from './actionsTypes'
import notification from './notificationActions'
import { getPostData } from './postsActions'

const titleSuccess = 'Запись успешно опубликована'
const titleDanger = 'Ошибка публикации записи'

export function upload(files, username, uid, forPosts = false, post) {
	return (dispatch, getState, {getFirebase, getFirestore}) => {
		dispatch(uploadOnProgress(true))
		const firebase = getFirebase()
		const firestore = getFirestore()
		var totalEach = 0
		let userCollection = firestore.collection('users')
		let postsCollection = firestore.collection('posts')
		let likesCollection = firestore.collection('likes')
		if(forPosts) {
			post.user = firestore.doc('users/' + uid)
			post.createdAt = firestore.Timestamp.now()
			post.notes = 0
			// if post without images
			if(files.length === 0)
				firestore.collection('posts').add(post)
				.then((docRef) => {
					postsCollection.doc(docRef.id).get().then(async (querySnapshot) => {
						const post = await getPostData(querySnapshot, userCollection, postsCollection, likesCollection, uid)
						dispatch({ 
							posts: post,
							type: LOAD_ADDED_POSTS_SUCCESS 
						})
					})
					dispatch(notification('Success', titleSuccess, 'Ура!'))
					dispatch(uploadComplete(true))
					dispatch(uploadOnProgress(false))
				})
				.catch((error) => {
					dispatch(notification('Danger', titleDanger, error.message))
				})
		}
		// if obj with images
		files.forEach((file) => {
			const user = firebase.auth().currentUser
			const storagePath = `${username}/${!forPosts ? 'profilePhoto' : 'media'}`
			const dbPath = !forPosts ? 'users' : `users/${uid}/media`
			let customMetadata = {
				width: file.width,
				height: file.height,
				alt: file.alt
			}
			if (forPosts) file = file.file
			const fileName = file.name.replace('.', Math.floor(Date.now() + Math.random()) + '.')
			firebase.uploadFile(storagePath, file, dbPath, {
				name: fileName,
				metadata: { customMetadata },
				progress: true,
				metadataFactory: (uploadRes, firebase, metadata, downloadURL) => {
					if(!forPosts) { 
						user.updateProfile({
							'photoURL': downloadURL
						})
						firebase.updateAuth({
							'photoURL': downloadURL
						})
						dispatch(loadProfilePhoto(downloadURL))
						return { photoURL: downloadURL }
					} else {
						post.photoURL.push({
							url: downloadURL,
							width: customMetadata.width,
							height: customMetadata.height,
							alt: customMetadata.alt
						})
						return { photoURL: downloadURL }
					}
				}, documentId: !forPosts && user.uid
			})
			.then(() => {
				totalEach++
				if(forPosts && totalEach === files.length) {
					firestore.collection('posts').add(post)
						.then(async (docRef) => {
							postsCollection.doc(docRef.id).get().then(async (querySnapshot) => {
								const post = await getPostData(querySnapshot, userCollection, postsCollection, likesCollection, user.uid)
								dispatch({ 
									posts: post,
									type: LOAD_ADDED_POSTS_SUCCESS 
								})
							})
							dispatch(notification('Success', 'Успешно', titleSuccess))
							dispatch(uploadComplete(true))
							dispatch(uploadOnProgress(false))
						})
						.catch((error) => {
							dispatch(notification('Danger', titleDanger, error.message))
						})
				} else if (!forPosts) {
					dispatch(notification('Success', 'Успешно', 'Изображение профиля успешно изменено'))
					dispatch(uploadComplete(true))
					dispatch(uploadOnProgress(false))
				}
			})
			.catch((err) => {
				dispatch(notification('Danger', titleDanger, `Ошибка загрузки медиа на сервер. ${err}`))
			})
		})
	}
}

export function uploadOnProgress(upload) {
	return {
		type: UPLOAD_ON_PROGRESS,
		upload
	}
}

export function uploadReset() {
	return {
		type: UPLOAD_RESET
	}
}

export function uploadComplete(complete) {
	return {
		type: UPLOAD_LOADED,
		complete
	}
}

export function loadProfilePhoto(data) {
	return {
		type: LOAD_PROFILE_PHOTO,
		photoURL: data
	}
}