/*
 * @Author: dana_chen
 * @Date:   2019-08-09 10:31:00
 * @Last Modified by:   dana_chen@sina.cn
 * @Last Modified time: 2019-08-12 15:35:18
 */
const IO = require('socket.io'),
    utils = require('../util'),
    db = require('../db')

function emitAsync(socket, emitName, data, callback) {
    return new Promise((resolve, reject) => {
        if (!socket || !socket.emit) {
            reject('pls input socket');
        }
        socket.emit(emitName, data, (...args) => {
            let response;
            if (typeof callback === 'function') {
                response = callback(...args);
            }
            resolve(response);
        });
    });
}


function creatSocket(app) {
    const io = IO(app, {
        pingInterval: 10000,
        pingTimeout: 5000,
        cookie: false
    });
    //每个客户端socket连接时都会触发 connection 事件
    io.on("connection", async (clientSocket) => {
        const socket_id = clientSocket.id
        let user_id
        console.log('connection socketId=>', socket_id, 'time=>', new Date().toLocaleString());

        // 必须先把socketID先进行保存
        await emitAsync(clientSocket, 'initSocket', clientSocket.id, (userId) => {
            user_id = userId,
                db.saveUserSocketId({
                    user_socketid: clientSocket.id,
                    user_id
                });
            console.log('initSocket=>', 'time=>', new Date().toLocaleString());
        })
        // 初始化成功并获取 获取好友列表及消息
        clientSocket.on('initSocketSuccess', async (userId, fn) => {
            console.log('initSocketSuccess=>', 'time=>', new Date().toLocaleString());
            try {
                const [allMessage, friendList] = await Promise.all([
                    db.getOffLineMessage({user_id}),
                    db.findUserFriendList({user_id})
                ]);
                console.log(allMessage);
                // 返回好友列表及离线信息
                fn(allMessage, friendList)
                db.deleteOffLineMessage({user_id})
            } catch (err) {
                console.log(err);
            }
        })

        clientSocket.on('sendPrivateMsg', async (data, fn) => {
            // 数据消息一般类型
            // {  
            //     from_user:22256, 自己的id
            //     to_user:1234654, 对方id
            //     avatar, // 自己的头像
            //     name,
            //     message:'123456',
            //     attachments:[]数组    {fileUrl:'',type:'image,video,voice,file',name:''}
            // }
            try {
                if (!data) return;
                data.time = new Date().toLocaleString()
                await Promise.all([
                    db.savePrivateMsg({
                        ...data,
                        attachments: JSON.stringify(data.attachments),
                    }),
                    db.getUserSocketId(data.to_user).then(arr => {
                        console.log(arr);
                        let targetSocketId = arr[0].user_socketid
                        if (io.sockets.connected[targetSocketId]) {
                            console.log('推送成功');
                            io.sockets.connected[targetSocketId].emit('getPrivateMsg', data);
                        } else {
                            console.log('对方不在线 消息存入离线消息库');
                            db.saveOffLineMsg({
                                ...data,
                                attachments: JSON.stringify(data.attachments),
                            })
                        }

                    }),
                ]);
                console.log('sendPrivateMsg data=>', data, 'time=>', new Date().toLocaleString());
                fn({success: true,message: '发送成功',data:data});
            } catch (error) {
                console.log('error', error.message);
                io.to(socketId).emit('error', {
                    code: 500,
                    message: error.message
                });
            }
            // console.log(fn);
        })

        //捕获客户端自定义信息
        // 添加为好友，暂时不需要同意
        clientSocket.on('addFriends', async (data, fn) => {
            console.log(123);
        })

        //查询user
        clientSocket.on('findUser', async (data, fn) => {
            console.log(123);
        })
        //监听客户端断开连接
        clientSocket.on('disconnect', async (msg) => {

        })


    });



















    const adminIo = io.of('/admin');
    adminIo.on("connection", function(clientSocket) {
        console.log('连接adminIo的socket');
        console.log('当前socketID', clientSocket);
        // clientSocket.emit("receiveMsg", '连接adminIo的socket');
    });

}

module.exports = creatSocket
