var Schemas = require('../models/schemas.js');

exports.index = function(req, res){
	Schemas.getAll(function(err, schemas){//get all subjects
		if(err){
				console.log(err.code);
				var obj = {
					info: '<strong>Error: </strong>'+err,
					type: 'danger'
				};
				res.render('schemas/show.dust', obj);
		} else {
			var arr = [];
			for(var i in schemas.schemas){//for each subject get its description and version
				Schemas.get(schemas.schemas[i], function(err, schema){
					if(err){
						console.log(err);
					} else{
						arr.push({
							name: schema.name,
							version: schema.version,
							desc: schema.schema.doc
						});
						if(arr.length === schemas.schemas.length){//means that all requests are terminated
							var obj = {};
							obj.schemas = arr;
							obj.schemas.sort(keysrt('name'));
							res.render('schemas/index.dust', obj);	
						}
					}
				});
			}
		}
	});	
};

exports.show = function(req, res){
	var name = req.params.name;
	var version = req.params.version;
	if(typeof version === 'undefined'){
		Schemas.get(name, function(err, schema){
			if(err){
				console.log(err.code);
				var obj = {
					info: '<strong>Error: </strong>'+err,
					type: 'danger'
				};
				res.render('schemas/show.dust', obj);
			} else {
				var obj = {};
				obj.name = schema.schema.name;
				obj.subject = name;
				obj.namespace = schema.schema.namespace;
				obj.description = schema.schema.doc;
				obj.version = schema.version;
				obj.raw = JSON.stringify(schema.schema, undefined, 2);
				obj.schemas = parseSchema(schema.schema);
				res.render('schemas/show.dust', obj);
			}
		});
	} else {
		Schemas.getVersion(name, version, function(err, schema){
			if(err){
				var obj = {
					info: '<strong>Error: </strong>'+err,
					type: 'danger'
				};
				res.render('schemas/show.dust', obj);
			} else{
				var obj = {};
				obj.name = schema.schema.name;
				obj.subject = name;
				obj.namespace = schema.schema.namespace;
				obj.description = schema.schema.doc;
				obj.version = schema.version;
				obj.raw = JSON.stringify(schema.schema, undefined, 2);
				obj.schemas = parseSchema(schema.schema);
				res.render('schemas/show.dust', obj);
			}
		});
	}
};

exports.put = function(req, res){
	var name = req.params.name;
	try{
	var sch = JSON.stringify(JSON.parse(req.body.sch));
	Schemas.put(name, sch, function(err, data){
		var obj = {
			info: 'Schema <strong>successfully</strong> updated, version: '+data,
			type: 'success'
		};
		res.render('schemas/show.dust', obj);
	});
	}catch(e){
		var obj = {
			info: '<strong>Error</strong>: '+e,
			type: 'danger'
		}
		res.render('schemas/show.dust', obj);
	}
}

//http://stackoverflow.com/questions/16648076/sort-array-on-key-value
function keysrt(key,desc) {
  return function(a,b){
   return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
  }
}

function parseSchema(sch){
	var records = []; 
	records.push(sch);//add current record and continue to check if some fields contain other records
	for(var i in sch.fields){//iterate through the fields
		var type_str = '';//string representation of a field type
		if(sch.fields[i].type instanceof Array){ //union (e.g ["null", "int"])
			for(var j in sch.fields[i].type){
				if(sch.fields[i].type[j] instanceof Object){ //Object field type ( = complex type)
					records.push(parseObject(sch.fields[i].type[j]));
					sch.fields[i].type_str = complexType(type_str, sch.fields[i].type[j]);
				} else { //simple type
					type_str += sch.fields[i].type[j];
					sch.fields[i].type_str = type_str;
					if(sch.fields[i].type[j] == 'fixed') sch.fields[i].type_str += '['+sch.fields[i].size+']';
				}
				if(j+1 < sch.fields[i].type.length) type_str += ' | ';
			}
		} else{ //(!= union field)
			if(sch.fields[i].type instanceof Object){
				records.push(parseObject(sch.fields[i].type));
				sch.fields[i].type_str = complexType(type_str, sch.fields[i].type);
			} else {
				type_str += sch.fields[i].type;
				sch.fields[i].type_str = type_str;
				if(sch.fields[i].type == 'fixed') sch.fields[i].type_str += '['+sch.fields[i].size+']';
			}
		}
	}
	return [].concat.apply([],records); //flatten records
}

function parseObject(obj){
	if(obj.type != 'record'){
		if(obj.type == 'array') return parseArray(obj);
		else if(obj.type == 'map') return parseMap(obj);
		else if(obj.type == 'enum') return parseSchema(obj);
		else return [];
	}
	else return parseSchema(obj);
}

function parseArray(obj){
	if(obj.items instanceof Object) return parseObject(obj.items);
	else return [];
}

function parseMap(obj){
	if(obj.values instanceof Object) return parseObject(obj.values);
	else return [];
}

function complexType(str, obj){
	if(obj.type == 'array') str = arrayType(str, obj);
	else if(obj.type == 'map') str = mapType(str, obj);
	else if(obj.type == 'record') str += '<a href="#'+obj.name+'">'+obj.name+'</a>';
	else if(obj.type == 'fixed') str += obj.name+'['+obj.size+']';
	else if(obj.type == 'enum') str += 'enum[<a href="#'+obj.name+'">'+obj.name+'</a>]';
	return str;
}

function arrayType(str, arr){
	str+='array&lt;';
	if(arr.items instanceof Object) str = complexType(str, arr.items);
	else str+=arr.items;
	str+='&gt;';
	return str;
}

function mapType(str, obj){
	str+='map&lt;string,';
	if(obj.values instanceof Object) str = complexType(str, obj.values);
	else str+=arr.values;
	str+='&gt;';
	return str;
}
