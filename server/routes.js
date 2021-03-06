//后台路由配置
import jwt from 'jsonwebtoken'
import config from './config.js'
import api from './api'
import common from './common'
import koa_router from 'koa-router'
import multer from 'koa-multer';
import fs from "fs"
const routes = koa_router();

// userType:需要的用户权限  0:游客 1:超级管理员 2:公寓管理员 3:收费员 4:楼栋管理员 5：学生
const urls = {
    'login'   : {userType: 0},	//用户登录（游客）
    'retrieve': {userType: 0},	//找回密码（游客）
	'findPassword': {userType: 0,method:'get',url:'/:email/:code'},//激活找回密码（游客）
    'changePassword' : {},
    'batchDelSort': {},
    'upFile': {},
    'listUpFile': {},
    'delFile': {},
    'listUser': {},
    'listCampus': {userType: 0},
    'listBuilding': {userType: 0},
    'writeFee': {userType: 0},
    'listFee': {userType: 0},
    'updateFee': {userType: 0},
    'listStaff':{},
    'listStu':{},
    'searchFee':{userType: 0},
    'updateUser' : {},
    'updateStaff' : {},  //更新员工信息
    'updateStu':{},
    'getUserById': {userType: common.page_grade.updateUser},
    'passedUser': {},
    'deleteUser': {},
    'upExcelFile':{},
    'upUserPic': {userType: 4},//用户上传头像
    'listArticle': {},
    'updateArticle': {},
    'passedArticle': {},
    'deleteArticle': {},
    'getArticleById': {userType: 0},//获取文章详情
};

Object.getOwnPropertyNames(urls).forEach(key=>{
    // 如果设置了权限，就用page_grade中的权限
    if(common.page_grade.hasOwnProperty(key)){
        urls[key].userType = common.page_grade[key];//覆盖访问权限
    }
    // 循环添加路由，除了upFile单独处理
    if(key !== 'upFile'){
        let obj = urls[key];
        let url = '/' + key + (obj.url || '');
        routes[obj.method ? obj.method : 'post'](url, api[key]);
    }
});


//文件上传配置：自定义 上传路径和文件名（当前日期Date.now()的毫秒数）
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(config.upPath)) {
            fs.mkdirSync(config.upPath);
        }
        cb(null, config.upPath);
    },
    filename: function (req, file, cb) {
        let fileFormat = (file.originalname).split(".");
        cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});
//上传文件 multer中间件
routes.post('/upFile', multer({storage}).single('file'), async ctx => {
    const {originalname,mimetype,filename,path,size} = ctx.req.file;
    let msg,is_del = 0;
    let fullPath = common.web_domain + config.upPath.replace('dist/','/') + filename;
    if(size > common.upFile_maxSize || !common.upFile_accept.test(mimetype)) {
        msg = size > common.upFile_maxSize?'上传文件大小超出':'非法上传文件格式';
        is_del = 1;
        fs.unlinkSync(path);//同步删除文件
    }
    await api.saveUpFile([ctx.state.userInfo.id,originalname,path,mimetype,size,is_del,new Date().toLocaleString()]);
    ctx.body = {
        success: !msg,
        message:msg,
        data: {
            filename: fullPath
        }
    }
});
routes.post('/upExcelFile', multer({storage}).single('file'), async ctx => {
    const {originalname,mimetype,filename,path,size} = ctx.req.file;
    let msg,is_del = 0;
    let fullPath = common.web_domain + config.upPath.replace('uploads/','/') + filename;
    //没有写  文件格式限制 todo
    if(size > common.upFile_maxSize ) {
        msg = size > common.upFile_maxSize?'上传文件大小超出':'非法上传文件格式';
        is_del = 1;
        fs.unlinkSync(path);//同步删除文件
    }
    // await api.saveUpFile([ctx.state.userInfo.id,originalname,path,mimetype,size,is_del,new Date().toLocaleString()]);
    ctx.body = {
        success: !msg,
        message:msg,
        data: {
            filename: fullPath
        }
    }
});


//验证权限函数
async function verify(ctx) {
    return new Promise((resolve, reject) => {
		if(ctx.url.substring(0,5) !== '/api/'){
			resolve({});//非后端接口请求
		}
		//将请求从 /api/xxxx 中分割 : arr为数组，第一个是/api/  第2个是后面请求地址
        let arr = /\/api\/([a-zA-Z]+)/.exec(ctx.url);
		let key = arr ? arr[1]:'';
        let obj = urls[key];
        if (!urls.hasOwnProperty(key)) {
            resolve('非法请求链接：' + ctx.url);
        }else if (ctx.method !== (obj.method ? obj.method : 'post').toUpperCase()) {
            resolve('非法请求方式：' + ctx.method);
        }
        //异步验证token
		const userType = obj.userType;
		if (userType === 0) {
            resolve({}); //不需要验证token
        }
        jwt.verify(ctx.request.header.authorization, config.JWTs.secret, (err, decoded) => {
            if (err) {
                resolve('token验证错误！');
            } else {
                if (config.getClientIP(ctx) !== decoded.ip || !Number.isInteger(decoded.id)) {
                    resolve('token无效！');
                } else if (decoded.user_type > userType) {
                    resolve('对不起您无权操作！');
                }
            }
            resolve(decoded);//把用户信息带上
        });
    })
}

export default {
    verify,
    routes
}
