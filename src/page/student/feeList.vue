<template>
    <div>

        <el-table stripe border style="width:100%;margin-top:10px" :data="table_data.data" >
            <el-table-column type="selection"  width="55"></el-table-column>
            <el-table-column
                show-overflow-tooltip
                v-for="item in table_data.columns"
                :label="item.name"
                :key="item.key"
                :prop="item.key"
                :formatter="columnFormatter"
                :min-width="item.minWidth" :width="item.width">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import {ajax,storage} from 'utils';
    import common from 'common';
    export default {
        name: "feeList",
        data(){
            return {
                execlFile:'',
                confirm:true,
                json:[],
                fileList:[],
                errorDialog: false, // 错误信息弹窗
                errorMsg: '', // 错误信息内容
                excelData: [],
                campusCode:'',
                buildingCode:'',
                search_data:{},
                table_data:{
                    columns: [],
                    data: []
                },
                objColName : {
                    dormNum:'宿舍号',
                    buildingCode:'楼栋',
                    campusCode:'校区',
                    eleNum:'电表读数',
                    eleDate:'日期',
                    balance:'余额'
                },
                colName:[]
            }
        },
        methods: {
            ajaxData(){
                storage.get('userInfo',obj=>{
                    this.search_data.campusName = obj.userInfo.campusName
                    this.search_data.buildingName = obj.userInfo.buildingName
                    this.search_data.dormNum = obj.userInfo.dormNum
                })
                ajax.call(this, '/searchFee', this.search_data, (obj, err) => {
                    if (!err) {
                        this.excelData = obj.data;
                        this.table_data.data = obj.data
                    }
                });
            },
            columnFormatter(row,col){
                let key = col.property;
                let str = row[key]+'';
                if(key === 'eleDate'){
                    str = str.substr(0,10)
                }
                return str
            }
        },mounted(){

            this.colName = Object.getOwnPropertyNames(this.objColName)
            //最后一个是__ob_
            this.colName.pop()
            var arrayValue = []
            for (let i in this.objColName) {
                arrayValue.push(this.objColName[i]); //  arrayValue: 校区，楼栋，宿舍号
            }
            for( let i in this.colName){
                let t={}
                t.key = this.colName[i]
                t.name = arrayValue[i]
                t.width = 150
                t.minWidth = 100
                console.log(t)
                this.table_data.columns.push(t)
            }
            // console.log(this.table_data.columns)
            this.ajaxData()
        }
    }
</script>

<style scoped>

</style>
