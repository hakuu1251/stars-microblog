import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { loadPosts } from '../../redux/actions/actions'
import Post from '../../components/Post'
import Tags from '../../components/PopularTags'
import './Home.sass'

function Home(props) {
	useEffect(() => {
		props.loadPosts()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	function renderPosts() {
		return props.postsList.map((post, index) => {
			return <Post key={index} list={post} />
		})
	}

	return (
		<div className="container">
			<div className="container__left">
				<div className="create-note">Создать запись</div>
				{renderPosts()}
			</div>
			<div className="container__right">
				<Tags />
			</div>
		</div>
	)
}

function mapStateToProps(state) {
	return {
		postsList: state.post.postsList
	}
}

function mapDispatchToProps(dispatch) {
	return {
		loadPosts: () => dispatch(loadPosts())
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
