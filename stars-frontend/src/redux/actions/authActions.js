import { LOGIN_SUCCESS, LOGIN_SIGNOUT, LOGIN_CLEAR, SUBS_LOAD_SUCCESS } from "./actionsTypes"
import notification from "./notificationActions"

const title = "Ошибка авторизации"

export function signIn(email, password, isLogin, name, blogname) {
	return (dispatch, getState, {getFirebase, getFirestore}) => {
		const firebase = getFirebase()
		const firestore = getFirestore()

		const data = {
			username: name,
			blogname: blogname,
			email: email,
			photoURL: null,
			desc: null,
			theme: false
		}

		if (isLogin) {
			const exist = new Promise((resolve, reject) => {
				firestore.collection('users').where('username', '==', name).get().then((querySnapshot) => {
					if (querySnapshot.size > 0) {
						reject('Пользователь с таким ником уже существует')
					} else {
						resolve()
					}
				}).catch((err) => {
					reject(err)
				})
			})

			exist.then(() => {
				firebase.auth().createUserWithEmailAndPassword(email, password)
				.then(() => {
					const user = firebase.auth().currentUser
					user.updateProfile({
						displayName: `${name}`
					})
					.then(() => {
						const currentUser = firestore.collection('users').doc(user.uid)
						currentUser.set(data)
						.then(() => {
							firebase.updateAuth({
								'displayName': name
							})
							firestore.collection(`users/${user.uid}/following`).add({
								user: currentUser
							}).then(() => {
								dispatch(loginSuccess())
							})
						})
						.catch((err) => {
							dispatch(notification('Danger', title, err.message))
							dispatch({ type: LOGIN_CLEAR })
						})
					})
				})
				.catch((error) => {
					dispatch(notification('Danger', title, error.message))
					dispatch({ type: LOGIN_CLEAR })
				})
			})
			.catch((err) => {
				dispatch(notification('Danger', title, err.message || err ))
			})
		} else {
			firebase.auth().signInWithEmailAndPassword(email, password)
				.then(() => {
					dispatch(notification('Success', 'Добро пожаловать', 'Вы успешно авторизованы'))
					dispatch(loginSuccess())
				})
				.catch((error) => {
					dispatch(notification('Danger', title, error.message))
					dispatch({ type: LOGIN_CLEAR })
				})
		}
	}
}

export function loadSubs() {
	return async (dispatch, getState, {getFirebase, getFirestore}) => {
		const firestore = getFirestore()
		const firebase = getFirebase()
		let user = await firebase.auth().currentUser
		if (!user) return false
		const loadFollowers = new Promise(async (resolve, reject) => {
			await firestore.collection(`users/${user.uid}/followers`).get().then(async (querySnapshot) => {
				Promise.all(querySnapshot.docs.map(async (doc) => {
					let data = await doc.data()
					return data.user.id
				})).then((followers) => {
					resolve(followers)
				})
			}).catch((err) => {
				reject(err)
			})
		})

		loadFollowers.then(async (followers) => {
			await firestore.collection(`users/${user.uid}/following`).get().then(async (querySnapshot) => {
				let followingRefs = []
				await Promise.all(querySnapshot.docs.map((doc) => {
					let data = doc.data()
					followingRefs.push(data.user)
					return data.user.id
				})).then((following) => {
					dispatch({ followers: followers, following: following, followingRefs: followingRefs, type: SUBS_LOAD_SUCCESS })
				}).catch((err) => {
					dispatch(notification('Danger', 'Ошибка', err.message))
				})
			})
		})
	}
}

export function signOut() {
	return (dispatch, getState, {getFirebase, getFirestore}) => {
		const firebase = getFirebase()
		firebase.auth().signOut().then(() => {
			dispatch({ type: LOGIN_SIGNOUT })
		})
	}
}

export function errorClear() {
	return (dispatch, getState, {getFirebase, getFirestore}) => {
		dispatch({ type: LOGIN_CLEAR })
	}
}

export function loginSuccess() {
	return {
		type: LOGIN_SUCCESS
	}
}