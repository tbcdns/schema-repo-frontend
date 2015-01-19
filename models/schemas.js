var config = require('../config.js');
var http = require('http');

/* Return an object with the following structure: 
*  {"version": "0", "schema": {...}}
*/
exports.get = function(name, cb){
	var options = {
		host: config.ENDPOINT,
		port: config.PORT,
		path: '/schema-repo/'+name+'/latest',
		method: 'GET',
		headers: {'Accept':'text/plain'}
	};
	http.request(options, function(res){
		res.setEncoding('utf8');
		if(res.statusCode == 200){
			res.on('data', function(data){
				var sch = {};
				sch.version = data.split('\t')[0];//extract version
				sch.name = name;
				sch.schema = JSON.parse(data.split('\t')[1]);//extract schema
				cb(null, sch);
			});
		} 		
	}).end();
};

/* Return an object with the following structure: 
*  {"version": "0", "schema": {...}}
*/
exports.getVersion = function(name, version, cb){
	var options = {
			host: config.ENDPOINT,
			port: config.PORT,
			path: '/schema-repo/'+name+'/id/'+version,
			method: 'GET',
			headers: {'Accept':'text/plain'}
		};

	http.request(options, function(res){
		res.setEncoding('utf8');
		if(res.statusCode == 200){
			res.on('data', function(data){
				var sch = {};
				sch.version = version;//extract version
				sch.name = name;
				sch.schema = JSON.parse(data);//extract schema
				cb(null, sch);
			});
		} else {
			cb(res.statusCode, null);
		} 		
	}).end();
};

/* Return an object with the following structure:
*  {"schemas": ["name1", "name2", ... , "nameN"]}
*/
exports.getAll = function(cb){
	var options = {
		hostname: config.ENDPOINT,
		port: config.PORT,
		path: '/schema-repo/',
		method: 'GET',
		headers: {'Accept':'text/plain'}
	};
	
	http.request(options, function(res){
		res.setEncoding('utf8');
		res.on('data', function(d){
			var array = d.split('\n');
			array.pop(); //remove last (empty) item
			array.sort(); 
			var obj = {};
			obj.schemas = array;
			cb(null, obj);
		}).on('error', function(err){
			console.error(err);
			cb(err, null);
		});
	}).end();
};

exports.put = function(name, sch, cb){
	var options = {
		hostname: config.ENDPOINT,
		port: config.PORT,
		path: '/schema-repo/'+name+'/register',
		method: 'PUT',
		headers: {'Content-Type': 'text/plain'}
	};

	var req = http.request(options, function(res){
		res.setEncoding('utf8');
		var data = '';
		res.on('data', function(d){
			data += d;
		}).on('end', function(){
			cb(null, data);
		});
	});

	req.write(sch);
	req.end();
};