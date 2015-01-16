# schema-repo-frontend
A frontend for browsing an [avro schema repo](https://github.com/schema-repo/schema-repo) .

Schemas are not cached but got on demand from the REST api provided by the schema repo. 

Inspired by [avrodoc](https://github.com/ept/avrodoc).

## How to use it?

Open config.js and set the following variables:

* ENDPOINT: url of schema repo (e.g "localhost")
* SCHEMA_REPO_PORT: port of schema repo (e.g 2876)
* LOCAL_PORT: local port (e.g 8082)

Then:

	$ npm install
	$ node server.js
	
