<template>
    <div>
        <el-row>
            <el-date-picker
                v-model="pickDate"
                type="date"
                placeholder="选择日期">
            </el-date-picker>
            <el-button type="primary" @click="setDate">设置宿舍初始日期</el-button>
        </el-row>
        <el-row class="grid-table">
            <el-col :span="4">
            <el-table stripe border style="width:100%;margin-top:10px" :data="table_data.data"   @cell-click="showBuilding">
                <el-table-column type="selection"  width="55"></el-table-column>
                <el-table-column
                    show-overflow-tooltip
                    v-for="item in table_data.columns"
                    :label="item.name"
                    :key="item.key"
                    :prop="item.key"
                    :min-width="item.minWidth" :width="item.width">
                </el-table-column>
            </el-table>
            </el-col>
            <el-col :span="1">
                <div>

                </div>
            </el-col>
            <el-col :span="4">
            <el-table stripe border style="width:100%;margin-top:10px" :data="building_data.data" @cell-click="showRoom">
                <el-table-column type="selection"  width="55"></el-table-column>
                <el-table-column
                    show-overflow-tooltip
                    v-for="item in building_data.columns"
                    :label="item.name"
                    :key="item.key"
                    :prop="item.key"
                    :min-width="item.minWidth" :width="item.width">
                </el-table-column>
            </el-table>
            </el-col>
            <el-col :span="4">
                <el-table stripe border style="width:100%;margin-top:10px" :data="dormData" >
                    <el-table-column type="selection"  width="55"></el-table-column>
                    <el-table-column
                        show-overflow-tooltip
                        label="房间号"
                        prop="dormNum"
                        min-width="150" width="150">
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import ajax from '../../utils/ajax'
    export default {
        name: "resetDate",
        data(){
            return {
                table_data:{
                    columns: [
                        {"key": "campusName", "name": "校区名", width: 150},
                    ],
                    data: []
                },
                building_data:{
                    columns: [
                        {"key": "buildingName", "name": "楼栋名", width: 150}
                    ],
                    data: []
                },
                setDateMsg:'',
                feeData:[],
                dormData:[],
                pickDate:''
            }
        },
        methods: {
            setDate(){
                let dateStr=this.formatDate(this.pickDate)
                console.log(dateStr)
                ajax.call(this, '/updateFee', {data:dateStr}, (obj, err) => {
                    if (!err) {
                        this.setDateMsg = "费用日期初始化成功"
                    }else{
                        this.setDateMsg = "费用日期初始化失败"
                    }
                });
            },
            listCampus() {
                ajax.call(this, '/listCampus', "", (obj, err) => {
                    if (!err) {
                        this.table_data.data = obj.data;
                    }
                });
            },
            showBuilding(row, column, cell){
                this.building_data.data = []
                ajax.call(this, '/listBuilding', "", (obj, err) => {
                    if (!err) {
                        //console.log(obj.data)
                        for (let value of obj.data) {
                                if (value.campusCode === row['campusCode']) {
                                    this.building_data.data.push(value)
                                }
                        }
                    }
                })

            },
            showRoom(row){
                this.dormData=[]
                for( let v of this.feeData){
                    if ( v['campusCode'] === row['campusCode'] &&
                        v['buildingCode'] === row['buildingCode']
                    ){
                        this.dormData.push(v)
                    }
                }


            },
            formatDate(date){

                var year = date.getFullYear(),
                    month = date.getMonth()+1,//月份是从0开始的
                    day = date.getDate()

                var newTime = year + '-' +
                    (month < 10? '0' + month : month) + '-' +
                    (day < 10? '0' + day : day)


                return newTime;
            }

        },
        mounted(){
            ajax.call(this, '/listCampus', "", (obj, err) => {
                if (!err) {
                    this.table_data.data = obj.data;
                }
            });
            ajax.call(this, '/listFee', "", (obj, err) => {
                if (!err) {
                    this.feeData = obj.data
                }
            });
        }
    }
</script>

<style scoped>

</style>
