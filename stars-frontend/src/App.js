import React, { useEffect } from 'react'
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { loadSubs } from './redux/actions/authActions'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Main from './pages/Main'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import Search from './pages/Search'
import Auth from './pages/Auth'
import Loading from './components/UI/Loading'

function App(props) {

  useEffect(() => {
    defineTheme()
    if (props.isLoaded) props.loadSubs()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isAuthenticated, props.isLoaded, props.isLoadedProfile, props.theme])

  function defineTheme() {
    const html = document.documentElement
    if (props.theme) {
      html.setAttribute('data-theme', 'white')
    } else {
      html.removeAttribute('data-theme', 'white')
    }
  }

  var routers = (
    <Switch>
      <Route exact path='/auth' component={Auth} />
      <Route exact path='/' component={Main} />
      <Route exact path='/404' component={NotFound} />
      <Route path='/profile/:id' component={Profile} />
      <Route path='/search' component={Search} />
      <Redirect from='/dashboard' to='/auth' />
      <Redirect from='/settings' to='/auth' />
      <Redirect from='*' to='/404' />
    </Switch>
  )

  if (!props.isAuthenticated) {
    routers = (
      <Switch>
        <Route exact path='/dashboard' component={Dashboard} />
        <Route exact path='/' component={Main} />
        <Route exact path='/settings' component={Settings} />
        <Route exact path='/404' component={NotFound} />
        <Route path='/profile/:id' component={Profile} />
        <Route path='/search' component={Search} />
        <Redirect to='/' />
        <Redirect from='*' to='/404' />
      </Switch>
    )
  }

    if (!props.isLoaded) return <Loading />
    return (
      <Layout>
        { routers }
      </Layout>
    )
}

function mapStateToProps(state) {
  return {
    uid: state.firebase.auth.uid,
    isAuthenticated: state.firebase.auth.isEmpty,
    isLoaded: state.firebase.auth.isLoaded,
    isLoadedProfile: state.firebase.profile.isLoaded,
    theme: state.firebase.profile.theme
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadSubs: () => dispatch(loadSubs())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App))
