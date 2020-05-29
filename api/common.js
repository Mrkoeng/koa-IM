const Router = require('koa-router'),
    fs = require('fs'),
    path = require('path'),
    md5 = require('md5'),
    db = require('../db/index.js'),
    util = require('../util/index.js'),
    jsonwebtoken = require('jsonwebtoken');


const config = require('../config.js');
let doctor = new Router();

doctor.get('/login', async (ctx, next) => {
    let req_query = ctx.request.query;
    const {name,password} = req_query;
    let pwd = md5(password);
    let result = await db.findUser(name);
    result = util.toHumpFun(result)
    if (result) {
        // console.log(result);
        if (result.userPwd === pwd) {
            ctx.body = {
                success: true,
                message: '登录成功！',
                userInfo:{
                    name: result.userName,
                    userId: result.userId,
                    avatar:result.userHead,
                    token: jsonwebtoken.sign({userId: result.userId},config.jwt_secret, {expiresIn: '6h'})    // 加密userToken
                }
            };
            let time = new Date().getTime()
            db.updataUserInfo({
                user_count:1,
                user_id:result.userId
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
doctor.post('/register', async (ctx, next) => {
    // const { userService } = ServicesContext.getInstance();
    const {name,password} = ctx.request.body;
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
