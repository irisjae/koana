require ('api/kk_index')
	.then (function (kk_index) {
		console .log ('kk index', kk_index)
	})
	.catch (function (error) {
		console .error (error)
		console .error (error .stack)
	})