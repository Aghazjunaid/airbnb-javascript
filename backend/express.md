1. In express what is the order of express.json, routing middleware, jwt middleware, error middleware
In an Express application, the order of middleware is important because they are executed in the order they are defined. Here's the typical order:

express.json(): This is a built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser. 
It should be placed at the top so that it can parse the body of incoming requests before any other middleware or route handler has a chance to process the request.

JWT Middleware: This middleware is used to authenticate users. It should be placed after express.json() so that 
it can access the parsed request body if needed (for example, to get the JWT token from the request body). However, it should be placed before your routes so that it can authenticate the request before it reaches your route handlers.

Routing Middleware: This middleware is used to handle different routes. It should be placed after express.json() 
and the JWT middleware so that the request body is parsed and the request is authenticated before it reaches your route handlers.

Error Middleware: This middleware is used to handle errors. It should be placed at the end, after all other app.use() and routes calls. 
This is because it needs to catch any errors that are thrown in the above middleware or routes.

So, the order should be: express.json(), JWT middleware, routing middleware, error middleware.
