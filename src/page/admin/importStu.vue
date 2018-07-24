<template>
    <div>
        <!--<input id="upload" type="file" @change="importStu(this)"-->
               <!--accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />-->
        <!--<el-upload class="upload-demo"-->
                   <!--:action="importUrl"//上传的路径-->
        <!--:name ="name"//上传的文件字段名-->
        <!--:headers="importHeaders"//请求头格式-->
        <!--:on-preview="handlePreview"//可以通过 file.response 拿到服务端返回数据-->
        <!--:on-remove="handleRemove"//文件移除-->
        <!--:before-upload="beforeUpload"//上传前配置-->
        <!--:on-error="uploadFail"//上传错误-->
        <!--:on-success="uploadSuccess"//上传成功-->
        <!--:file-list="fileList"//上传的文件列表-->
        <!--:with-credentials="withCredentials">//是否支持cookie信息发送-->
        <!--</el-upload>-->

        <!--<input type="file" @change="importFile(this)" id="imFile" style="display: none"-->
               <!--accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>-->
        <!--<a id="downlink"></a>-->
        <!--action="http://127.0.0.1:3001/api/upExcelFile"-->
        <!--<el-upload-->
            <!--class="upload-demo"-->
            <!--ref="upload"-->
            <!--action=""-->
            <!--:show-file-list="false"-->
            <!--:on-change="handleChange"-->
            <!--:limit="1"-->
            <!--:auto-upload="false">-->
            <!--<el-button slot="trigger" size="small" type="primary">选取文件</el-button>-->
            <!--<div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过500kb</div>-->
            <!--&lt;!&ndash;<el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>&ndash;&gt;-->
        <!--</el-upload>-->

        <input type="file" @change="importFile($event)" id="imFile" style="display:inline-block;"
               accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>

        <!--<el-button class="button" @click="uploadFile($event)">导入</el-button>-->
        <!--<el-button type="warning" @click="downloadFile(excelData)">导出</el-button>-->
        <el-button type="warning" @click="writeDb(excelData)">确认导入?</el-button>
        <span slot="tip" class="el-upload__tip">密码默认是学号</span>
        <!--错误信息提示-->

        <!--展示导入信息-->
        <el-table :data="excelData" tooltip-effect="dark">
            <!--<el-table-column label="学号" prop="stuNo" show-overflow-tooltip></el-table-column>-->
            <!--<el-table-column label="姓名" prop="stuName" show-overflow-tooltip></el-table-column>-->
            <!--<el-table-column label="校区" prop="campusName" show-overflow-tooltip></el-table-column>-->
            <!--<el-table-column label="楼栋" prop="buildingName" show-overflow-tooltip></el-table-column>-->
            <!--<el-table-column label="宿舍号" prop="dormNum" show-overflow-tooltip></el-table-column>-->
            <!--<el-table-column label="提醒" prop="needRemind" show-overflow-tooltip></el-table-column>-->
            <!--<el-table-column label="手机号" prop="stuPhoneNum" show-overflow-tooltip></el-table-column>-->
            <el-table-column label="学号" prop="学号" show-overflow-tooltip></el-table-column>
            <el-table-column label="姓名" prop="姓名" show-overflow-tooltip></el-table-column>
            <el-table-column label="校区" prop="校区" show-overflow-tooltip></el-table-column>
            <el-table-column label="楼栋" prop="楼栋" show-overflow-tooltip></el-table-column>
            <el-table-column label="宿舍号" prop="宿舍号" show-overflow-tooltip></el-table-column>
            <el-table-column label="提醒" prop="提醒" show-overflow-tooltip></el-table-column>
            <el-table-column label="手机号" prop="手机号" show-overflow-tooltip></el-table-column>
        </el-table>
    </div>
</template>

<script>
    var XLSX = require('xlsx')
    import ajax from '../../utils/ajax'
    import axios from 'axios'
    export default {
        name: "importStu",
        data(){
            return {
                execlFile:'',
                json:[],
                fileList:[],
                impFile: '', // 导入文件el
                outFile: '',  // 导出文件el
                errorDialog: false, // 错误信息弹窗
                errorMsg: '', // 错误信息内容
                excelData: []
            }
        },
        methods: {
            //有问题
            handleChange(filePara){
                this.excelData = []
                FileReader.prototype.readAsBinaryString = function(f) {
                    var workbook; //读取完成的数据
                    var reader = new FileReader();
                    var binary = "";
                    reader.onload = function(ev) {
                        try {
                            const data = ev.target.result;
                            var bytes = new Uint8Array(reader.result);
                            var length = bytes.byteLength;
                            for(var i = 0; i < length; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            workbook = XLSX.read(binary, {
                                type: 'binary'
                            });

                        } catch(e) {
                            console.log('文件类型不正确');
                            return;
                        }
                        var fromTo = '';
                        for (var sheet in workbook.Sheets) {
                            if (workbook.Sheets.hasOwnProperty(sheet)) {
                                fromTo = workbook.Sheets[sheet]['!ref'];
                                this.excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
                            }
                        }

                    };

                    reader.readAsArrayBuffer(f);

                }

                var reader = new FileReader();
                reader.readAsBinaryString(filePara.raw);
            },
            writeDb(ed){
                // var td= JSON.stringify(this.excelData)
                let result={}
                axios.post('/updateStu', ed)
                    .then( res=>{
                        res = res ||{status:404,statusText:'服务器出错！'};
                        if (res.status === 200 || res.status === 304 || res.status === 400) {
                            return result = res;
                        }else{
                            return {
                                status: res.status,
                                data:{
                                    success:false,
                                    data:{},
                                    message:res.statusText
                                }
                            };
                        }

                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                if(result)
                    this.$router.push('/admin/stuMana');
                // ajax.call(this, '/updateStu', td, (data, err) => {
                //     this.loading = false;
                //     if (!err) {
                //         this.$message({
                //             message: '导入成功',
                //             type: 'success'
                //         });
                //         // this.$router.push('/user/list');
                //     }else{
                //         this.errorMsg = err;
                //         // if (err.includes('帐号') || err.includes('邮箱')) {
                //         //     this.$refs.form.validateField(err.includes('帐号') ? 'user_name' : 'user_email');
                //         // }
                //     }
                // })
            },
            //导出
            downloadFile(){
                let keyMap = [] // 获取键
                for (let k in json[0]) {
                    keyMap.push(k)
                }
                console.info('keyMap', keyMap, json)
                let tmpdata = [] // 用来保存转换好的json
                json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {
                    v: v[k],
                    position: (j > 25 ? this.getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
                }))).reduce((prev, next) => prev.concat(next)).forEach(function (v) {
                    tmpdata[v.position] = {
                        v: v.v
                    }
                })
                let outputPos = Object.keys(tmpdata)  // 设置区域,比如表格从A1到D10
                let tmpWB = {
                    SheetNames: ['mySheet'], // 保存的表标题
                    Sheets: {
                        'mySheet': Object.assign({},
                            tmpdata, // 内容
                            {
                                '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] // 设置填充区域
                            })
                    }
                }
                let tmpDown = new Blob([this.s2ab(XLSX.write(tmpWB,
                    {bookType: (type === undefined ? 'xlsx' : type), bookSST: false, type: 'binary'} // 这里的数据是用来定义导出的格式类型
                ))], {
                    type: ''
                })  // 创建二进制对象写入转换好的字节流
                var href = URL.createObjectURL(tmpDown)  // 创建对象超链接
                this.outFile.download = downName + '.xlsx'  // 下载名称
                this.outFile.href = href  // 绑定a标签
                this.outFile.click()  // 模拟点击实现下载
                setTimeout(function () {  // 延时释放
                    URL.revokeObjectURL(tmpDown) // 用URL.revokeObjectURL()来释放这个object URL
                }, 100)
            },
            importFile(upf){
                this.excelData = []
                let _this = this;
                this.file = event.target.files[0];
                var rABS = false; //是否将文件读取为二进制字符串
                var file = this.file;

                FileReader.prototype.readAsBinaryString = function(f) {
                    var binary = "";
                    var rABS = false; //是否将文件读取为二进制字符串
                    var pt = this;
                    var workbook; //读取完成的数据
                    // var excelData;
                    var reader = new FileReader();
                    reader.onprogress = function(e) {
                        let total = file.size;
                        _this.progress = (e.loaded/total)*100;
                        console.log( _this.progress);
                    };
                    reader.onload = function(e) {
                        try {
                            var bytes = new Uint8Array(reader.result);
                            var length = bytes.byteLength;
                            for(var i = 0; i < length; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            if(rABS) {
                                workbook = XLSX.read(btoa(fixdata(binary)), { //手动转化
                                    type: 'base64'
                                });
                            }else {
                                workbook = XLSX.read(binary, {
                                    type: 'binary'
                                });
                            }
                            // excelData = [];
                        } catch(e) {
                            console.log('文件类型不正确');
                            return;
                        }
                        var fromTo = '';
                        for (var sheet in workbook.Sheets) {
                            if (workbook.Sheets.hasOwnProperty(sheet)) {
                                fromTo = workbook.Sheets[sheet]['!ref'];
                                _this.excelData = _this.excelData.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                            }
                        }
                        // console.log(_this.excelData);
                    };

                    reader.readAsArrayBuffer(f);

                }

                var reader = new FileReader();
                if(rABS) {
                    reader.readAsArrayBuffer(file);
                }else {
                    reader.readAsBinaryString(file);
                }

            },
            s2ab(s){ // 字符串转字符流
                var buf = new ArrayBuffer(s.length)
                var view = new Uint8Array(buf)
                for (var i = 0; i !== s.length; ++i) {
                    view[i] = s.charCodeAt(i) & 0xFF
                }
                return buf
            },
            getCharCol(n){ // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
                let s = ''
                let m = 0
                while (n > 0) {
                    m = n % 26 + 1
                    s = String.fromCharCode(m + 64) + s
                    n = (n - m) / 26
                }
                return s
            },
            fixdata(data){
                var o = ''
                var l = 0
                var w = 10240
                for (; l < data.byteLength / w; ++l) {
                    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
                }
                o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
                return o
            }
        },
        mounted () {
            this.imFile = document.getElementById('imFile')
        }

    }
</script>

<style scoped>
    .el-table th>.cell {
        text-align: center;
    }
</style>
