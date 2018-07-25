module.exports = {
    state:{
        data: {

        },
        waterFee:2.3,
        eleFee:3.4
    },
    mutations:{
        SET_USER_INFO(state,obj) {
            if(typeof obj === "object"){
                state.data = obj;
            }
        },
        SET_WATER_FEE(state,value) {
            if(typeof value === "number"){
                state.waterFee = value;
            }
        },
        SET_ELE_FEE(state,value) {
            if(typeof value === "number"){
                state.eleFee = value;
            }
        },
        SET_USER_KEY_VALUE(state,obj) {
            if(obj.hasOwnProperty("key") && obj.hasOwnProperty("value")){
                state.data[obj.key] = obj.value;
            }
        }
    },
    actions:{
        set_userInfo: ({commit},obj) => {
            commit("SET_USER_INFO",obj);
        },
        set_water_fee: ({commit},value) => {
            commit("SET_WATER_FEE",value);
        },
        set_ele_fee: ({commit},value) => {
            commit("SET_ELE_FEE",value);
        },
        set_userInfo_keyValue: ({commit},obj) => {
            commit("SET_USER_KEY_VALUE",obj);
        }
    }
};
