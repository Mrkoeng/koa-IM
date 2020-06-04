const Koa = require('koa')
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

const app = new Koa()

// error handler
onerror(app)

//控制台日志
const TimeLogger = logger(str => {
    console.log(Moment().format('YYYY-MM-DD HH:mm:ss') + str);
})
app.use(TimeLogger)

/**静态资源（服务端） */
app.use(koaStatic(path.join(__dirname + "/public")));
app.use(koaStatic(path.join(__dirname + "/uploadFile")));

http://hocalhost:3000/uploadFile/jx2sjkrv8xc0000000638aeba9594c199475d1b2ee50b5f07e.png
http://127.0.0.1:3000/images/avatar/e377017c6686136394e91b6a3ef47077.jpeg
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

// JSON解析
app.use(json())

app.use(koaBody({multipart: true}));

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
app.use(koajwt({ secret: config.jwt_secret}).unless({
    // 登录，注册接口不需要验证
    path: [/^\/api\/common\/login/]
}));

// app.use(verify());

// routes
app.use(router.routes());

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});




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
