const Router = require('koa-router'),
    fs = require('fs'),
    path = require('path');
db = require('../db/index.js');

let doctor = new Router();

doctor.post('/login', async (ctx, next) => {
    let req_query = ctx.request.query;
    //console.log('req_query:', req_query.pageSize);\
    let data = await address.getAddressInfos({
        pageSize: req_query.pageSize,
        pageNum: req_query.pageNum
    });
    ctx.response.status = 200;
    ctx.body = data;
    await next();
});
doctor.post('/register', async (ctx, next) => {
    console.log('register');
    // const { userService } = ServicesContext.getInstance();
    const {
        name,
        password
    } = ctx.request.body;
    console.log(name, password);
    // const result = await userService.findDataByName(name);
    const result = await db.findUser(name);
    console.log(result);
    if (result) {
        ctx.body = {
            success: false,
            message: '用户名已存在',
        };
    } else {
        ctx.body = {
            success: true,
            message: '注册成功！',
        };
        console.log('注册成功');
        db.addUser({name,password});
        // userService.insertData([name, md5(password)]);
    }
});

module.exports = doctor;
