<template>
    <div>


        <input type="file" @change="importFile($event)" id="imFile" style="display:inline-block;"
               accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>

        <el-button type="warning" @click="writeDb(excelData)" :disabled="confirm">确认导入?</el-button>
        <span slot="tip" class="el-upload__tip">{{errorMsg}} </span>
        <!--错误信息提示-->

        <!--展示导入信息-->
        <el-table :data="excelData" tooltip-effect="dark">

            <el-table-column label="校区" prop="校区" show-overflow-tooltip></el-table-column>
            <el-table-column label="楼栋" prop="楼栋" show-overflow-tooltip></el-table-column>
            <el-table-column label="宿舍号" prop="宿舍号" show-overflow-tooltip></el-table-column>
            <el-table-column label="电表读数" prop="电表读数" show-overflow-tooltip></el-table-column>
            <el-table-column label="日期" prop="日期" show-overflow-tooltip></el-table-column>
        </el-table>
    </div>
</template>

<script>
    var XLSX = require('xlsx')
    import ajax from '../../utils/ajax'
    import axios from 'axios'
    export default {
        name: "importFee",
        data(){
            return {
                execlFile:'',
                confirm:true,
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
            ajaxData() {
                const oo = {
                    id:'ID',
                    dormNum:'宿舍号',
                    buildingCode:'楼栋',
                    campusCode:'校区',
                    eleNum:'电表读数',
                    eleDate:'日期'
                };
                var arrayKey = Object.getOwnPropertyNames(oo);
                var arrayValue = []
                for (let i in oo) {
                    arrayValue.push(oo[i]); //  arrayValue: 校区，楼栋，宿舍号
                }
                ajax.call(this, '/listFee', "", (obj, err) => {
                    if (!err) {
                        //由于EXCEL导入表和el-table显示捆绑的表 的key 不一致，所以这里做一个转换，把
                        // obj.data里面的 key：campusCode等数据库key，转换为 中文校区，以便显示
                        for(let i=0;i<obj.data.length;i++){
                            let t=[], mm=0
                            for (let j in obj.data[i]) {
                                t[ arrayValue[mm] ] = obj.data[i][j]
                                mm++
                            }
                            this.excelData.push(t)
                        }
                    }
                });
            },
            writeDb(ed){
                // var td= JSON.stringify(this.excelData)
                let result={}
                axios.post('/writeFee', ed)
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
                    this.$router.push('/admin/');
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
                this.confirm=false

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
            this.ajaxData()
        }

    }
</script>

<style scoped>
    .el-table th>.cell {
        text-align: center;
    }
</style>
