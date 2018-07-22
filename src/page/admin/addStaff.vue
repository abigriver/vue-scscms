<template>
    <div class="add-article">
        <el-form ref="form" :model="data" :rules="rules" label-width="80px">
            <el-form-item label="用户帐号" prop="staffNo">
                <el-input :disabled="data.id > 0" v-model="data.staffNo"></el-input>
            </el-form-item>
            <el-form-item label="用户姓名" prop="staffName">
                <el-input :disabled="data.id > 0" v-model="data.staffName"></el-input>
            </el-form-item>
            <el-form-item label="用户密码" prop="staffPwd">
                <el-input type="password" v-model="data.staffPwd"></el-input>
            </el-form-item>
            <el-form-item label="用户手机" prop="staffPhone">
                <el-input :disabled="data.id > 0" v-model="data.staffPhone"></el-input>
            </el-form-item>
            <el-form-item label="用户邮箱" prop="mail">
                <el-input :disabled="data.id > 0" v-model="data.mail"></el-input>
            </el-form-item>
            <el-form-item label="用户类型" prop="staffType">
                <el-select v-model="data.staffType" placeholder="请选择">
                    <el-option v-for="(item,key) in staffType"
                        :key="key" :label="item" :value="key" v-if="key >1 && key <5">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="管理楼栋" prop="staffRange">
                <el-input :disabled="data.id > 0" v-model="data.staffRange"></el-input>
            </el-form-item>

            <el-form-item label="用户头像" prop="staffPic">
                <el-input v-model="data.staffPic"></el-input> <up-file ref="upload" :upload="{disabled:grade.upFile}" @successUpload="successUpload"></up-file> <el-button @click="upImg" :disabled="grade.upFile">上传图片</el-button>
            </el-form-item>
            <el-form-item style="text-align: right">
                <el-button @click="backList">返回列表</el-button>
                <el-button type="primary" :disabled="grade.updateUser||loading" @click="saveUser">保存用户</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script type="text/javascript">
    import {ajax,storage} from 'utils';
    import common from 'common';
    import components from 'components';
    module.exports = {
        name: 'addStaff',
        data() {
            const _this = this;
            return {
                page_grade:common.page_grade,
                grade:{
                    updateUser:!0,
                    upFile:!0,
                },
                staffType: common.user_type,
                loading:false,
                err:'',
                //id 为0 ,表示是新增记录，否则是修改
                data: {
                    id:0,
                    staffNo:'',
                    staffPhone:'',
                    staffName: '',
                    staffPwd:'',
                    mail:'',
                    staffType:'',
                    staffRange:'',
                    staffPic: ''
                },
                rules: {
                    staffNo: [{
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
                    staffPhone:[
                        {
                            required:true,
                            trigger:'change'
                        },{
                            pattern:/^[(0-9)]{2,20}$/
                        }
                    ],
                    staffName: [{
                        required: true,
                        message: '用户姓名不能为空！',
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
                    staffPwd: [{
                        required: true,
                        message: '密码不能为空！',
                        trigger: 'change'
                    }, {
                        pattern: common.pass_reg,
                        message: common.pass_txt,
                        trigger: 'change'
                    }],
                    mail: [{
                        required: false,
                        message: '邮箱格式错误',
                        trigger: 'change'
                    }
                    // ,{
                    //     validator: (rule, value, callback) => {
                    //         if( !value ) {
                    //             if (!common.email_reg.test(value)) {
                    //                 callback(new Error(common.email_txt));
                    //             } else if (_this.err.includes('邮箱')) {
                    //                 callback(new Error(_this.err));
                    //             } else {
                    //                 callback();
                    //             }
                    //         }
                    //     },
                    //     trigger: 'change'
                    //  }
                    ],
                    staffType: [{
                        required: true, message: '请选择用户类型', trigger: 'change'
                    }]
                }
            }
        },
        methods: {
            saveUser(){
                this.$refs.form.validate(v => {
                    if (v) {
                        this.visible = true;
                        this.data.article_extend = JSON.stringify({pic:this.data.pic});
                        ajax.call(this, '/updateStaff', this.data, (data, err) => {
                            this.loading = false;
                            if (!err) {
                                this.$message({
                                    message: '保存成功',
                                    type: 'success'
                                });
                                this.$router.push('/admin');
                            }else{
                                this.err = err;
                                if (err.includes('帐号') || err.includes('邮箱')) {
                                    this.$refs.form.validateField(err.includes('帐号') ? 'user_name' : 'user_email');
                                }
                            }
                        })
                    }
                });
            },
            upImg(){
                this.$refs.upload.SelectFile();
            },
            backList(){
                this.$router.push('/admin/staffMana');
            },
            successUpload(data){
                this.data.user_pic = data.filename;
            }
        },
        mounted() {
            let id = this.$route.params.id;
            // console.log(id)
            if(id) {
                ajax.call(this, '/getUserById', {id}, (obj, err) => {
                    if (!err) {
                        Object.getOwnPropertyNames(this.data).forEach(key => {
                            if(key !== 'staffPwd'){
                                this.data[key] = obj[key]+'';
                            }
                        });
                        // this.data.staffPwd = common.defaultPassword;
                    }
                })
            }
         },
        watch: {
            'data.staffNo'(){
                if(this.err.includes('帐号'))this.err = '';
            }
        },
        mixins:[common.mixin],
        components
    }
</script>
<style lang="less">

</style>
