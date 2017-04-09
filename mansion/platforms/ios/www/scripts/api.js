var frontend_path = window .location .protocol + '//forster-mumenrider.c9users.io';
var backend_path = window .location .protocol + '//forster-mumenrider.c9users.io:8081';	

var login_value;
var logged_in_header =	function () {
							return login_value && { 'Content-Type': 'application/json', 'X-UUID': login_value .user .uuid };
						};


var api =	paper (function (self, args, me, my) {
				var logged_out =	{
										login:	writer (backend_path + '/auth/login', {
													write:	{
																method: 'POST',
																headers: '{ { "Content-Type": "application/json" } }',
																body: '{ data }'
															}
												}, '{ response .data }'),
										matches_to_find:	reader (backend_path + '/match', {
																read:	{
																			method: 'GET',
																			headers: '{ logged_in_header () }'
																		}
																	
															}, '{ response .data .match_list }')
									};
				var loggined_in =	function (login) {
										login_value = login;
										return	{
													test_user:	writer (backend_path + '/admin/test_create_user', {
																	write:	{
																				method: 'POST',
																				headers: '{ { "Content-Type": "application/json", "x-admin-uuid": "68ecd6d1-312e-4388-bee2-c3d81a8895e7" } }',
																				body: '{ { userName: "tester" } }'
																			}
																}, '{ response .data .user }'),
													hack_login:	writer (backend_path + '/auth/login', {
																	write:	{
																				method: 'local',
																				body: '{ having ({ user: having ({ uuid: data }) (login_value .user) }) (login_value) }'
																			}
																}, '{ data }'),
													//login: stream (login),
													//logout
													matches_to_find:	reader (backend_path + '/match', {
																			read:	{
																						method: 'GET',
																						headers: '{ logged_in_header () }'
																					}
																				
																		}, '{ response .data .match_list }'),
													match_to_find_info:	function (match_id) {
																			return	reader (backend_path + '/match/' + match_id + '/pre_match_info', {
																						read:	{
																									method: 'GET',
																									headers: '{ logged_in_header () }'
																								}
																					}, '{ response .data .pre_match_info }');
																		},		
													contact:	writer (backend_path + '/me/contact', {
																	write:	{
																				method: 'POST',
																				headers: '{ logged_in_header () }',
																				body: '{ data }'	
																			}
																}, '{ data }'),
													team_open:	writer (backend_path + '/me/team', {
																	write:	{
																				method: 'POST',
																				headers: '{ logged_in_header () }',
																				body: '{ data }'
																			}
																}, '{ response .data }'),
													match_open:	function (team_id) {
																	return	writer (backend_path + '/me/team/' + team_id + '/match', {
																				write:	{
																							method: 'POST',
																							headers: '{ logged_in_header () }',
																							body: '{ data }'
																						}
																			}, '{ response .data }');
																},				
													match_apply:	function (team_id, match_id) {
																		return	writer (backend_path + '/me/team/' + team_id + '/match/' + match_id + '/request', {
																					write:	{
																								method: 'POST',
																								headers: '{ logged_in_header () }'
																							}
																				}, '{ response .data }');
																	},				
													match_applications:	function (team_id, match_id) {
																			return	reader (backend_path + '/me/team/' + team_id + '/match/' + match_id + '/match_request', {
																						read:	{
																									method: 'GET',
																									headers: '{ logged_in_header () }'
																								}
																					}, '{ response .data .match_request_list }');
																		},				
													teams:	reader (backend_path + '/me/team', {
																read:	{
																			method: 'GET',
																			headers: '{ logged_in_header () }'
																		}
															}, '{ response .data .team_list }'),
													matches:	function (team_id) {
																	return	reader (backend_path + '/me/team/' + team_id + '/match', {
																				read:	{
																							method: 'GET',
																							headers: '{ logged_in_header () }'
																						}
																					
																			}, '{ response .data .match_list }');
																},
													matches_applied:	function (team_id) {
																			return	reader (backend_path + '/me/team/' + team_id + '/requesting_match', {
																						read:	{
																									method: 'GET',
																									headers: '{ logged_in_header () }'
																								}
																							
																					}, '{ response .data .match_list }');
																		}
												};
									};
	
				self
					.ask (args .api__for, function (reqs) {
						var curr_api = stream (logged_out);
						
						reqs .thru (tap, function (to) {
							if (to .login)
								curr_api (loggined_in (to .login))
							if (to .logout)
								curr_api (logged_out)
						})
						
						return curr_api;
					})
			});
			
			
			
			
var num_of_players_to_num =	function (text) {
					        	if (text === '5v5') return 5;
					        	if (text === '7v7') return 7;
					        	if (text === '9v9') return 9;
					        	if (text === '11v11') return 11;
							}
					        
var num_of_players_to_text =	function (num) {
						        	return num + 'v' + num 
						        }
var day_of_week_to_chi =	function (date_time) {
								return	'星期' + (function (day) {
											if (day === '0') return '日'
											if (day === '1') return '一'
											if (day === '2') return '二'
											if (day === '3') return '三'
											if (day === '4') return '四'
											if (day === '5') return '五'
											if (day === '6') return '六'
										}) (fecha .format (date_time, 'd'))
							}
var date_to_chi =	function (date_time) {
						return fecha .format (date_time, 'YYYY年M月D日')
					}
var date_from_chi =	function (str) {
						return fecha .parse (str, 'YYYY年M月D日')
					}
var times =	function (start_date_time, end_date_time) {
					return fecha .format (start_date_time, 'h:mm A') + ' - ' + fecha .format (end_date_time, 'h:mm A')
				}
var location_from_api =	function (str) {
							return str .split (',') .reverse () [0]
						}
var pitch_type_to_chi =	function (enum_) {
				        	if (enum_ === 'HARD_SURFACE') return '石地場'
				        	if (enum_ === 'GRASS_CARPET') return '人造草地場'
				        	if (enum_ === 'ARTIFICIAL_TURF') return '仿真草地場'
				        	if (enum_ === 'REAL_GRASS') return '草地場'
				        }
var field_type_to_chi =	function (enum_) {
				        	if (enum_ === 'HARD_SURFACE') return '硬地'
				        	if (enum_ === 'GRASS_CARPET') return '人造草'
				        	if (enum_ === 'ARTIFICIAL_TURF') return '仿真草'
				        	if (enum_ === 'REAL_GRASS') return '真草'
				        }
var fee_to_chi =	function (fee) {
						return fee ? 'HKD $' + fee : '免費'
					}
						        
						        

var win_rate =	function (won, played) {
					return (+ won * 100 / (+ played || 1)) .toFixed (0)
				}
var is_league = function (league) {
					return league ? '是' : '否'
				}
