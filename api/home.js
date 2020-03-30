const Router = require('koa-router'),
    // Mock = require('mockjs'),
    fs = require('fs'),
    path = require('path');
    // Random = Mock.Random;
let home = new Router();

home.get('/index', async (ctx, next) => {
    let content = "test ejs for koa",
        title = 'my ejs',
        userName = 'dana chen',
        num = 30,
        list = [{name:'jack',age:'33'},{name:'lucy',age:'13'},{name:'lily',age:'23'}];
    await ctx.render('home', {
        content,
        title,
        userName,
        num,
        list
    });
});

home.get('/list', async (ctx, next) => {
    ctx.response.status = 200
    // ctx.body = Mock.mock({
    //     "array|1-10": [{
    //         "name": "@cname",
    //         "age": '@integer(5, 80)',
    //         "adress": "@county(true)",
    //     }]
    // });
    await next()
}).get('/info', async (ctx, next) => {
    ctx.response.status = 200
    // ctx.body = Mock.mock({
    //     "object": {
    //         "name": "@cname",
    //         "age": '@integer(5, 80)',
    //         "adress": "@county(true)",
    //         "phone": /^1[3-9]\d{9}$/,
    //         "email": "@email",
    //     }
    // });
    await next()
});
home.post('/login', async (ctx, next) => {
    //console.log(`login query:${ctx.query}`)
    ctx.response.status = 200
    ctx.body = `request.body:${JSON.stringify(ctx.request.body)}`;
    await next()
});

home.post('/upload', async (ctx, next) => {
    //console.log(`login query:${ctx.query}`)
    ctx.response.status = 200
    console.log(`upload request files:${JSON.stringify(ctx.request.files)}`)
    let nameArr = ctx.request.files.myFile.name.split('.'),
        _fileName = nameArr[0] + `-${new Date().getTime()}` + '.' + nameArr[1],
        bf = fs.readFileSync(ctx.request.files.myFile.path)
    //console.log(_fileName)
    fs.writeFileSync(path.resolve(__dirname, `../uploadFile/${_fileName}`), bf)
    ctx.body = `../uploadFile/${_fileName}`;
    await next()
});

module.exports = home;