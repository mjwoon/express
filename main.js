const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require('body-parser')
const compression = require('compression')
const helmet = require('helmet');
app.use(helmet);

const topicRouter = require('./routes/topic.js')
const indexRouter = require('./routes/index.js')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.get('*', function (request, response, next) {
    fs.readdir('./data', function (error, fileList) {
        request.list = fileList;
        next();
    });
})

app.use('/', indexRouter)

app.use('/topic', topicRouter);

app.use(function (req, res) {
    res.status(404).send('Sorry cant find that!');
});

app.use(function(err, req, res) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3000, () => console.log("Example app listening on port 3000"));
