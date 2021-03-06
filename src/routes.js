import common from 'common'
import Login from 'page/Login.vue'
import NoFind from 'page/NoFind.vue'
import Home from 'page/Home.vue'
import ArticleList from 'page/Article/list.vue'
import ArticleSort from 'page/Article/sort.vue'
import ArticleAdd from 'page/Article/add.vue'
import UpFileList from 'page/UpFile/list.vue'
import userList from 'page/User/list.vue'
import userAdd from 'page/User/add.vue'
import staffMana from 'page/admin/staffMana'
import addStaff from 'page/admin/addStaff'
import campusCodeMana from 'page/admin/campusCodeMana'
import stuMana from 'page/admin/stuMana'
import importStu from 'page/admin/importStu'
import importFee from 'page/admin/importFee'
import feeList from 'page/student/feeList'
import resetDate from 'page/admin/resetDate'

/*
*
* */
export default {
    mode: 'history',
    base: __dirname,
    routes: [
        {
            path: '*',
            name:'/404',
            component: NoFind
        },{
            path: '/',
            redirect: '/login'
        },{
            path: '/login',
            name:'login',
            meta:{title:'登录'},
            component: Login
        }
        ,
        {
            path:'/admin',
            meta:{verify:true, title:'后台管理'},
            component:Home,
            redirect: '/admin/staffMana',
            children:[
                {
                    path: 'staffMana',
                    meta:{
                        verify:true,
                        grade:common.page_grade.listSort,
                        title: '员工管理',
                        icon:'fa fa-th-large'
                    },
                    component: staffMana,
                    children:[
                        {
                            path: 'edit/:id',
                            meta:{
                                verify:true,
                                title: '编辑员工',
                                icon:'fa fa-user-times'
                            },
                            component: addStaff
                        }
                    ]
                },
                {
                    path: 'edit/:id',
                    meta:{
                        verify:true,
                        title: '编辑员工',
                        icon:'fa fa-user-times'
                    },
                    component: addStaff
                },
                {
                    path: 'addStaff',
                    meta:{
                        verify:true,
                        grade:common.page_grade.updateStaff,
                        title: '添加员工',
                        icon:'fa fa-th-large'
                    },
                    component: addStaff
                },
                {
                   path: 'stuMana',
                   meta:{
                       verify:true,
                       title:'学生管理',
                       icon:'fa fa-th-large'
                   } ,
                    component: stuMana
                }
                ,
                {
                    path: 'addStu',
                    meta:{
                        verify:true,
                        title:'导入学生',
                        icon:'fa fa-th-large'
                    } ,
                    component: importStu
                }
                ,
                {
                    path: 'campusCode',
                    meta:{
                        verify:true,
                        grade:common.page_grade.listSort,
                        title: '校区代码',
                        icon:'fa fa-th-large'
                    },
                    component: campusCodeMana
                },{
                    path: 'importFee',
                    meta:{
                        verify:true,
                        grade:common.page_grade.listSort,
                        title: '导入电费',
                        icon:'fa fa-th-large'
                    },
                    component: importFee
                }
                ,{
                    path: 'resetDate',
                    meta:{
                        verify:true,
                        grade:common.page_grade.listSort,
                        title: '重置日期',
                        icon:'fa fa-th-large'
                    },
                    component: resetDate
                }
            ]
        },
        {
            path: '/student',
            name:'student',
            meta:{title:'费用查询'},
            component: Home,
            redirect:'/student/feeList',
            children:[
                {
                    path: 'feeList',
                    meta: {
                        verify: true,
                        grade: common.page_grade.listSort,
                        title: '费用查询',
                        icon: 'fa fa-th-large'
                    },
                    component: feeList
                }
            ]
        },
        {
            path: '/article',
            meta:{
                verify:true,
                title:'收费管理',
                icon:'fa fa-file-text-o'
            },
            component: Home,
            redirect:'/article/list',
            children: [{
                path: 'sort',
                meta:{
                    verify:true,
                    grade:common.page_grade.listSort,
                    title: '分类管理',
                    icon:'fa fa-th-large'
                },
                component: ArticleSort
            },{
                path: 'list',
                meta:{
                    verify:true,
                    grade:common.page_grade.listArticle,
                    title: '文章列表',
                    icon:'fa fa-newspaper-o'
                },
                component: ArticleList
            },{
                path: 'add',
                meta:{
                    verify:true,
                    title: '添加文章',
                    icon:'fa fa-clone'
                },
                component: ArticleAdd
            },{
                path: 'edit/:id',
                meta:{
                    verify:true,
                    title: '编辑文章',
                    icon:'fa fa-clone'
                },
                component: ArticleAdd
            }]
        },{
            path: '/user',
            meta:{
                verify:true,
                title:'用户管理',
                icon:'fa fa-user-o'
            },
            redirect:'/user/list',
            component: Home,
            children: [{
                path: 'list',
                meta:{
                    verify:true,
                    grade:common.page_grade.userList,
                    title: '用户列表',
                    icon:'fa fa-address-card-o'
                },
                component: userList
            },{
                path: 'add',
                meta:{
                    verify:true,
                    grade:common.page_grade.updateUser,
                    title: '添加用户',
                    icon:'fa fa-user-plus'
                },
                component: userAdd
            },{
                path: 'edit/:id',
                meta:{
                    verify:true,
                    title: '编辑用户',
                    icon:'fa fa-user-times'
                },
                component: userAdd
            }]
        },{
            path: '/upfile',
            meta:{
                verify:true,
                title:'上传管理',
                icon:'fa fa-upload'
            },
            component: Home,
            redirect:'/upfile/list',
            children: [{
                path: 'list',
                meta:{
                    verify:true,
                    grade:common.page_grade.listUpFile,
                    title: '上传列表',
                    icon:'fa fa-files-o'
                },
                component: UpFileList
            }]
        }
    ]
}
