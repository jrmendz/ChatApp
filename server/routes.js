Router.onBeforeAction(Iron.Router.bodyParser.urlencoded({
    extended: true
}));

Router.onBeforeAction(Iron.Router.bodyParser.json({
    limit: '100mb'
}));

Router.onBeforeAction(function (req, res, next) {
//    console.log(req.body);
    if(req.url == '/interaction') next();
    var Busboy = Meteor.npmRequire("busboy"),
    fs = Npm.require("fs"),
    Fiber = Npm.require("fibers");
    var theFileName = ''; // Store filename and then pass them to request.
    var body = {};
    var dt = new Date();
    var timestamp = dt.getFullYear() + '_' + (dt.getMonth()+1) + '_' + dt.getDate() + '__' + dt.getHours() + '_' + dt.getMinutes() + '_' + dt.getMilliseconds();
    var uploadLocation = '../../../../../.files/';
//    console.log(req);
    if(req.method === 'GET' && req.url.indexOf('/files/') > -1) {
        next();
    } else if (req.method === "POST") {
        if(req.headers['content-type'] == 'application/json; charset=UTF-8') next();
        else {
            var busboy = new Busboy({ headers: req.headers });
            busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
                var dt = new Date();
                var timestamp = dt.getFullYear() + '_' + (dt.getMonth()+1) + '_' + dt.getDate() + '__' + dt.getHours() + '_' + dt.getMinutes() + '_' + dt.getMilliseconds();
                if(fieldname == 'audio') filename = 'audio__' + timestamp + '.wav';
                else {
                    var filenameArray = filename.split('.');
                    var extension = filenameArray.pop();
                    filename = filenameArray.join('_') + '__' + timestamp + '.' + extension;
                }
                var saveTo = uploadLocation + filename;
                file.pipe(fs.createWriteStream(saveTo));
                theFileName = filename;
            });

            busboy.on("field", function(fieldname, value) {
                if(fieldname == 'screenshot') {
                    filename = 'screenshot__' + timestamp + '.png';
                    var saveTo = uploadLocation + filename;
                    var imageDataUrl = value;
                    var dataUrlRegExp = /^data:image\/\w+;base64,/;
                    var base64Data = imageDataUrl.replace(dataUrlRegExp, "");
                    var imageBuffer = new Buffer(base64Data, "base64");
                    var fsWriteFileSync = Meteor.wrapAsync(fs.writeFile, fs);

                    Fiber(function() { fsWriteFileSync(saveTo, imageBuffer); }).run();

                    theFileName = filename;
                } else body[fieldname] = value;
            });
            busboy.on("finish", function () {
                // Pass filenames to request
                req.filename = theFileName;
                req.bodyParams = body;
                next();
            });
            // Pass request to busboy
            req.pipe(busboy);
        }
    }
});

Router.route('/interaction', {where: 'server'})
    .post(function () {
        this.response.setHeader("Content-Type", "application/json");
        this.response.setHeader("Access-Control-Allow-Origin", "*");
        this.response.setHeader("Access-Control-Allow-Credentials", true);
        this.response.setHeader("Access-Control-Allow-Methods", "POST");
        this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        this.response.statusCode = 200;
    
        var body = this.request.body;
        var from = body.From;
        var to = body.To;
        console.log(body);
        console.log('body');
//        this.response.end();
        this.response.end(JSON.stringify({success: '200 OK'}));
        
        var fromAgent = (body.fromAgent == '1') ? '1' : '0';
        var blocked = '0';
        if(fromAgent != '1') blocked = Meteor.serverFn.checkConsumer(body);
        var interaction = {
            businessNumber: to,
            consumerNumber: from,
            message: body.Body,
            attachment: Meteor.serverFn.checkAttachment(body.NumMedia, body.MediaUrl0, body.MediaContentType0),
            timestamp: Meteor.serverFn.getDateTimeNow(),
            seen: fromAgent,
            fromAgent: fromAgent,
            messageId: body.MessageSid,
            blocked: blocked,
            groupId: ''
        };
    
        var group = GroupConversations.findOne({consumers: {$in: [from]}, active: '1'});
        if(group) interaction.groupId = group._id;//TODO: send to other participating consumers and indicate sender
    
        var interactionId = Interactions.insert(interaction);
        Meteor.serverFn.checkBusinessHours(to, from);
        Meteor.serverFn.checkOptOut(to, from, body.Body);
        Meteor.serverFn.checkGroupBreak(to, from, body.Body);
        Meteor.serverFn.checkPoundcodes(to, from, body.Body);
    });

Router.route('/upload', {where: 'server'})
    .post(function () {
        this.response.statusCode = 200;
        this.response.setHeader("Content-Type", "application/json");
        this.response.setHeader("Access-Control-Allow-Origin", "*");
        this.response.setHeader("Access-Control-Allow-Credentials", true);
        this.response.setHeader("Access-Control-Allow-Methods", "POST");
        this.response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        
        var bodyParams = this.request.bodyParams;
        var filename = this.request.filename;
        if(bodyParams.task_id && bodyParams.user_id) {
            var id = TaskFiles.insert({
                task_id: bodyParams.task_id,
                user_id: bodyParams.user_id,
                timestamp: Meteor.serverFn.getDateTimeNow(),
                file_name: filename,
                file_location: '/.files'
            });
            this.response.end('success: ' + id);
        } else this.response.end(JSON.stringify({filename: filename}));
    });

Router.route(/^\/files\/(.*)$/, {where: 'server'})
    .get(function () {
        var fs = Npm.require("fs");
        var filePath = '../../../../../.files/' + this.params[0];
        var data = fs.readFileSync(filePath);
        this.response.writeHead(200);
        this.response.write(data);
        this.response.end();
    });