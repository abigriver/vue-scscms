//后台路由配置
import config from './config.js'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import fs from "fs"
import jwt from 'jsonwebtoken'
import common from './common'
import nodemailer from 'nodemailer'

//公用：获取客户端IP
function getClientIP(ctx) {
    let req = ctx.request;
    let ip = ctx.ip ||
        req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    let arr = ip.match(/(\d{1,3}\.){3}\d{1,3}/);
    return arr ? arr[0] : '';
}

//公用：发送邮件
function sendEmail(email, title, body) {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport(config.emailServer, {
            from: '<' + config.emailServer.auth.user + '>',
        });
        transporter.sendMail({
            to: email,
            subject: title,
            html: body,
            watchHtml: body,
        }, (error, info) => {
            transporter.close();
            resolve(error ? error.message : '');
        });
    })
}
async function upExcelFile(ctx) {
    const file = ctx.request.body.files.file;    // 获取上传文件
    const reader = fs.createReadStream(file.path);    // 创建可读流
    const ext = file.name.split('.').pop();        // 获取上传文件扩展名
    const upStream = fs.createWriteStream(`/upload/${Math.random().toString()}.${ext}`);        // 创建可写流
    reader.pipe(upStream);    // 可读流通过管道写入可写流
    ctx.body ={
        success: true,
        data:{file}
    }
}
async function listCampus(ctx){
    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute("SELECT * FROM `campus`");
    await connection.end();
    ctx.body = {
        success: true,
        data:{data:list}
    };
}
async function listFee(ctx){
    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute("SELECT * FROM `elefee`");
    await connection.end();
    ctx.body = {
        success: true,
        data:{data:list}
    };
}
async function listBuilding(ctx){
    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute("SELECT * FROM `building`");
    await connection.end();
    ctx.body = {
        success: true,
        data:{data:list}
    };
}
//学生列表
async function listStu(ctx) {
    let data = ctx.request.body;
    const arr = [];
    let querying = '';

    if(data.stuNo){
        querying += " and stuNo like ?";
        arr.push('%' + data.stuNo + '%');
    }
    if(data.stuName){
        querying += " and stuName like ?";
        arr.push('%' + data.stuName + '%');
    }
    if(data.stuPhoneNum){
        querying += " and stuPhoneNum like ?";
        arr.push('%' + data.stuPhoneNum + '%');
    }
    if(data.campusName){
        querying += " and campusName like ?";
        arr.push('%' + data.campusName + '%');
    }
    if(data.buildingName){
        querying += " and buildingName like ?";
        arr.push('%' + data.buildingName + '%');
    }

    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute("SELECT * FROM `student`"+querying.replace('and','where'), arr);
    await connection.end();
    ctx.body = {
        success: true,
        data:{data:list}
    };
}
// 员工列表
async function listStaff(ctx) {
    let data = ctx.request.body;
    const arr = [];
    let querying = '';

    if(data.staffNo){
        querying += " and staffNo like ?";
        arr.push('%' + data.staffNo + '%');
    }
    if(data.staffName){
        querying += " and staffName like ?";
        arr.push('%' + data.staffName + '%');
    }
    if(data.staffPhone){
        querying += " and staffPhone like ?";
        arr.push('%' + data.staffPhone + '%');
    }
    if(/^[0-5]$/.test(data.staffType)){
        querying += " and staffType=?";
        arr.push(data.staffType >> 0);
    }
    console.log(querying, arr)
    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute("SELECT * FROM `staff`"+querying.replace('and','where'), arr);
    await connection.end();
    // list.forEach(obj=>{
    //     obj.user_email = '****'+obj.user_email.slice(4);//过滤邮箱地址
    //     obj.user_pass = '';
    // });
    ctx.body = {
        success: true,
        data:{data:list}
    };
}

//用户列表
async function listUser(ctx) {
    let data = ctx.request.body;
    const arr = [];
    let querying = '';
    if(data.user_name){
        querying += " and user_name like ?";
        arr.push('%' + data.user_name + '%');
    }
    if(data.user_email){
        querying += " and user_email like ?";
        arr.push('%' + data.user_email + '%');
    }
    if(/^[1-4]$/.test(data.user_type)){
        querying += " and user_type=?";
        arr.push(data.user_type >> 0);
    }
    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute("SELECT * FROM `user`"+querying.replace('and','where'), arr);
    await connection.end();
    list.forEach(obj=>{
        obj.user_email = '****'+obj.user_email.slice(4);//过滤邮箱地址
        obj.user_pass = '';
    });
    ctx.body = {
        success: true,
        data:{data:list}
    };
}
//审核用户
async function passedUser(ctx){
    let data = ctx.request.body;
    let ids = data.ids;
    let msg;
    if(/^\d+(,\d+)*$/.test(ids)){
        const arr = ids.split(',');
        ids = new Array(arr.length).fill("?").join(',');
        const connection = await mysql.createConnection(config.mysqlDB);
        const [result] = await connection.execute(`UPDATE user SET user_type=4 where user_type=0 and id in (${ids})`, arr);
        msg = result.affectedRows > 0 ? '':'审核用户失败！';
        await connection.end();
    }else{
        msg = 'ID参数不合法';
    }
    ctx.body = {
        success: !msg,
        message: msg,
        data: {passed:4}
    }
}
//删除用户（禁止删除管理员）
async function deleteUser(ctx){
    const data = ctx.request.body;
    let ids = data.ids;
    let msg;
    if(/^\d+(,\d+)*$/.test(ids)){
        const arr = ids.split(',');
        const connection = await mysql.createConnection(config.mysqlDB);
        const [result] = await connection.execute(`DELETE from user where user_type<>1 and user_type<>2 and id in (${arr.map(() => '?').join(',')})`, arr);
        msg = result.affectedRows > 0 ? '':'删除用户失败！';
        await connection.end();
    }else{
        msg = 'ID参数不合法';
    }
    ctx.body = {
        success: !msg,
        message: msg,
        data: {}
    }
}
//用户上传头像
async function upUserPic(ctx) {
    let pic = ctx.request.body.pic;
    let msg = common.pic_reg.test(pic) ? null : common.pic_txt;
    if(!msg){
        const connection = await mysql.createConnection(config.mysqlDB);
        const [result] = await connection.execute('UPDATE user SET user_pic=? where id=?', [pic,ctx.state.userInfo.id >> 0]);
        msg = result.affectedRows === 1 ? '' : '更新头像失败';
        await connection.end();
    }
    ctx.body = {
        success: !msg,
        message: msg,
        data: {pic}
    }
}
async function writeFee(ctx){
    let data = ctx.request.body;
    var msg;
    const obj = {
        campusCode:'校区',
        buildingCode:'楼栋',
        dormNum:'宿舍号',
        eleNum:'电表读数',
        eleDate:'日期'
    };
    var arrayKey = Object.getOwnPropertyNames(obj);
    var arrayValue = []
    for (let i in obj) {
        arrayValue.push(obj[i]); //  arrayValue: 校区，楼栋，宿舍号
    }
    const connection = await mysql.createConnection(config.mysqlDB);

    var values=[]
    for(let i=0;i<data.length;i++){

        let t=[]
        for (let j in data[i]) {
            t.push(data[i][j])
        }
        values.push(t)
    }
    var sql = "INSERT INTO elefee(`campusCode`,`buildingCode`,`dormNum`," +
        "`eleNum`,`eleDate`) VALUES ?";

    connection.query(sql, [values], function (err, rows, fields) {
        if(err){
            console.log('INSERT ERROR - ', err.message);
            msg = '导入失败';
            return;
        }
        console.log("INSERT SUCCESS");
    });
    ctx.body = {
        success: !msg,
        message: msg,
        data: {pic}
    }
}
async function updateStu(ctx){
    //传过来的是一个数组
    let data = ctx.request.body;
    //array 存放key
    var msg;
    // console.log('data',data)
    const obj = {
        stuNo:'学号',
        stuName:'姓名',
        campusName:'校区',
        buildingName:'楼栋',
        dormNum:'宿舍号',
        needRemind:'提醒',
        stuPhoneNum:'手机号',
        stuPwd:'密码',
    };
    var arrayKey = Object.getOwnPropertyNames(obj);
    //arrayvalue 存放字段的中文名
    var arrayValue = []

    for (let i in obj) {
        arrayValue.push(obj[i]); //值
    }
    console.log("arrayValue:",arrayValue)

    for( let i=0,c=true;i<5 && c;i++){
        var key = arrayValue[i];
        //对每个学生数据验证： 前5项是否为空，学号是否合法
        for(let j=0;j<data.length;j++){
            if(data[j][key]===''){
                msg = obj[key]+'不能为空！';
                c=false;
                break;
            }
            if (!common.student_no.test(data[j].stuNo)) {
                msg = common.stuNoTxt;
                c=false;
                break;
            }
        }

    }

    //检查remind
    if(!msg){
        for(let j=0;j<data.length;j++){
            if(data[j]['提醒']!=='是' && data[j]['提醒']!=='否'){
                msg = '提醒只能==是|否！';
                break;
            }
        }
    }

    if(!msg){
        const connection = await mysql.createConnection(config.mysqlDB);
        //构造一个数组values = [ [学号,姓名,校区....],[学号,姓名,校区....]...] 插入

        var values=[]
        for(let i=0;i<data.length;i++){
            //data每个元素是对象
            // { '学号': '15011030304',
            //     '姓名': '陈治远',
            //     '校区': '汇南',
            //     '楼栋': '3舍',
            //     '宿舍号': '121',
            //     '提醒': '否'
            // },
            let t=[]
            for (let j in data[i]) {
                if( data[i][j]==='是' || data[i][j]==='否' ){
                    data[i][j]==='是' ? t.push( 1 ):t.push(0); //值
                }else{
                    t.push(data[i][j])
                }
            }
            //如果没有手机号，则补上
            t.length===6 ? t.push(''):''
            //密码
            t.push(bcrypt.hashSync(data[i]['学号'], bcrypt.genSaltSync(10)))
            values.push(t)
        }
        // console.log("values:",values)

        //先检查是否占用帐号
        var stuNoIsExist = false
        var rows = await connection.execute('SELECT stuNo  FROM `student` ')
        for( let i in rows) {
            for( let j in values) {
                if (rows[i].stuNo === values[j][0]) {
                    msg = '帐号已经被占用！'
                    stuNoIsExist = true
                    break;
                }
            }
        }
        if(!stuNoIsExist) {
            let tempStr = arrayKey.join(',')
            var sql = "INSERT INTO student(`stuNo`,`stuName`,`campusName`,`buildingName`,`dormNum`," +
                "`needRemind`,`stuPhoneNum`,`stuPwd`) VALUES ?";
            // console.log("sql:",sql)

            connection.query(sql, [values], function (err, rows, fields) {
                if(err){
                    console.log('INSERT ERROR - ', err.message);
                    msg = '添加学生失败';
                    return;
                }
                console.log("INSERT SUCCESS");
            });

        }
        await connection.end();
    }



    ctx.body = {
        success: !msg,
        message: msg,
        data: {}
    }
}
//更新staff员工信息
async function updateStaff(ctx) {
    let data = ctx.request.body;
    // user_type:2,3,4
    data.user_type = data.user_type >> 0;
    // data.user_type = 1 === data.user_type ? 4 : data.user_type;
    let msg,arr = [];
    // user_id:对应staffNO，
    const obj = {
        staffNo:'用户帐号',
        staffName:'用户姓名',
        staffPhone:'用户手机',
        staffPwd:'用户密码',
        staffType:'用户类型',
        staffPic:'用户头像',
        mail:'邮箱'
    };
    const array = Object.getOwnPropertyNames(obj);
    //校验，检查是否有空字段(除了 头像和邮箱 不检查)
    array.forEach(key=>{
        if(data[key]==='' &&  key !=='staffPic' && key !=='mail'  &&!msg){
            msg = obj[key]+'不能为空！';
        }
        arr.push(data[key]);
    });
    // 字段有效性检查
    if (!common.name_reg.test(data.staffName)) {
        msg = common.name_txt;
    } else if (!common.pass_reg.test(data.staffPwd)) {
        msg = common.pass_txt;
    } else if (!common.email_reg.test(data.mail)) {
        // msg = common.email_txt;
    } else if (!common.phone_reg.test(data.staffPhone)) {
        msg = 'phone number wrong';
    }
    if(!msg){
        let id = data.id >> 0;
        const connection = await mysql.createConnection(config.mysqlDB);
        if(id){
            array.splice(0,2);//修改时不能修改帐号和邮箱
            arr.splice(0,2);
            if(data.staffPwd === common.defaultPassword){
                array.shift();//不修改原密码
                arr.shift();
            }
            arr.push(id);
            const [result] = await connection.execute(`UPDATE user SET ${array.map(k=>k+'=?').join(',')} where id=?`, arr);
            msg = result.affectedRows === 1 ? '' : '修改用户失败';
        }else{
            array.push('create_time');
            arr.push(new Date().toLocaleString());
            arr[3] = bcrypt.hashSync(data.staffPwd, bcrypt.genSaltSync(10));//加密密码
            //先检查是否占用帐号
            const [rows] = await connection.execute('SELECT staffNo,staffPhone FROM `staff` where `staffNo`=? or `staffPhone`=?', [data.staffNo,data.staffPhone]);
            if(rows.length > 0) {
                msg = rows[0].staffNo === data.staffNo ? '帐号已经被占用！' : '手机号已经被占用！';
            }else{
                let t = array.join(',') + array.map((()=>'?')).join(',') + arr.toString();
                console.log(t);
                const [result] = await connection.execute(`INSERT INTO staff (${array.join(',')}) VALUES (${array.map((()=>'?')).join(',')})`, arr);
                msg = result.affectedRows === 1 ? '' : '添加用户失败';
            }
        }
        await connection.end();
    }
    ctx.body = {
        success: !msg,
        message: msg,
        data: {}
    }
}
//保存用户
async function updateUser(ctx) {
    let data = ctx.request.body;
    data.user_type = data.user_type >> 0;
    data.user_type = 1 === data.user_type ? 4 : data.user_type;
    let msg,arr = [];
    const obj = {
        user_name:'用户帐号',
        user_email:'用户邮箱',
        pass_word:'用户密码',
        user_type:'用户类型',
        user_pic:'用户头像'
    };
    const array = Object.getOwnPropertyNames(obj);
    array.forEach(key=>{
        if(data[key]==='' && key !=='user_pic' &&!msg){
            msg = obj[key]+'不能为空！';
        }
        arr.push(data[key]);
    });
    if (!common.name_reg.test(data.user_name)) {
        msg = common.name_txt;
    } else if (!common.pass_reg.test(data.pass_word)) {
        msg = common.pass_txt;
    } else if (!common.email_reg.test(data.user_email)) {
        msg = common.email_txt;
    }
    if(!msg){
        let id = data.id >> 0;
        const connection = await mysql.createConnection(config.mysqlDB);
        if(id){
            array.splice(0,2);//修改时不能修改帐号和邮箱
            arr.splice(0,2);
            if(data.pass_word === common.defaultPassword){
                array.shift();//不修改原密码
                arr.shift();
            }
            arr.push(id);
            const [result] = await connection.execute(`UPDATE user SET ${array.map(k=>k+'=?').join(',')} where id=?`, arr);
            msg = result.affectedRows === 1 ? '' : '修改用户失败';
        }else{
            array.push('create_time');
            arr.push(new Date().toLocaleString());
            arr[2] = bcrypt.hashSync(data.pass_word, bcrypt.genSaltSync(10));//加密密码
            //先检查是否占用帐号
            const [rows] = await connection.execute('SELECT user_name,user_email FROM `user` where `user_name`=? or `user_email`=?', [data.user_name,data.user_email]);
            if(rows.length > 0) {
                msg = rows[0].user_name === data.user_name ? '帐号已经被占用！' : '邮箱已经被占用！';
            }else{
                const [result] = await connection.execute(`INSERT INTO user (${array.join(',')}) VALUES (${array.map((()=>'?')).join(',')})`, arr);
                msg = result.affectedRows === 1 ? '' : '添加用户失败';
            }
        }
        await connection.end();
    }
    ctx.body = {
        success: !msg,
        message: msg,
        data: {}
    }
}
//获取用户信息
async function getUserById(ctx) {
    let id = ctx.request.body.id >> 0;
    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute("SELECT * FROM staff where id=?", [id]);
    const success = list.length === 1;
    await connection.end();
    ctx.body = {
        success,
        message: success ? '' : '查无此用户',
        data: success ? list[0] : {}
    }
}
//用户注册
async function register(ctx) {
    const data = ctx.request.body;
    let msg, success = false;
    if (!common.name_reg.test(data.user_name)) {
        msg = common.name_txt;
    } else if (!common.pass_reg.test(data.pass_word)) {
        msg = common.pass_txt;
    } else if (!common.email_reg.test(data.user_email)) {
        msg = common.email_txt;
    }else{
        //先检查是否占用帐号
        const connection = await mysql.createConnection(config.mysqlDB);
        const [rows] = await connection.execute('SELECT id FROM `user` where `user_name`=?', [data.user_name]);
        if(rows.length > 0){
            msg = '帐号已经被占用！';
        }else{
            const [rows] = await connection.execute('SELECT id FROM `user` where `user_email`=?', [data.user_email]);
            if(rows.length > 0){
                msg = '邮箱已经被占用！';
            }else{
                data.pass_word = bcrypt.hashSync(data.pass_word, bcrypt.genSaltSync(10));
                const result = await connection.execute('INSERT INTO `user` (user_name,pass_word,create_time,login_ip,user_email) VALUES (?,?,?,?,?)', [data.user_name, data.pass_word, new Date().toLocaleString(), getClientIP(ctx),data.user_email]);
                success = result[0].affectedRows === 1;
                msg = success ? '' : '写入数据库失败';
                if(success){
                    //发送激活邮件
                    let link = `${common.web_domain}/api/active/${data.user_name}/${data.pass_word.replace(/\//g,'')}`;
                    let body = `您好：${data.user_name} <br/>欢迎注册【${common.web_name}】网站，请点击<a href="${link}" target="_blank">${link}</a>链接进行激活您的帐号！<p><img src="http://www.scscms.com/images/whiteSCS.png" /></p>`;
                    if(await sendEmail(data.user_email, common.web_name+'【帐号激活】', body)){
                        return ctx.body = {
                            success: true,
                            data:{emailErr:true},
                            message: ''
                        }
                    }
                }
            }
        }
        await connection.end();
    }
    ctx.body = {
        success: success,
        data:{},
        message: msg
    }
}
//用户激活
async function active(ctx) {
    const data = ctx.params;
    let code = 'succeed';
    if(data.name && data.code){
        const connection = await mysql.createConnection(config.mysqlDB);
        const [rows] = await connection.execute('SELECT id,pass_word FROM `user` where `user_name`=? and `user_type`=?', [data.name,0]);
        if (rows.length) {
            if(rows[0].pass_word.replace(/\//g,'') !== data.code){
                code = 'errCode';
            }else{
                const [list] = await connection.execute('UPDATE `user` SET `user_type`=? where `id`=?', [4,rows[0].id]);
                code = list.affectedRows === 1 ? 'success' :'failed';
            }
        }else{
            code = 'nobody';
        }
        await connection.end();
    }else{
        code = 'lack';
    }
    ctx.redirect(common.web_domain + '/Login?active=' + code);
}

//用户登录
async function login(ctx) {
    const data = ctx.request.body;
    let msg;
    if (!common.name_reg.test(data.user_name)) {
        msg = common.name_txt;
    } else if (!common.pass_reg.test(data.pass_word)) {
        msg = common.pass_txt;
    } else {
        //初步验证通过，开始查询数据库
        const connection = await mysql.createConnection(config.mysqlDB);
        const [rows] = await connection.execute('SELECT * FROM `staff` where `staffNo`=?', [data.user_name]);
        msg = '用户名或密码错误！';//不应该具体透露是密码还是帐户出错！
        if (rows.length) {
            const userInfo = rows[0];
            console.log(userInfo)
            if (bcrypt.compareSync(data.pass_word, userInfo.staffPwd)) {

                    let ip = config.getClientIP(ctx);
                    await connection.execute('UPDATE `staff` SET `login_ip`=? where `id`=?', [ip, userInfo.id]);
                    delete userInfo.pass_word;
                    userInfo.hidetype='staff'
                    return ctx.body = {
                        success: true,
                        data: {
                            userInfo,
                            token: jwt.sign(Object.assign({ip}, userInfo),
                                config.JWTs.secret, {expiresIn: config.JWTs.expiresIn})
                        }
                    }

            }
        }else{
            const [rows] = await connection.execute('SELECT * FROM `student` where `stuNo`=?', [data.user_name]);
            if (rows.length) {
                const userInfo = rows[0];
                if (bcrypt.compareSync(data.pass_word, userInfo.stuPwd)) {
                        let ip = config.getClientIP(ctx);
                        await connection.execute('UPDATE `student` SET `login_ip`=? where `id`=?', [ip, userInfo.id]);
                        delete userInfo.stuPwd;
                        userInfo.hidetype='student'
                        return ctx.body = {
                            success: true,
                            data: {
                                userInfo,
                                token: jwt.sign(Object.assign({ip}, userInfo),
                                    config.JWTs.secret, {expiresIn: config.JWTs.expiresIn})
                            }
                        }
                }
            }
        }
        await connection.end();
    }
    ctx.body = {
        success: false,
        message: msg,
        data: {}
    };
}

//找回密码
async function retrieve(ctx) {
    const data = ctx.request.body;
    let err;
    const obj = {
        user_email:'邮箱',
        pass_word:'新密码',
        pass_words:'确认密码'
    };
    for (let key in obj) {
        if (!common[key === 'user_email' ? 'email_reg' : 'pass_reg'].test(data[key])) {
            err = obj[key] + '格式不正确！';
            break;
        }
    }
    if (!err && data.pass_word !== data.pass_words) {
        err = '新密码与确认密码不相同！';
    }
    if(!err){
        const connection = await mysql.createConnection(config.mysqlDB);
        const [rows] = await connection.execute('SELECT `user_name`,`user_extend` FROM `user` where `user_email`=?', [data.user_email]);
        if(rows.length){
            let extend = {};
            try{
                extend = JSON.parse(rows[0].user_extend||'{}');
            }catch(e){}
            extend.password = bcrypt.hashSync(data.pass_word, bcrypt.genSaltSync(10));//加密新密码
            const [result] = await connection.execute('UPDATE `user` set `user_extend`=? where `user_email`=?', [JSON.stringify(extend), data.user_email]);
            if(result.affectedRows === 1){
                //发激活邮件
                let link = `${common.web_domain}/api/findPassword/${data.user_email}/${extend.password.replace(/\//g,'')}`;
                let body = `您好：${rows[0].user_name} <br/>欢迎使用【${common.web_name}】网站密码找回功能，请点击<a href="${link}" target="_blank">${link}</a>链接进行重设您的新密码为：【${data.pass_word}】！<p><img src="http://www.scscms.com/images/whiteSCS.png" /></p>`;
                if(await sendEmail(data.user_email, common.web_name+'【密码找回】', body)){
                    await connection.end();
                    return ctx.body = {
                        success: true,
                        data:{findErr:true},
                        message: ''
                    }
                }
            }else{
                err = '找回密码失败！';
            }
        }else{
            err = '邮箱不正确！';
        }
        await connection.end();
    }
    ctx.body = {
        success: !err,
        message: err,
        data: {}
    }
}

//激活找回密码
async function findPassword(ctx) {
    const data = ctx.params;
    let code = 'succeed';
    if(data.email && data.code){
        const connection = await mysql.createConnection(config.mysqlDB);
        const [rows] = await connection.execute('SELECT `user_extend` FROM `user` where `user_email`=?', [data.email]);
        if (rows.length) {
            let extend = {};
            try{
                extend = JSON.parse(rows[0].user_extend);
            }catch(e){}
            if(extend.password && extend.password.replace(/\//g,'') === data.code){
                let password = extend.password;
                delete extend.password;
                const [list] = await connection.execute('UPDATE `user` SET `pass_word`=?,`user_extend`=? where `user_email`=?', [password,JSON.stringify(extend),data.email]);
                code = list.affectedRows === 1 ? 'success' :'failed';
            }else{
                code = 'errCode';
            }
        }else{
            code = 'nobody';
        }
        await connection.end();
    }else{
        code = 'lack';
    }
    ctx.redirect(common.web_domain + '/Login?find=' + code);
}

//修改密码
async function changePassword(ctx) {
    const data = ctx.request.body;
    let err;
    const obj = {
        old_password:'旧密码',
        pass_word:'新密码',
        pass_words:'确认密码'
    };
    for(let key in obj){
        if (!common.pass_reg.test(data[key])) {
            err = obj[key]+'格式不正确！';
            break;
        }
    }
    if (!err && data.old_password === data.pass_words) {
        err = '旧密码不能与新密码相同！';
    } else if (!err && data.pass_word !== data.pass_words) {
        err = '新密码与确认密码不相同！';
    }
    if(!err){
        const user = ctx.state.userInfo;//获取用户信息
        const connection = await mysql.createConnection(config.mysqlDB);
        const [rows] = await connection.execute('SELECT `pass_word` FROM `user` where `id`=?', [user.id]);
        if(rows.length && bcrypt.compareSync(data.old_password,rows[0].pass_word)){
            const password = bcrypt.hashSync(data.pass_word, bcrypt.genSaltSync(10));//加密新密码
            const result = await connection.execute('update `user` set `pass_word`=? where `id`=?', [password, user.id]);
            err = result.affectedRows === 0 ? '修改密码失败！':'';
        }else{
            err = '旧密码不正确！';
        }
        await connection.end();
    }
    ctx.body = {
        success: !err,
        message: err,
        data: {}
    }
}

//新添或编辑文章
async function updateArticle(ctx) {
    const data = ctx.request.body;
    let err;
    const obj = {
        title:'文章标题',
        description:'文章概要',
        read_type:'阅读权限',
        content:'文章内容'
    };
    for(let key in obj){
        if (!data[key]) {
            err = obj[key]+'不能为空！';
            break;
        }
    }
    const array = [
        data.title.slice(0,100),
        data.description.slice(0,255),
        data.read_type >> 0,
        data.sort_id >> 0,
        data.content,
        data.article_extend
    ];
    if(!err){
        const user = ctx.state.userInfo;//获取用户信息
        const connection = await mysql.createConnection(config.mysqlDB);
        if(data.id > 0){
            //编辑文章
            if(user.user_type > 2){
                //非管理员需要验证是否为自己的文章(同时普通管理员也可修改超管文章)
                const [rows] = await connection.execute('SELECT `id` FROM `article` where `id`=? and `user_id`=?', [data.id,user.id]);
                if(!rows.length){
                    return ctx.body = {
                        success: false,
                        message: '无权编辑此文章',
                        data: {}
                    }
                }
            }
            array.push(data.id);
            const [result] = await connection.execute('UPDATE `article` SET `title`=?,`description`=?,`read_type`=?,`sort_id`=?,`content`=?,`article_extend`=? where `id`=?', array);
            err = result.affectedRows === 1 ? '' :'文章修改失败';
        }else{
            //添加文章
            array.push(new Date().toLocaleString());//添加日期
            array.push(user.user_type > 4 ? 1 : 0);//是否通过审核
            array.push(user.id);//用户信息
            const [result] = await connection.execute('INSERT INTO `article` (title,description,read_type,sort_id,content,article_extend,create_time,passed,user_id) VALUES (?,?,?,?,?,?,?,?,?)', array);
            err = result.affectedRows === 1 ? '' :'文章添加失败';
        }
        await connection.end();
    }
    ctx.body = {
        success: !err,
        message: err,
        data: {}
    }
}

//文章列表
async function listArticle(ctx) {
    const data = ctx.request.body;
    let pageSize = Math.abs(data.pageSize >> 0)||10;//分页率
    let page = Math.abs(data.page >> 0)||1;//当前页码
    const arr = [];
    let querying = '';
    if(data.title){
        querying += " and title like ?";
        arr.push('%' + data.title + '%');
    }
    if(/^\d+$/.test(data.sort_id)){
        querying += ' and sort_id=?';
        arr.push(data.sort_id >> 0);
    }
    if(/^[1-4]$/.test(data.read_type)){
        querying += " and read_type=?";
        arr.push(data.read_type >> 0);
    }
    //会员只能查看自己的文章(暂关闭)
    const user = ctx.state.userInfo;
    if(user.user_type > 2){
        //querying += " and user_id=?";
        //arr.push(user.id >> 0);
    }
    const connection = await mysql.createConnection(config.mysqlDB);
    const [rows] = await connection.execute("SELECT SQL_NO_CACHE COUNT(*) as total FROM `article`"+querying.replace('and','where'), arr);
    const total = rows[0].total;//总数量
    const pages = Math.ceil(total/pageSize);
    if(page > pages){
        page = Math.max(1,pages);//以防没数据
    }
    querying += " LIMIT ?, ?";
    arr.push((page - 1) * pageSize,pageSize);
    const [list] = await connection.execute("SELECT a.id,a.title,a.sort_id,a.user_id,a.passed,a.read_type,a.create_time,u.`user_name`,s.`sort_name` FROM article as a LEFT JOIN user as u on a.user_id = u.id LEFT JOIN sort as s on a.sort_id = s.id"+querying.replace('and','where'), arr);
    await connection.end();
    ctx.body = {
        success: true,
        message: '',
        data: {
            page,total,data:list
        }
    }
}

//获取文章详情（管理员获取所有；会员获取自己的或者是审核通过的）
async function getArticleById(ctx) {
    const data = ctx.request.body;
    let id = data.id >> 0;
    let msg;
    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute("SELECT a.*,u.`user_name`,s.`sort_name` FROM article as a LEFT JOIN user as u on a.user_id = u.id LEFT JOIN sort as s on a.sort_id = s.id where a.id=?", [id]);
    const obj = list[0];
    if(list.length === 1){
        const user = ctx.state.userInfo;
        if(user.user_type > 2 && user.id !== obj.user_id && obj.passed === 0){
            msg = '文章仍在审核中';
        }
    }else{
        msg = '查无此文章';
    }
    await connection.end();
    ctx.body = {
        success: !msg,
        message: msg,
        data: !msg ? obj : {}
    }
}

//审核文章
async function passedArticle(ctx) {
    const data = ctx.request.body;
    const passed = data.passed === '1' ? 1 : 0;
    let ids = data.ids;
    let msg;
    if(/^\d+(,\d+)*$/.test(ids)){
        const arr = ids.split(',');
        ids = new Array(arr.length).fill("?").join(',');
        arr.unshift(passed);
        const connection = await mysql.createConnection(config.mysqlDB);
        const [result] = await connection.execute(`UPDATE article SET passed=? where id in (${ids})`, arr);
        msg = result.affectedRows > 0 ? '':'审核文章失败！';
        await connection.end();
    }else{
        msg = 'ID参数不合法';
    }
    ctx.body = {
        success: !msg,
        message: msg,
        data: {passed}
    }
}

//管理员删除文件或会员删除自己的
async function deleteArticle(ctx){
    const data = ctx.request.body;
    let ids = data.ids;
    let msg;
    if(/^\d+(,\d+)*$/.test(ids)){
        const arr = ids.split(',');
        let sql = `DELETE from article where id in (${arr.map(() => '?').join(',')})`;
        const user = ctx.state.userInfo;
        if(user.user_type > 2){
            sql += " and user_id=?";//会员只能删除自己的
            arr.push(user.id >> 0);
        }
        const connection = await mysql.createConnection(config.mysqlDB);
        const [result] = await connection.execute(sql, arr);
        msg = result.affectedRows > 0 ? '':'删除文章失败！';
        await connection.end();
    }else{
        msg = 'ID参数不合法';
    }
    ctx.body = {
        success: !msg,
        message: msg,
        data: {}
    }
}

//新添或编辑分类
async function updateSort(ctx) {
    const data = ctx.request.body;
    data.id = data.id >> 0;
    data.sort_name = data.sort_name.slice(0,50);
    data.sort_type = data.sort_type.slice(0,10);
    data.parent_id = data.parent_id >> 0;
    let err;
    const obj = {
        sort_name:'分类名称',
        sort_type:'分类类别',
    };
    for(let key in obj){
        if (!data[key]) {
            err = obj[key]+'不能为空！';
            break;
        }
    }
    const array = [data.sort_name,data.sort_type,data.parent_id];
    if(!err){
        const connection = await mysql.createConnection(config.mysqlDB);
        if(data.id > 0){
            array.push(data.id);
            const [result] = await connection.execute('UPDATE `sort` SET `sort_name`=?,`sort_type`=?,`parent_id`=? where `id`=?', array);
            err = result.affectedRows === 1 ? '' :'分类修改失败';
        }else{
            const [result] = await connection.execute('INSERT INTO `sort` (sort_name,sort_type,parent_id) VALUES (?,?,?)', array);
            err = result.affectedRows === 1 ? '' :'分类添加失败';
            data.id = result.insertId;//插入数据库的ID
        }
        await connection.end();
    }
    ctx.body = {
        success: !err,
        message: err,
        data: {
            data
        }
    }
}

//分类列表
async function listSort(ctx) {
    const data = ctx.request.body;
    let sql = 'SELECT s.*,a.counts from `sort` as s LEFT JOIN (SELECT sort_id,count(*) as counts FROM `article` GROUP BY sort_id) as a on a.sort_id = s.id';
    let arr = [];
    if(data.type){
        sql += ' where s.sort_type = ?';
        arr.push(data.type);
    }
    const connection = await mysql.createConnection(config.mysqlDB);
    const [list] = await connection.execute(sql,arr);
    await connection.end();
    ctx.body = {
        success: true,
        message: '',
        data: {
            data:list
        }
    }
}

//删除分类
async function deleteSort(ctx) {
    const data = ctx.request.body;
    let id = data.id >> 0;
    const connection = await mysql.createConnection(config.mysqlDB);
    const [result] = await connection.execute('DELETE from `sort` where id=?',[id]);
    await connection.end();
    ctx.body = {
        success: result.affectedRows === 1,
        message: result.affectedRows === 1 ? '' : `id:${id}分类删除失败！`,
        data: {}
    }
}
//批量删除分类
async function batchDelSort(ctx) {
    const data = ctx.request.body;
    let result = {};
    if(/^\d+(,\d+)*$/.test(data.ids)){
        const connection = await mysql.createConnection(config.mysqlDB);
        const [list] = await connection.execute('DELETE from `sort` where id in(?)',[data.ids]);
        result = list;
        await connection.end();
    }
    ctx.body = {
        success: result.affectedRows === 1,
        message: result.affectedRows === 1 ? '' : `ids:${data.ids}分类删除失败！`,
        data: {}
    }
}
//保存上传记录
async function saveUpFile(arr) {
    const connection = await mysql.createConnection(config.mysqlDB);
    const [result] = await connection.execute('INSERT INTO `upload` (user_id,file_name,file_path,mime_type,file_size,is_delete,create_time) VALUES (?,?,?,?,?,?,?)', arr);
    await connection.end();
    return result;
}
//上传文件列表
async function listUpFile(ctx) {
    const data = ctx.request.body;
    let pageSize = Math.abs(data.pageSize >> 0)||10;
    let page = Math.abs(data.page >> 0)||1;//当前页码
    const connection = await mysql.createConnection(config.mysqlDB);
    const [rows] = await connection.execute('SELECT SQL_NO_CACHE COUNT(*) as total FROM `upload`', []);
    const total = rows[0].total;//总数量
    const pages = Math.ceil(total/pageSize);
    if(page > pages){
        page = Math.max(1,pages);//以防没数据
    }
    console.log((page - 1) * pageSize,page * pageSize);
    const [list] = await connection.execute('SELECT a.*,u.`user_name` FROM upload as a LEFT JOIN user as u on a.user_id = u.id LIMIT ?, ?', [(page - 1) * pageSize,pageSize]);
    await connection.end();
    list.forEach(obj=>{
        obj.full_path = common.web_domain + obj.file_path.replace(/\\/g,'/').replace('dist/','/');
    });
    ctx.body = {
        success: true,
        message: '',
        data: {
            page,total,data:list
        }
    }
}
//删除上传文件列表
async function delFile(ctx) {
    const data = ctx.request.body;
    let ids = data.id;
    let arr = ids.split(',');
    let msg;
    if(/^\d+(,\d+)*$/.test(ids)){
        ids = arr.map(() => '?').join(',');
        const connection = await mysql.createConnection(config.mysqlDB);
        const [rows] = await connection.execute(`SELECT file_path FROM upload where id in (${ids})`, arr);
        if(rows.length){
            for(let i = rows.length;i--;){
                const path = rows[i].file_path.replace(/\\/g,'/');
                if(path.startsWith(config.upPath)){
                    try{
                        fs.unlinkSync(path);
                    }catch(e){}
                }
            }
            if(data.delRecord === 'true'){
                await connection.execute(`DELETE from upload where id in (${ids})`, arr);
            }
        }else{
            msg = '无此记录';
        }
        await connection.end();
    }else{
        msg = 'ID参数不合法';
    }
    ctx.body = {
        success: !msg,
        message: msg,
        data: {}
    }
}

export default {
    saveUpFile,
    listUpFile,
    delFile,
    login,
    register,
    retrieve,
    findPassword,
    active,
    listArticle,
    changePassword,
    updateArticle,
    passedArticle,
    deleteArticle,
    getArticleById,
    updateSort,
    listSort,
    deleteSort,
    batchDelSort,
    listUser,
    listStaff,
    listStu,
    passedUser,
    deleteUser,
    getUserById,
    upUserPic,
    updateUser,
    upExcelFile,
    updateStaff,
    updateStu,
    listCampus,
    listBuilding,
    writeFee,
    listFee
}
