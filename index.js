const fs = require('fs');
const http = require('http');
const url = require('url');

const json = fs.readFileSync(`${__dirname}/data/abouts.json`, 'utf-8');
const aboutsData = JSON.parse(json);

const server = http.createServer((req, res) => {
    const pathName = url.parse(req.url, true).pathname;
    const id = url.parse(req.url, true).query.id;
    console.log(id);
    if (pathName === '/about/index.html') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        fs.readFile(`${__dirname}/templates/template-sections-overview.html`, 'utf-8', (err, data) => {
            let overviewOutput = data;
            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {
                const cardsOutput = aboutsData.map(el => replaceTemplate(data, el)).join('');
                // console.log(cardsOutput);
                overviewOutput = overviewOutput.replace('%CARDS%', cardsOutput);
                res.end(overviewOutput);
            });
        });
    } else if (pathName === '/') {
        loadStaticFile(res, '/index.html');
    } else if (pathName === '/contact/index.html') {
        loadStaticFile(res, pathName);
    } else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) {
        loadStaticFile(res, `/data/img${parsePathToFileName(pathName)}`, 'image/jpg');
    } else if ((/\.css$/i).test(pathName)) {
        loadStaticFile(res, `/css${parsePathToFileName(pathName)}`, 'text/css');
    }
    else {
        res.writeHead(404, { 'Content-type': 'text/html' });
        res.end('URL was not found on the server');
    };
});

server.listen(1337, '127.0.0.1', () => {
    console.log('Listening for requests...');
});

function replaceTemplate(original, section) {
    let output = original.replace(/%TITLE%/g, section.title);
    output = output.replace(/%IMAGE%/g, section.image);
    output = output.replace(/%ID%/g, section.id);
    output = output.replace(/%TEXT%/g, section.text);
    console.log(output);
    return output;
};

function loadStaticFile(res, path, contentType = 'text/html') {
    fs.readFile(`${__dirname}${path}`, (err, data) => {
        res.writeHead(200, { 'Content-type': `${contentType}` });
        res.end(data);
    });
};

function parsePathToFileName(path) {
    // finds a file name with extention Ex: "/data/img/about/logo.png" output: "/logo.png"
    const regex = /(\/(.[^\/]+)\.(.+))$/i;
    const matchArr = path.match(regex);
    const fileName = matchArr[0];
    return fileName;
};

