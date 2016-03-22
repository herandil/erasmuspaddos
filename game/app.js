var exec = require('child_process').exec;
var outputPath = './public/uploads/';
var fs  = require('fs');
var express = require('express');
var multer  = require('multer');
var crypto = require('crypto');
var path = require('path');
var mime = require('mime');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, outputPath)
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});

io.on('connection', function (socket) {
  require('./server/socket-config.js')(socket);
});

var upload = multer({ storage: storage });
var bodyParser = require('body-parser');
var PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');


app.post('/uploadSound', upload.single('fffds'), function (req, res, next) {

  var fileName = req.file.filename;
  var outputFilename = outputPath + fileName;
  var outputMp3 = 'mp3' + fileName.split('.')[0];
  var cmd = 'ffmpeg -i '+ outputFilename +' -acodec libmp3lame -aq 4 ' + outputPath + outputMp3 + '.mp3';
  exec(cmd, function(error, stdout, stderr) {
    if(error) return console.log(error);
    fs.unlink(path.resolve(outputFilename), function(){});
    res.json({
      filePath: outputMp3
    });

  });

});

app.get('*', function(req, res) {
  res.render('game');
});


server.listen(+PORT, function() {
  console.log('listening on port %s, open your browser on localhost:%s', PORT, PORT);
});

