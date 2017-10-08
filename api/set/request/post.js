var use_db = require ('api/use_db');
var config = require ('api/config');
var decode = require ('api/decode');
var tokenizer = require ('api/tokenizer');
var detokenizer = require ('api/detokenizer');

module .exports = function (ctx, next) {
	var user = { id: detokenizer (decode (ctx .request .headers .user) .token) };
	var player = { id: detokenizer (decode (ctx .request .headers .player) .token) };
	var subcategory = { name: decode (ctx .request .headers .subcategory) };
	var set_;
	var achievement;
	var latest_quizes;
	return  use_db (function (session) {
				return  Promise .resolve ()
						.then (function () {
							return  session .run (
										'MATCH (user:User) WHERE ID (user) = {user} .id ' +
										'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
										'MATCH (user)<-[:of]-(:is)-[:_]->(player) ' +
										'RETURN player',
										{
											user: user,
											player: player
										})
						})
						.then (function (results) {
							if (! results .records .length)
								return Promise .reject (new Error ('Invalid player specified'))
						})
						.then (function () {
							return  session .run (
										'MATCH (user:User) WHERE ID (user) = {user} .id ' +
										'RETURN user',
										{
											user: user
										})
						})
						.then (function (results) {
							if (! results .records .length)
								return Promise .reject (new Error ('Invalid user specified'));
							
							latest_quizes =	(results .records [0] ._fields [0] .properties .latest_quizes || [])
							
							var now = new Date ();
							var today = new Date (now .getFullYear (), now .getMonth (), now .getDate ());
							var now_timestamp = now / 1000;
							var today_timestamp = today / 1000;
							
							if (latest_quizes .length >= 6
								&& latest_quizes .slice (1) .every (function (date) {
									return date > today_timestamp;
							}))
								return Promise .reject (new Error ('No koding chances remaining today'));
							
							latest_quizes = latest_quizes .concat ([ + now_timestamp ]) .slice (-7);
						})
						.then (function () {
							return  session .run (
										'MATCH (subcategory:Subcategory { name: {subcategory} .name }) ' +
										'RETURN subcategory',
										{
											subcategory: subcategory
										})
						})
						.then (function (results) {
							if (! results .records .length)
								return Promise .reject (new Error ('Subcategory not found'))
						})
						.then (function () {
							return  session .run (
										'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
										'MATCH (set:Set)<-[:to]-(:does)-[:_]->(player) ' +
										'RETURN set',
										{
											player: player
										});
						})
						.then (function (results) {
							if (results .records .length)
								return Promise .reject (new Error ('Player already doing another set'))
						})
						.then (function () {
							return  session .run (
										'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
										'MERGE (set:Set { subcategory: {subcategory} .name })<-[:to]-(:does)-[:_]->(player) ' +
										'RETURN set',
										{
											player: player,
											subcategory: subcategory
										});
						})
						.then (function (results) {
							set_ = results .records [0] ._fields [0];
						})
						.then (function () {
							return  session .run (
										'MATCH (user:User) WHERE ID (user) = {user} .id ' +
										'SET user .latest_quizes = {latest_quizes} ',
										{
											user: user,
											latest_quizes: latest_quizes
										});
						})
						.then (function () {
							return  session .run (
										'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
										'MATCH (subcategory:Subcategory { name: {subcategory} .name }) ' +
										'MERGE (subcategory)<-[:in]-(achievement:achieves)-[:_]->(player) ' +
										'RETURN achievement',
										{
											player: player,
											subcategory: subcategory
										});
						})
						.then (function (results) {
							achievement = results .records [0] ._fields [0] .properties;
							achievement .level = achievement .level || config .level .default;
						})
						.then (function () {
							return  session .run (
										'MATCH (subcategory:Subcategory { name: {subcategory} .name }) ' +
										'MATCH (question:Question)<-[:_]-(:is)-[:in]->(subcategory) ' +
										'RETURN question',
										{
											user: user,
											subcategory: subcategory
										});
						})
						.then (function (results) {
							return  results .records
										.sort (function (a, b) {
											var a_difficulty = a ._fields [0] .properties .difficulty;
											var b_difficulty = b ._fields [0] .properties .difficulty;
											if (Math .abs (a_difficulty - achievement .level) < Math .abs (b_difficulty - achievement .level))
												return -1;
											if (Math .abs (a_difficulty - achievement .level) > Math .abs (b_difficulty - achievement .level))
												return 1;
											return 0;
										})
										.slice (0, 10)
						})
						.then (function (results) {
							return  Promise .all (
										results .map (function (record) {
											var question = { id: record ._fields [0] .identity };
											return  session .run (
														'MATCH (player:Player) WHERE ID (player) = {player} .id ' +
														'MATCH (question:Question) WHERE ID (question) = {question} .id ' +
														'MATCH (set:Set { subcategory: {subcategory} .name })<-[:to]-(:does)-[:_]->(player) ' +
														'MERGE (question)<-[:_]-(:is)-[:in]->(set) ' +
														'RETURN question',
														{
															player: player,
															question: question,
															subcategory: subcategory
														})
														.then (function (results) {
															return results .records [0]
														})
														.then (function (record) {
															return record ._fields [0] .properties
														})
										})
									);
						})
						.then (function (questions) {
							return {
								questions: questions,
								token: tokenizer (set_)
							}
						})
						.catch (function (err) {
							return {
								error: err .message
							}
						})
			})
			.then (function (x) {
				ctx .body = x;
			})
			.then (function () {
				return next ();
			})
};