<template>
    <div>
        <el-row class="grid-table">
            <el-table stripe border style="width:100%;margin-top:10px" :data="table_data.data" @selection-change="handleSelectionChange">
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
        </el-row>
        <el-row>
            <el-col :span="4">
                <span> 校区</span>
            <el-input
                v-model="campus.campusName"
                size="small"
                placeholder="校区名称"
                clearable>
            </el-input>
            </el-col>

            <el-col :span="4">
                <span> 编码</span>
                <el-input
                    v-model="campus.campusCode"
                    size="small"
                    placeholder="校区代码"
                    clearable>
                </el-input>
            </el-col>
            <el-col :span="4">
                <br/>
                <el-button type="primary" @click="addCampus">添加</el-button>
            </el-col>
        </el-row>
        <el-row class="grid-table">
            <el-table stripe border style="width:100%;margin-top:10px" :data="building_data.data" @selection-change="handleSelectionChange">
                <el-table-column type="selection"  width="55"></el-table-column>
                <el-table-column
                    show-overflow-tooltip
                    v-for="item in building_data.columns"
                    :label="item.name"
                    :key="item.key"
                    :prop="item.key"
                    :formatter="columnFormatter"
                    :min-width="item.minWidth" :width="item.width">
                </el-table-column>
            </el-table>
        </el-row>
        <el-row>
            <el-col :span="4">
                <span> 楼栋</span>
                <el-input
                    v-model="campus.campusName"
                    size="small"
                    placeholder="楼栋名称"
                    clearable>
                </el-input>
            </el-col>

            <el-col :span="4">
                <span> 楼栋代码</span>
                <el-input
                    v-model="campus.campusCode"
                    size="small"
                    placeholder="楼栋代码"
                    clearable>
                </el-input>
            </el-col>
            <el-col :span="4">
                <br/>
                <el-button type="primary" @click="addCampus">添加</el-button>
            </el-col>
        </el-row>
        <el-row>
        <el-tag type="info" style="background-color: #409EFF">设定水电费</el-tag>
        </el-row>
        <el-row>
            <el-col :span="4">
                <span> 水费</span>
                <el-input
                    v-model="fee.waterFee"
                    size="small"
                    placeholder="水费:xx/立方"
                    clearable>
                </el-input>
            </el-col>

            <el-col :span="4">
                <span> 电费</span>
                <el-input
                    v-model="fee.eleFee"
                    size="small"
                    placeholder="电费:xx/度"
                    clearable>
                </el-input>
            </el-col>
            <el-col :span="4">
                <br/>
                <el-button type="primary" @click="modiFee">修改</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import ajax from '../../utils/ajax'
    import store from '../../store/index'
    export default {
        name: "campusCodeMana",
        data() {
            return {
                fee:{
                    waterFee:0,
                    eleFee:0
                },
                campus:{
                    campusName: '',
                    campusCode:''
                },
                buliding:{
                  campusCode:'',
                  buildingName:'',
                    buildingCode:''
                },
                table_data:{
                    columns: [
                        {"key": "campusName", "name": "校区名", width: 150},
                        {"key": "campusCode", "name": "校区代码", width: 150},
                        {"key": "operations", "name": "操作", width: 158}
                    ],
                    data: []
                },
                building_data:{
                    columns: [
                        {"key": "campusName", "name": "校区名", width: 150},
                        {"key": "buildingName", "name": "楼栋名", width: 150},
                        {"key": "buildingCode", "name": "楼栋代码", width: 150},
                        {"key": "operations", "name": "操作", width: 158}
                    ],
                    data: []
                }
            }
        },
        methods: {
            addCampus(){
                // todo
                // ajax.call(this, '/addCampus', this.campus, (obj, err) => {
                //     if (!err) {
                //         this.campus.empty()
                //     }
                // });
            },
            ajaxData() {
                ajax.call(this, '/listCampus', "", (obj, err) => {
                    if (!err) {
                        this.table_data.data = obj.data;
                    }
                });
            },
            createButton(h, row, code, text){
                let self = this;
                return h('el-button', {
                    props: {size: 'small'},
                    on: {
                        click(){
                            self.healColumnClick(code, row)
                        }
                    }
                },[text])
            },
            //格式化显示列表， 并且增加2个按钮
            columnFormatter(row, column){
                let key = column.property;
                let str = row[key]+'';
                let h = this.$createElement;
                if(key === 'operations'){
                    return h('div',[
                        this.createButton(h,row,'edit','编辑'),
                        this.createButton(h,row,'delete','删除'),
                    ])
                }
                return str;
            },
            healColumnClick(code, row){
                if(code ==='edit'){

                }else if(code === 'delete'){
                    // this.deleteUser([row]);
                }
            },
            handleSelectionChange(){

            },
            modiFee(){
                console.log(this.fee.waterFee)
                this.$store.commit('SET_WATER_FEE',this.fee.waterFee)
            }
        },
        mounted(){

                this.fee.waterFee = this.$store.state.userInfo.waterFee
                this.fee.eleFee = this.$store.state.userInfo.eleFee
                ajax.call(this, '/listCampus', "", (obj, err) => {
                    if (!err) {
                        this.table_data.data = obj.data;
                    }
                });
                ajax.call(this, '/listBuilding', "", (obj, err) => {
                if (!err) {
                    //获取校区代码对应的名字
                    for(let value of obj.data) {
                        for(let t of this.table_data.data ){
                            if( value.campusCode===t.campusCode){
                                value.campusName = t.campusName
                            }
                        }
                        this.building_data.data.push(value)

                    }
                }
            });

        }
    }
</script>

<style scoped>

</style>
