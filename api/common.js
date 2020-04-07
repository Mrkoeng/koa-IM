const Router = require('koa-router'),
    fs = require('fs'),
    path = require('path'),
    md5 = require('md5'),
    db = require('../db/index.js'),
    jsonwebtoken = require('jsonwebtoken');


const config = require('../config.js');
let doctor = new Router();

doctor.get('/login', async (ctx, next) => {
    let req_query = ctx.request.query;
    const {
        name,
        password
    } = req_query;
    let pwd = md5(password);
    const result = await db.findUser(name);
    if (result) {
        if (result.user_pwd === pwd) {
            ctx.body = {
                success: true,
                message: '登录成功！',
                // userinfo:{
                //     name: result.user_name,
                //     id: result.user_id
                // },
                token: jsonwebtoken.sign(
                    {
                        id: result.user_id
                    }, // 加密userToken
                    config.jwt_secret, {
                        expiresIn: '5h'
                    }
                ),
            };
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
doctor.post('/register', async (ctx, next) => {
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
        ctx.body = {
            success: true,
            message: '注册成功！',
        };
        console.log('注册成功');
        db.addUser({
            name,
            password: md5(password)
        });
        // userService.insertData([name, md5(password)]);
    }
});

module.exports = doctor;
