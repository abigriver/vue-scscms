<template>
    <div  style="width: 50%;margin: auto">
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


    </div>
</template>

<script>
    export default {
        name: "retrivepwd",
        data(){
            return{

            }

        },methods:{
            verifyModi(){
                this.$parent.retrive = true;
                // this.$router.push('/login');
            }

        }

    }
</script>

<style lang="less">

</style>
