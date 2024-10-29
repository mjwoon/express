const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const qs = require('querystring');
const compression = require('compression')

const template = require('./lib/template.js')

app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.get('*', function (request, response, next) {
    fs.readdir('./data', function (error, filelist) {
        request.list = filelist;
        next();
    });
})

// route, routing
// app,get('/', (req, res) => res.send('Hello World!'))
app.get('/', function (request, response) {
    const title = 'Welcome';
    const description = 'Hello, Node.js';
    const list = template.list(request.list);
    const html = template.HTML(title, list,
        `<h2>${title}</h2>${description}`,
        `<a href="/create">create</a>`
    );
    response.end(html);
});

app.get('/page/:pageId', function (request, response) {
    const filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        const title = request.params.pageId;
        const sanitizedTitle = sanitizeHtml(title);
        const sanitizedDescription = sanitizeHtml(description, {
            allowedTags: ['h1']
        });
        const list = template.list(request.list);
        const html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            ` <a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                <form action="/delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
        );
        response.send(html);
    });

});

app.get('/create', function (request, response) {
    const title = 'WEB - create';
    const list = template.list(request.list);
    const html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
    response.send(html);

})

app.post('/create_process', function (request, response) {
    /*
    const body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        const post = qs.parse(body);
        const title = post.title;
        const description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
        });
    });
       */
    const post = request.body;
    const title = post.title;
    const description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
    });

});

app.get('/update/:pageId', function (request, response) {
    const filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        const title = request.params.pageId;
        const list = template.list(request.list);
        const html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.send(html);
    });


});

app.post('/update_process', function (request, response) {
    const post = request.body;
    const id = post.id;
    const title = post.title;
    const description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            response.redirect(`/?id=${title}`);
        })
    });

});

app.post('/delete_process', function (request, response) {
    const post = request.body;
    const id = post.id;
    const filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
        response.writeHead(302, {Location: `/`});
        response.end();
    });

});

app.listen(3000, () => console.log("Example app listening on port 3000"));

// const http = require('http');
// const fs = require('fs');
// const url = require('url');
// const qs = require('querystring');
// const template = require('./lib/template.js');
//
//
//
// const app = http.createServer(function(request,response){
//     const _url = request.url;
//     const queryData = url.parse(_url, true).query;
//     const pathname = url.parse(_url, true).pathname;
//     if(pathname === '/'){
//       if(queryData.id === undefined){
//
//         });
//       } else {
//
//
//     } else if(pathname === '/create'){
//
//       });
//     } else if(pathname === '/create_process'){
//
//       });
//     } else if(pathname === '/update'){
//
//       });
//     } else if(pathname === '/update_process'){
//
//     } else if(pathname === '/delete_process'){
//       const body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           const post = qs.parse(body);
//           const id = post.id;
//           const filteredId = path.parse(id).base;
//           fs.unlink(`data/${filteredId}`, function(error){
//             response.writeHead(302, {Location: `/`});
//             response.end();
//           })
//       });
//     } else {
//       response.writeHead(404);
//       response.end('Not found');
//     }
// });
// app.listen(3000);
