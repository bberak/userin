const passport = require('passport')
const Strategy = require('passport-facebook')
const { idpHelp: { getCallbackUrl, getAuthResponseHandler } } = require('./utils')

const STRATEGY = 'facebook'
const OAUTH_PATHNAME = `/${STRATEGY}/oauth2`
const OAUTH_CALLBACK_PATHNAME = `/${STRATEGY}/oauth2callback`

const parseAuthResponse = (accessToken, refreshToken, profile, next) => {
	const id = profile.id
	const { givenName: firstName, middleName, familyName: lastName } = profile.name || {}
	const email = ((profile.emails || [])[0] || {}).value || null
	const profileImg = ((profile.photos || [])[0] || {}).value

	const user = { id, firstName, middleName, lastName, email, profileImg }
	next(null, user)
}

/**
 * Returns an Express handler used by the client to request Authorization access to the IdP
 * 
 * @return {Void}        	[description]
 */
const getAuthRequestHandler = () => (req, res, next) => {
	const callbackURL = getCallbackUrl(req, OAUTH_CALLBACK_PATHNAME)
	const handler = passport.authenticate(STRATEGY, { callbackURL })
	handler(req, res, next)
}

const setUp = ({ appId, appSecret, scopes, userPortal, onSuccess, onError }) => {
	passport.use(new Strategy({
		clientID: appId,
		clientSecret: appSecret,
		profileFields: scopes
	}, parseAuthResponse))

	const authRequestHandler = getAuthRequestHandler()
	const authResponseHandler = getAuthResponseHandler({ strategy:STRATEGY, userPortal, onSuccess, onError, callbackPathname:OAUTH_CALLBACK_PATHNAME })

	return {
		authRequest: authRequestHandler,
		authResponse: authResponseHandler,
		pathname: OAUTH_PATHNAME,
		callbackPathname: OAUTH_CALLBACK_PATHNAME
	}
}


module.exports = {
	setUp,
	scopes: ['id', 'displayName', 'photos', 'email', 'first_name', 'middle_name', 'last_name']
}

