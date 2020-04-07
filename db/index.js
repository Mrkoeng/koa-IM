const mysql = require('mysql')
const pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'koeng123',
    database: 'im_mysql'
})

pool.getConnection(function(err, connection) {
    if(err){
        console.log("建立连接失败");
    } else {
        console.log("建立连接成功");
        console.log(pool._allConnections.length); //  1
        connection.query('select * from user_info', function(err, rows) {
            connection.release();
            if(err) {
                console.log("查询失败");
            } else {
                console.log(rows);
            } 
            console.log(pool._allConnections.length);  // 0
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
      user_head VARCHAR ( 225 ) COMMENT '头像',
      user_mobile VARCHAR ( 20 ) COMMENT '手机',
      user_email VARCHAR ( 64 ) COMMENT '邮箱',
      user_creatdata TIMESTAMP NOT NULL DEFAULT NOW( ) COMMENT '注册日期',
      user_login_time TIMESTAMP DEFAULT NOW( ) COMMENT '登录时间',
      user_count INT COMMENT '登录次数'
    ) ENGINE = INNODB charset = utf8;`,
    role: `CREATE TABLE IF NOT EXISTS role_info (
      id INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '(自增长)',
      role_name VARCHAR ( 20 ) NOT NULL COMMENT '角色名',
      role_description VARCHAR ( 255 ) DEFAULT NULL COMMENT '描述'
    ) ENGINE = INNODB charset = utf8;`,
    permission: `CREATE TABLE IF NOT EXISTS permission_info (
      id INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '(自增长)',
      permission_name VARCHAR ( 20 ) NOT NULL COMMENT '权限名',
      permission_description VARCHAR ( 255 ) DEFAULT NULL COMMENT '描述'
    ) ENGINE = INNODB charset = utf8;`,
    userRole: `CREATE TABLE IF NOT EXISTS user_role (
      id INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '(自增长)',
      user_id INT NOT NULL COMMENT '关联用户',
      role_id INT NOT NULL COMMENT '关联角色',
      KEY fk_user_role_role_info_1 ( role_id ),
      KEY fk_user_role_user_info_1 ( user_id ),
      CONSTRAINT fk_user_role_role_info_1 FOREIGN KEY ( role_id ) REFERENCES role_info ( id ) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_user_role_user_info_1 FOREIGN KEY ( user_id ) REFERENCES user_info ( id ) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE = INNODB charset = utf8;`,
    rolePermission: `CREATE TABLE IF NOT EXISTS role_permission (
      id INT PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT '(自增长)',
      role_id INT NOT NULL COMMENT '关联角色',
      permission_id INT NOT NULL COMMENT '关联权限',
      KEY fk_role_permission_role_info_1 ( role_id ),
      KEY fk_role_permission_permission_info_1 ( permission_id ),
      CONSTRAINT fk_role_permission_role_info_1 FOREIGN KEY ( role_id ) REFERENCES role_info ( id ) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_role_permission_permission_info_1 FOREIGN KEY ( permission_id ) REFERENCES permission_info ( id ) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE = INNODB charset = utf8;`
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
// createTable(commomTable.role)
// createTable(commomTable.permission)
// createTable(commomTable.userRole)
// createTable(commomTable.rolePermission)

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
    let _sql = `
       INSERT INTO user_info 
       ( user_id, user_pwd,user_creatdata,user_login_time)
       VALUES
       ( "${userinfo.name}", "${userinfo.password}",Now(),Now())
    `
    let result = await query(_sql)
    console.log('创建用户结果',result);
    if (Array.isArray(result) && result.length > 0) {
        result = result[0]
    } else {
        result = null
    }
    return result
}

// 查询用户以及用户角色
let findUserAndRole = async function(id) {
    let _sql =
        `
      SELECT u.*,r.role_name FROM user_info u,user_role ur,role_info r where u.id=(SELECT id FROM user_info where user_id="${id}" limit 1) and ur.user_id=u.id and r.id=ur.user_id limit 1;
    `
    let result = await query(_sql)

    if (Array.isArray(result) && result.length > 0) {
        result = result[0]
    } else {
        result = null
    }
    return result
}

// 更新用户登录次数和登录时间
let UpdataUserInfo = async function(value) {
    let _sql =
        'UPDATE user_info SET user_count = ?, user_login_time = ? WHERE id = ?;'
    return query(_sql, value)
}



module.exports = {
    //暴露方法
    // createTable,
    addUser,
    findUser,
    findUserAndRole,
    UpdataUserInfo,
    // getShopAndAccount
}
