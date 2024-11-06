const express = require('express');
const router = express.Router();
const template = require("../lib/template");

// route, routing
// app,get('/', (req, res) => res.send('Hello World!'))

router.get('/', function (request, response) {
    const title = 'Welcome';
    const description = 'Hello, Node.js';
    const list = template.list(request.list);
    const html = template.HTML(title, list,
        `<h2>${title}</h2>${description}
            <img src="/images/hello.jpg" style="width:300px; display: block; margin-top: 10px;"`,
        `<a href="/topic/create">create</a>`
    );
    response.end(html);
});

module.exports = router;