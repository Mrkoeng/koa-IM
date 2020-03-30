const Router = require('koa-router');
// const Mock = require('mockjs');
// const Random = Mock.Random;
let info = new Router();

info.get('/', async (ctx, next) => {
    let content = "test ejs for koa",
        title = 'my ejs',
        userName = 'dana chen',
        num = 30,
        list = [{name:'jack',age:'33'},{name:'lucy',age:'13'},{name:'lily',age:'23'}];
    await ctx.render('info', {
        content,
        title,
        userName,
        num,
        list
    });
});
info.get('/index', async (ctx, next) => {
    let content = "test ejs for koa",
        title = 'my ejs',
        userName = 'dana chen',
        num = 30,
        list = [{name:'jack',age:'33'},{name:'lucy',age:'13'},{name:'lily',age:'23'}];
    await ctx.render('info', {
        content,
        title,
        userName,
        num,
        list
    });
});

info.get('/list', async (ctx, next) => {
    ctx.response.status = 200
    // ctx.body = Mock.mock({
    //     "array|1-10": [{
    //         "name": "@cname",
    //         "id": '@id()',
    //         "content": "@csentence()",
    //     }]
    // });
    await next()
}).get('/user/:id', async (ctx, next) => {
    ctx.response.status = 200
    // ctx.body = Mock.mock({
    //     "object|1": {
    //         "name": "@cname",
    //         "age": '@integer(5, 80)',
    //         "adress": "@county(true)",
    //         "phone": /^1[3-9]\d{9}$/,
    //         "email": "@email",
    //     }
    // });
    await next()
});
module.exports = info;