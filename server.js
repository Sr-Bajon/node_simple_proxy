var express    = require('express');
var app        = express();
var https      = require('https');
var fs         = require('fs');
var bodyParser = require('body-parser');
var conf       = require('./configuration');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('*', function (req, res, next) {
  console.log('Peticion a: ', req.url);
  next();
});

app.all(conf.path, function (clientReq, clientRes) {
  // la url que espera el servidor es sin /api/ asi que lo quito
  var url = '/' + clientReq.params[0];

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  var postData = JSON.stringify(clientReq.body);

  var options = {
    hostname: conf.hostname,
    port    : conf.port,
    path    : url,
    method  : clientReq.method,
    headers : clientReq.headers,
    key     : fs.readFileSync('sslKey/key.key'),
    cert    : fs.readFileSync('sslKey/key.crt')
  };

  var req = https.request(options, function (resp) {
    resp.setEncoding('utf8');
    console.log(`STATUS: ${resp.statusCode}`);

    var status  = resp.statusCode;
    var chunker = '';

    resp
      .on('data', function (chunk) {
        chunker += chunk;
      })
      .on('end', function () {
        console.log('Finalizado: ', clientReq.url);
        clientRes.status(status);
        clientRes.send(chunker);
      })
      .on('error', function (e) {
        console.log(e);
      })
    ;
  });

  req.on('error', function (e) {
    console.log(e);
  });

  req.write(postData);
  req.end();
  console.log('Enviada peticion: ', clientReq.url);

});

if (conf.staticContent !== null) {
  app.use(express.static(conf.staticContent));
}

var privateKey  = fs.readFileSync('sslKey/key.key');
var certificate = fs.readFileSync('sslKey/key.crt');

var credentials = {key: privateKey, cert: certificate};

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(conf.serverPort, function () {
  console.log('Magic is happening on port ' + conf.serverPort);
});
