const mysql = require('mysql')
const utils = require('../util/index.js')
const pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'koeng123',
    database: 'im_mysql'
})

pool.getConnection((err, connection)=> {
    if (err) {
        console.log("建立连接失败");
    } else {
        console.log("建立连接成功");
        console.log(pool._allConnections.length); //  1
        connection.query('select * from user_info', (err, rows)=> {
            connection.release();
            if (err) {
                console.log("查询失败");
            } else {
                console.log(rows);
            }
            console.log(pool._allConnections.length); // 0
        })
    }
    // pool.end();
})
const commomTable = {
    users: `CREATE TABLE IF NOT EXISTS user_info (
      id INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '(自增长)',
      user_id VARCHAR ( 100 ) NOT NULL COMMENT '账号',
      user_name VARCHAR ( 100 ) NOT NULL COMMENT '用户名',
      user_pwd VARCHAR ( 100 ) NOT NULL COMMENT '密码',
      user_head VARCHAR ( 225 ) NOT NULL COMMENT '头像',
      user_mobile VARCHAR ( 20 ) NOT NULL DEFAULT '' COMMENT '手机',
      user_email VARCHAR ( 64 ) NOT NULL DEFAULT '' COMMENT '邮箱',
      user_creatdata TIMESTAMP NOT NULL DEFAULT NOW( ) COMMENT '注册日期',
      user_login_time TIMESTAMP DEFAULT NOW( ) COMMENT '登录时间',
      user_socketid VARCHAR ( 225 ) COMMENT 'socketid',
      user_count INT COMMENT '登录次数'
    ) ENGINE = INNODB charset = utf8;`,
    privatemsg: `CREATE TABLE  IF NOT EXISTS private_msg (
      id int(11) NOT NULL AUTO_INCREMENT,
      from_user varchar(15) NOT NULL,
      to_user varchar(15) NOT NULL,
      message text,
      type varchar(20) NOT NULL,
      time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
      attachments varchar(250) DEFAULT '[]',
      PRIMARY KEY (id),
      KEY from_user (from_user),
      KEY to_user (to_user)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`,
    off_line_msg:`CREATE TABLE  IF NOT EXISTS off_line_msg (
      id int(11) NOT NULL AUTO_INCREMENT,
      from_user varchar(15) NOT NULL DEFAULT '',
      to_user varchar(15) NOT NULL DEFAULT '',
      message text DEFAULT '',
      type varchar(20) NOT NULL DEFAULT '',
      time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
      attachments varchar(250) DEFAULT '[]',
      PRIMARY KEY (id),
      KEY from_user (from_user),
      KEY to_user (to_user)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`,
    user_relation: `CREATE TABLE IF NOT EXISTS user_user_relation (
      id int(11) NOT NULL AUTO_INCREMENT,
      user_id VARCHAR(16) NOT NULL,
      from_user VARCHAR(16) NOT NULL,
      remark varchar(10) DEFAULT NULL,
      time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() COMMENT '添加好友时间',
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`,
}

let query = function(sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                resolve(err)
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        //数据转驼峰
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}


let createTable = function(sql) {
    return query(sql, [])
}
// 建表
// console.log('create table');
// createTable(commomTable.users)

// 查询用户是否存在
let findUser = async function(id) {
    let _sql = `
        SELECT * FROM user_info where user_id="${id}" limit 1;
    `
    let result = await query(_sql)

    if (Array.isArray(result) && result.length > 0) {
        result = result[0]
    } else {
        result = null
    }
    return result
}

// 创建用户
let addUser = async function(userinfo) {
    let _sql =
        `
       INSERT INTO user_info 
       ( user_id,user_name,user_pwd,user_head,user_creatdata,user_login_time)
       VALUES
       ( "${userinfo.user_id}","${userinfo.user_name}", "${userinfo.user_pwd}", "${userinfo.user_head}",Now(),Now())
    `
    let result = await query(_sql)
    console.log('创建用户结果', result);
    if (Array.isArray(result) && result.length > 0) {
        result = result[0]
    } else {
        result = null
    }
    return result
}

    
// 查询用户好友列表
let findUserFriendList = async ({user_id})=> {
    let _sql =
        `SELECT ul.user_name,ul.user_id,ul.user_head,ur.remark 
        FROM user_info ul 
        LEFT JOIN 
        user_user_relation ur 
        on ur.user_id = ul.user_id 
        where ur.from_user = "${user_id}";
        `
    return query(_sql)
}


// 更新用户登录次数和登录时间及
let updataUserInfo = async ({user_count,user_id})=> {
    let _sql =
        `UPDATE user_info SET user_count = "${user_count}", user_login_time = NOW() WHERE user_id = "${user_id}" limit 1;`
    return query(_sql)
}

// 更新用户socketid
let saveUserSocketId = async ({user_socketid, user_id})=> {
    let value = [user_socketid, user_id]
    let _sql =
        'UPDATE user_info SET user_socketid=? WHERE user_id = ? limit 1;'
    return query(_sql, value)
}
// 保存所有私聊信息
let savePrivateMsg = async ({ from_user, to_user, message, type, attachments })=>{
    const value = [from_user, to_user, message, type, attachments];
    let _sql =
        `INSERT INTO private_msg(from_user,to_user,message,type,attachments,time)  VALUES(?,?,?,?,?,CURRENT_TIMESTAMP());`
    return query(_sql, value)
}

// 保存离线信息
let saveOffLineMsg = async ({ from_user, to_user, message, type, attachments })=>{
    const value = [from_user, to_user, message, type, attachments];
    let _sql =
        `INSERT INTO off_line_msg(from_user,to_user,message,type,attachments,time)  VALUES(?,?,?,?,?,CURRENT_TIMESTAMP());`
    return query(_sql, value)
}
// 获取用户socketid
let getUserSocketId = async (id)=>{
    let _sql =
    `
        SELECT user_socketid FROM user_info where user_id="${id}" limit 1;
    `
    return query(_sql)
}
// 获取用户聊天所有信息
let getAllMessage = async ({ user_id })=>{
    let _sql =
        `
        SELECT * FROM private_msg WHERE from_user="${user_id}" OR to_user="${user_id}";
        `
    return query(_sql)
}

// 获取用户聊天所有信息
let isFriends = async ({from_user,user_id})=>{
    let _sql =
        `
        SELECT * FROM user_user_relation WHERE from_user="${from_user}" AND user_id="${user_id}";
        `
    let result = await query(_sql)
    if (Array.isArray(result) && result.length > 0) {
        result = true
    } else {
        result = false
    }
    return result
}

  // 获取离线信息
let getOffLineMessage = async ({ user_id })=>{
  let _sql =
      `
      SELECT A.*,B.user_name,B.user_head FROM
      (SELECT from_user,message,time,to_user,attachments,type FROM off_line_msg WHERE to_user="${user_id}") A
      LEFT JOIN
      (SELECT  user_id,user_name,user_head FROM user_info) B
      ON A.from_user=B.user_id;
      `
      // on ur.user_id = ul.to_user
  return query(_sql)
}
let deleteOffLineMessage =  async ({ user_id })=>{
    let _sql =
        `
        DELETE FROM off_line_msg WHERE to_user="${user_id}";
        `
    return query(_sql)
}
// 双方添加好友
let addFriends = async ({from_user, to_user})=>{
    let _sql =
        `INSERT INTO user_user_relation(from_user,user_id)  VALUES("${from_user}","${to_user}"),("${to_user}","${from_user}");`
    return query(_sql)
}

module.exports = {
    //暴露方法
    // createTable,
    addUser,
    findUser,
    isFriends,
    addFriends, 
    findUserFriendList,
    updataUserInfo,
    saveUserSocketId,
    getUserSocketId,
    savePrivateMsg,
    saveOffLineMsg,
    getAllMessage,
    getOffLineMessage,
    deleteOffLineMessage,
}
