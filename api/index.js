const fs = require('fs')
const Router = require('koa-router')
const path=require('path')
const router = new Router()
//console.log(__dirname)
 let urls = fs.readdirSync(path.join(__dirname))

urls.forEach((element) => {
    if(element=='index.js') return
    let module = require(__dirname + '/' + element)
    /*
      urls 下面的每个文件负责一个特定的功能，分开管理
      通过 fs.readdirSync 读取 urls 目录下的所有文件名，挂载到 router 上面
    */
    router.use('/' + element.replace('.js', ''), module.routes(), module.allowedMethods())
})
 
module.exports=router