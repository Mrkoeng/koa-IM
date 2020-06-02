const Router = require('koa-router'),
    md5 = require('md5'),
    db = require('../db/index.js'),
    util = require('../util/index.js'),
    fs = require('fs'),
    jsonwebtoken = require('jsonwebtoken');
const upload= {
        UPLOAD: '/uploadFile',
        IMAGE: '/image/',
        FILE: '/file/',
        VOICE:'/voice/'
    }
const config = require('../config.js');
let common = new Router();

common.get('/login', async (ctx, next) => {
    let req_query = ctx.request.query;
    const {
        name,
        password
    } = req_query;
    let pwd = md5(password);
    let result = await db.findUser(name);
    if (result) {
        result = util.toHumpFun(result)
        if (result.userPwd === pwd) {
            ctx.body = {
                success: true,
                message: '登录成功！',
                userInfo: {
                    name: result.userName,
                    userId: result.userId,
                    avatar: result.userHead,
                    token: jsonwebtoken.sign({
                        userId: result.userId
                    }, config.jwt_secret, {
                        expiresIn: '6h'
                    }) // 加密userToken
                }
            };
            let time = new Date().getTime()
            db.updataUserInfo({
                user_count: 1,
                user_id: result.userId
            });
        } else {
            ctx.body = {
                success: false,
                message: '密码错误！',
            };
        }
    } else {
        ctx.body = {
            success: false,
            message: '用户不存在！',
        };
    }
});
common.post('/register', async (ctx, next) => {
    // const { userService } = ServicesContext.getInstance();
    const {
        name,
        password
    } = ctx.request.body;
    // console.log(name, password);
    const result = await db.findUser(name);
    // console.log(result);
    if (result) {
        ctx.body = {
            success: false,
            message: '用户名已存在',
        };
    } else {
        ctx.response.status = 200;
        await db.addUser({
            user_head: util.genHeadimg(),
            user_name: util.randomText(),
            user_id: name,
            user_pwd: md5(password)
        });
        ctx.body = {
            success: true,
            message: '注册成功！',
        };
        console.log('注册成功');
    }
});

router.post("/upload", async (ctx) => {
    console.log(ctx.request);
    const file = ctx.request.files.file;
    const reader = fs.createReadStream(file.path);
    let filePath = __dirname + "/uploadFile/";
    let fileResource = filePath + `/${file.name}`;
    // if (!fs.existsSync(filePath)) { //判断staic/upload文件夹是否存在，如果不存在就新建一个
    //     fs.mkdir(filePath, (err) => {
    //         if (err) {
    //             throw new Error(err)
    //         } else {
    //             let upstream = fs.createWriteStream(fileResource);
    //             reader.pipe(upstream);
    //             ctx.response.body = {
    //                 url: uploadUrl + `/${file.name}`
    //             }
    //         }
    //     })
    // } else {
    //     let upstream = fs.createWriteStream(fileResource)
    //     reader.pipe(upstream);
    //     ctx.response.body = {
    //         url: uploadUrl + `/${file.name}` //返给前端一个url地址
    //     }
    // }
})

module.exports = common;
