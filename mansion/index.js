require ('child_process') .execSync ('( screen -wipe; if ! screen -list | grep -q "neo4j"; then echo Restarting screen neo4j...; screen -dmS neo4j sudo neo4j console; fi )', {stdio: [0, 1, 2] });

require ('koa-qs') (new (require ('koa')) ())
	.use (require ('koa-cors') ())
	.use (function (ctx, next) {
		return	next ()
					.catch (function (err) {
						ctx .type = 'application/json'
						ctx .status = err .code || 500
						ctx .message = err .message || 'Internal Server Error'
						ctx .body =	{
										error:	{
													code: ctx .status,
													errors: err.errors || [{ reason: 'Internal Server Error', message: 'fuku' }]
												}
									}
						
						console .error (err)
					});
	})
	.use (require ('koa-morgan') ('combined'))
	.use (require ('koa-bodyparser') ())
	.use (require ('koa-json') ())
	.use (require ('koa-router') ()
		.get ('/questions', require ('./questions/get'))
		.post ('/register', require ('./register/post'))
		.post ('/login', require ('./login/post'))
		/*// 
		.get('/hello/world', function (ctx, next) {
			ctx .body = 'Hello world!';
			return next ();
		})
		.post('/auth/login', AuthController.login)
		// .post('/auth/logout', _P.isOwned, AuthController.logout)
		
		// UserController - Intro
		.get('/user', _P.isOwned, UserController.getUsers)
		.get('/user/:userId', _P.isOwned, UserController.getUser)
		
		// UserController - Literal
		.get('/me', _P.isOwned, UserController.getMyUser)
		.post('/user', _P.isAdmin, UserController.createUser)
		.patch('/me', _P.isOwned, UserController.updateUser)
		// .del('/me', _P.isOwned, UserController.deleteUser)
		
		// OAuthAccountController - Literal
		.get('/me/oauth-account', _P.isOwned, OAuthAccountController.getOAuthAccounts)
		// .post('/me/oauth-account', _P.isOwned, OAuthAccountController.createOAuthAccount)
		// .patch('/me/oauth-account', _P.isOwned, OAuthAccountController.updateOAuthAccount)
		// .del('/me/oauth-account', _P.isOwned, OAuthAccountController.deleteOAuthAccount)
		
		// TeamController - Intro
		.get('/team', _P.isOwned, TeamController.getTeams)
		.get('/team/:teamId', _P.isOwned, TeamController.getTeam)
		
		// TeamController - Literal
		.get('/me/team', _P.isOwned, TeamController.getMyTeams)
		.get('/me/team/:teamId', _P.isOwned, _P.isOwnTeam, TeamController.getMyTeam)
		.post('/me/team', _P.isOwned, TeamController.createTeam)
		.patch('/me/team/:teamId', _P.isOwned, _P.isOwnTeam, TeamController.updateTeam)
		// router.del('/me/team/:teamId', _P.isOwned, _P.isOwnTeam, TeamController.deleteTeam)
		
		// FriendRequestController - Literal
		.post('/me/team/:teamId/friend-request/:toTeamId', _P.isOwned, _P.isOwnTeam, FriendRequestController.createRequest)
		.patch('/me/team/:teamId/friend-request/:fromTeamId', _P.isOwned, _P.isOwnTeam, FriendRequestController.updateRequest)
		
		// FofiRating - Intro
		.get('/fofi-rating', _P.isOwned, FofiRatingController.getFofiRatings)
		
		// FofiRating - Literal
		.get('/me/team/:teamId/fofi-rating', _P.isOwned, _P.isOwnTeam, FofiRatingController.getMyFofiRating)
		
		// MatchController - Intro
		.get('/match', _P.isOwned, MatchController.getMatches)
		.get('/match/:matchId', _P.isOwned, MatchController.getMatch)
		
		// MatchController - Literal
		.get('/me/team/:teamId/match', _P.isOwned, _P.isOwnTeam, MatchController.getMyMatches)
		.get('/me/team/:teamId/match/:matchId', _P.isOwned, _P.isOwnTeam, _P.isOwnMatch, MatchController.getMyMatch)
		.post('/me/team/:teamId/match', _P.isOwned, _P.isOwnTeam, MatchController.createMatch)
		.post('/me/team/:teamId/match/:matchId/bid', _P.isOwned, _P.isOwnTeam, MatchController.createMatchBid)
		// .patch('/me/team/:teamId/match/:matchId/bid', MatchController.updateMatchBid)
		.patch('/me/team/:teamId/match/:matchId/unbid', _P.isOwned, _P.isOwnTeam, MatchController.removeMatchBid)
		.patch('/me/team/:teamId/match/:matchId/take-bid', _P.isOwned, _P.isOwnTeam, _P.isOwnMatch, MatchController.takeBid)
		.patch('/me/team/:teamId/match/:matchId/pre-match', _P.isOwned, _P.isOwnTeam, _P.isOwnMatch, MatchController.updatePreMatch)
		.patch('/me/team/:teamId/match/:matchId/post-match', _P.isOwned, _P.isOwnTeam, _P.isOwnMatch, MatchController.updatePostMatch)
		.patch('/me/team/:teamId/match/:matchId/end-match', _P.isOwned, _P.isOwnTeam, _P.isOwnMatch, MatchController.endMatch)
		.del('/me/team/:teamId/match/:matchId', _P.isOwned, _P.isOwnTeam, _P.isOwnMatch, MatchController.deleteMatch)
		
		// TodoController - Literal
		.get('/me/todo', _P.isOwned, TodoController.getTodos)
		.del('/me/todo/:todoId', _P.isOwned, TodoController.deleteTodo)*/
	
		.routes ()
	)
	.use (require ('koa-static') ('platforms/browser/www'))
	
	.listen (8080);

console .log ('Listening at ' + process .env .C9_HOSTNAME + ':' + process .env .PORT + '...')