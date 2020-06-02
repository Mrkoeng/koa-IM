const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const logger = require('koa-logger')
const debug = require('debug')('demo:server');
const Moment = require('moment');
const http = require('http'),
    koaBody = require('koa-body'),
    koaStatic = require('koa-static'),
    router = require('./api'),
    path = require('path'),
    creatSocket = require('./socket'),
    cors = require('koa2-cors'),
    koajwt = require('koa-jwt'),
    config = require('./config.js');

// error handler
onerror(app)

// middlewares 中间件
//控制台日志
const TimeLogger = logger(str => {
    console.log(Moment().format('YYYY-MM-DD HH:mm:ss') + str);
})
app.use(TimeLogger) 

/**静态资源（服务端） */
app.use(koaStatic(path.join(__dirname + "/public")));


// 跨域
app.use(cors({
    origin: function(ctx) {
        // if (ctx.url === '/test') {
        return "*"; // 允许来自所有域名请求
        // }
    },
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

app.use(koaBody({
    multipart: true, // 支持文件上传
    encoding:'gzip',
    formidable: {
        // uploadDir: path.join(__dirname, 'uploads'),
        keepExtensions:true,//保持文件后缀
        // onFileBegin:(name,file)=>{
        //     console.log(`name:${name}`);
        //     console.log(firle);
        // }
        
    }
}));

// JSON解析
app.use(json())

// app.use(views(__dirname + '/views', {
//     extension: 'pug'
// }))

// routes
app.use(router.routes());

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});
// 对token进行验证
app.use(async (ctx, next) => {
    return next().catch((err) => {
        if (err.status === 401) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: err.message
            }
        } else {
            throw err;
        }
    })
});

// app.use(koajwt({ secret: config.jwt_secret, passthrough: true }).unless({
//     // 登录，注册接口不需要验证
//     path: [/^\/api\/login/]
// }));




/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
// app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app.callback());

const socketServer = require('http').createServer().listen(1888);
creatSocket(socketServer);
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
console.log(`-----------服务运行成功，本地端口：${port}----------`);

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}
