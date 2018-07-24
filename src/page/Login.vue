<template>
    <div class="scs-screen login">
        <el-row class="content" >
            <div class="logo" style="float:left"></div>
            <div style="float:left; padding-left: 20px" >
                <p style="font-size: 30px; padding-top:10px"> 水电收费系统</p>
            </div>
            <el-row v-if="!retrive">
                <el-form label-width="0px" :model="data" :rules="rule_data" ref="loginForm">
                    <el-form-item prop='user_name'>
                        <el-input type="text" placeholder="账号" v-model="data.user_name"
                                  :disabled="loading" autofocus @keyup.native.enter="login()"></el-input>
                    </el-form-item>
                    <el-form-item prop='pass_word'>
                        <el-input type="password" placeholder="密码" v-model="data.pass_word"
                                  :disabled="loading" @keyup.native.enter="login()"></el-input>
                    </el-form-item>
                </el-form>
                <el-button type="primary" @click="login" :disabled="loading">登录</el-button>

                <el-button type="text" @click="openReg('retrieve')">忘记密码</el-button>
            </el-row>
            <el-row v-if="retrive">
                <el-tabs type="border-card">
                    <el-tab-pane label="通过邮箱找回">
                        <el-form  >
                            <el-form-item label="邮箱"  >
                                <el-input   ></el-input>
                            </el-form-item>
                            <el-form-item label="" >
                                <el-button type="primary" @click="retriveMailVcode()">获取邮箱验证码</el-button>
                            </el-form-item>
                            <el-form-item label="输入邮箱验证码:">
                                <el-input   @keyup.native.enter="verifyMailCode()"></el-input>
                            </el-form-item>
                            <el-form-item label="新密码" >
                                <el-input type="password"  ></el-input>
                            </el-form-item>
                            <el-form-item label="确认密码" >
                                <el-input type="password"  @keyup.native.enter="confirmPwd()"></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>

                    <el-tab-pane label="通过手机找回">
                        <el-form     >
                            <el-form-item label="手机号"  >
                                <el-input   ></el-input>
                                <el-button type="primary" >获取验证码</el-button>
                            </el-form-item>
                            <el-form-item label="输入验证码" >
                                <el-input > </el-input>
                            </el-form-item>
                            <el-form-item  >
                                <el-input type="password"  ></el-input>
                            </el-form-item>
                            <el-form-item label="确认密码"  >
                                <el-input type="password"  @keyup.native.enter="registers" ></el-input>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
                <el-row style="background-color:rgb(228, 231, 237) ">
                    <el-button type="primary" style="margin: 5px" @click="verifyModi()" >确定</el-button>
                </el-row>
            </el-row>

        </el-row>

    </div>
</template>

<script>
    import common from 'common';
    import {ajax, storage} from 'utils';
    import Retrivepwd from "./retrivepwd";
    export default {
        components: {Retrivepwd},
        data () {
            const _this = this;
            return {
                data: {
                    user_name: '',
                    pass_word: ''
                },
                placeholder:{
                    name:common.name_txt,
                    pass:common.pass_txt,
                    email:common.email_txt,
                },
                title:{
                    register:'用户注册',
                    retrieve:'找回密码'
                },
                retrive:false,
                type:'register',//register|retrieve
                loading: false,
                rule_data: {
                    user_name: [{
                        required: true,
                        message: '帐号不能为空！',
                        trigger: 'change'
                    }, {
                        pattern: common.name_reg,
                        message: common.name_txt,
                        trigger: 'change'
                    }],
                    pass_word: [{
                        required: true,
                        message: '密码不能为空！',
                        trigger: 'change'
                    }, {
                        pattern: common.pass_reg,
                        message: common.pass_txt,
                        trigger: 'change'
                    }],
                },
                err:'',
                register:{
                    visible:false,
                    loading:false,
                    rules: {
                        user_name: [{
                            required: true,
                            message: '用户帐号不能为空！',
                            trigger: 'change'
                        }, {
                            validator: (rule, value, callback) => {
                                if (!common.name_reg.test(value)) {
                                    callback(new Error(common.name_txt));
                                } else if (_this.err.includes('帐号')) {
                                    callback(new Error(_this.err));
                                } else {
                                    callback();
                                }
                            },
                            trigger: 'change'
                        }],
                        pass_word: [{
                            required: true,
                            message: '密码不能为空！',
                            trigger: 'change'
                        }, {
                            validator: (rule, value, callback) => {
                                if(!common.pass_reg.test(value)){
                                    callback(new Error(common.pass_txt));
                                } else {
                                    _this.form.pass_words && _this.$refs.regForm.validateField('pass_words');
                                    callback();
                                }
                            },
                            trigger: 'change'
                        }],
                        pass_words: [{
                            required: true,
                            message: '确认密码不能为空！',
                            trigger: 'change'
                        }, {
                            validator: (rule, value, callback) => {
                                if (!common.pass_reg.test(value)) {
                                    callback(new Error(common.pass_txt));
                                } else if (_this.form.pass_word !== _this.form.pass_words) {
                                    callback(new Error('密码与确认密码不相同！'));
                                } else {
                                    callback();
                                }
                            },
                            trigger: 'change'
                        }],
                        user_email: [{
                            required: true,
                            message: '邮箱不能为空！',
                            trigger: 'change'
                        }, {
                            validator: (rule, value, callback) => {
                                if (!common.email_reg.test(value)) {
                                    callback(new Error(common.email_txt));
                                } else if (_this.err.includes('邮箱')) {
                                    callback(new Error(_this.err));
                                } else {
                                    callback();
                                }
                            },
                            trigger: 'change'
                        }]
                    }
                },
                form:{
                    user_name:'',
                    pass_word:'',
                    pass_words:'',
                    user_email:''
                }
            };
        },
        mounted(){
            storage.remove('token');
            let key = this.$route.query.active || this.$route.query.find;
            if (key && common.deal_results.hasOwnProperty(key)) {
                let msg = this.$route.query.active ? '激活用户' : '密码找回';
                this.$notify({
                    title: '系统通知',
                    duration: 10000,
                    message: common.deal_results[key].replace('#', msg),
                    type: key === 'success' ? 'success' : 'error'
                });
            }
        },
        methods: {
            registers(){
                this.$refs.regForm.validate(valid => {
                    if (valid) {
                        this.$confirm('确定要' + this.title[this.type] + '？注意：操作后需要邮箱激活帐号！', '系统提醒', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            this.register.loading = true;
                            ajax.call(this, '/' + this.type, this.form, (data, err) => {
                                this.register.loading = false;
                                if (!err) {
                                    this.register.visible = false;
                                    let msg = this.type === 'register' ? '注册用户' : '找回密码';
                                    this.$message({
                                        message: (data.emailErr ? '#成功。但激活邮件发送失败，请联系管理员！' : '恭喜您#成功,请登录邮箱激活帐号！').replace('#', msg),
                                        type: data.emailErr ? 'warning' : 'success'
                                    });
                                } else {
                                    this.err = err;
                                    if (err.includes('帐号') || err.includes('邮箱')) {
                                        this.$refs.regForm.validateField(err.includes('帐号') ? 'user_name' : 'user_email');
                                    }
                                }
                            })
                        }).catch(() => {
                        });
                    }
                });
            },
            verifyModi(){
                this.retrive = false;
            },
            openReg(type){
                // this.$refs.regForm && this.$refs.regForm.resetFields();
                // this.type = type;
                // this.register.visible = true;
                // this.$router.push('/retrivepwd')
                this.retrive = true;
            },
            login() {
                this.$refs.loginForm.validate(valid => {
                    if (valid && !this.loading) {
                        this.loading = true;
                        ajax.call(this, '/login', this.data, (data, err) => {
                            this.loading = false;
                            if (!err) {
                                storage.set('userInfo', data, () => {
                                    this.$router.replace(this.$route.query.url||'/article/list');
                                })
                            }
                        })
                    }
                })
            }
        },
        watch: {
            'form.user_name'(){
                if(this.err.includes('帐号'))this.err = '';
            },
            'form.user_email'(){
                if(this.err.includes('邮箱'))this.err = '';
            }
        }
    };
</script>

<style lang="less">
    .login {
        background:#373a42 url('../assets/bg.jpg') no-repeat center;
        background-size: cover;
        .el-dialog__body{
            padding-bottom:0
        }
        .content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -70%);
            background: #fff;
            background-clip: padding-box;
            box-shadow: 0 6px 12px rgba(0,0,0,.4);
            border: 5px solid rgba(0, 100, 200, .3);
            padding: 16px;
            width: 30%;
            min-width: 300px;
            max-width: 400px;
            border-radius: 10px;
            .logo {
                background: url('../assets/logo.png') no-repeat center ;
                background-size: 100% 100%;
                height: 70px;
                width: 70px;
                margin-bottom: 15px;
            }
            .el-button {
                margin-left:20px;
                float:right
            }
        }
    }
</style>
