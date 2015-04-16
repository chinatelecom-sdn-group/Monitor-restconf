/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements collecting data from opendaylight
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */

var nodegrass = require('nodegrass');//http工具库
var config = require('./config');
var converter = require('./converter');

/*
 *@description get node of netconf
 *@param result - return value
 *@param callback - function
 */
function get_nodes(result,callback){
    var url = "http://";
    url += config.toUrl_ODL();
    url += "/restconf/operational/opendaylight-inventory:nodes/";
    nodegrass.get(url,function(data,status,headers){
        //console.log(status);
        //console.log(headers);
        //console.log(typeof(data));
        //console.log(data);
        if(status=="200"){
            var json = JSON.parse(data);
            //console.log(json.nodes.node.length);
            //console.log(json.nodes);
            var num_nodes = json.nodes.node.length;
            for(var i=0; i<num_nodes; i++){
                console.log(json.nodes.node[i].id);
                if(json.nodes.node[i].id=="controller-config"){
                    continue;
                }else if(json.nodes.node[i].id.indexOf("PFS")>=0){
                    continue;
                }
                var node = {
                    id:json.nodes.node[i].id,
                    info:""
                };
                result.nodes[result.nodes.length] = node;
            }
        }
        //console.log(result);
        callback(null,result);
    },'gbk').on('error', function(e) {
        console.error("Got error: " + e.message);
        callback("getNodes error",null);
    });
}


/*
 *@description commit data of node
 *@param save_data - return value
 *@param tag_list - the tag list that need to commit
 *@param count - tag count
 *@param callback - function
 */
function commit_node_info(save_data,tag_list,count,callback){
    if(count == tag_list.length){
        callback(null);//处理完成
    }
    else{
        var name = tag_list[count].name;//判断有没有对应的数据
        var table = tag_list[count].table;
        if(save_data.hasOwnProperty(name)&&save_data[name]!=null){
            //console.log("hasOwnProperty:"+name);
            var instance = save_data[name];
            var db_operation = config.getOperationByName(table);
            var condition = {
                search: null,
                columns:""
            };
            if(instance.hasOwnProperty("name")){
                condition.search = {name:instance.name};
            }else{
                condition.search = {Name:instance.Name};
            }
            if(tag_list[count].op=="save"){
                db_operation.save(instance,function(err,instance_id) {
                    if(err!=null) {
                        console.log(instance);
                        console.log("[error]save "+name+":"+err);
                    }
                    count++;
                    instance["link_id"] = instance_id;
                    commit_node_info(save_data,tag_list,count,callback);
                });
            }else if(tag_list[count].op=="last_one_and_save"){
                db_operation.get_last_one_and_save(condition,instance,tag_list[count].func,function(err,instance_id) {
                    if(err!=null) {
                        console.log(instance);
                        console.log("[error]save "+name+":"+err);
                    }
                    count++;
                    instance["link_id"] = instance_id;
                    commit_node_info(save_data,tag_list,count,callback);
                });
            }
            else{
                db_operation.save_or_modify(condition,instance,function(err,instance_id) {
                    if(err!=null) {
                        console.log(instance);
                        console.log("[error]save "+name+":"+err);
                    }
                    count++;
                    instance["link_id"] = instance_id;
                    commit_node_info(save_data,tag_list,count,callback);
                });
            }
        }else{
            //console.log("No hasOwnProperty:"+name);
            count++;
            commit_node_info(save_data,tag_list,count,callback);
        }

    }
}
/*
 *@description convert time format
 *@param fmt - time format,eg.yyyy-MM-dd hh:mm:ss
 */
function get_local_time(fmt){
    var date = new Date();
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
/*
 *@description vonvert time
 *@param fmt - time format
 */
function convert_time(fmt){
    var date = new Date();
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/*
 *@description calc the speed of nic
 *@ param last_one - last instance
 *@ param instance - current instance
 */
function host_speed_calc(last_one,instance){
    //console.log(last_one);
    //console.log(instance);
    var time1 = last_one.TimeStamp; //得到毫秒数
    var time2 = instance.TimeStamp; //得到毫秒数
    var time_interval = (time2-time1)/1000;
    if(last_one.Network!=undefined&&instance.Network!=undefined&&time_interval>0){
        var nic_map = {};
        for(var i=0; i<last_one.Network.length; i++){
            nic_map[last_one.Network[i].Name] = last_one.Network[i];
        }
        for(var j=0; j<instance.Network.length; j++){
            var name = instance.Network[j].Name;
            if(nic_map.hasOwnProperty(name)){
                var RxSpeed = (instance.Network[j]["Rxbytes"] - nic_map[name]["Rxbytes"])/time_interval;
                var TxSpeed = (instance.Network[j]["Txbytes"] - nic_map[name]["Txbytes"])/time_interval;
                instance.Network[j]["RxSpeed"] = RxSpeed;
                instance.Network[j]["TxSpeed"] = TxSpeed;
            }
        }
    }
    return instance;
}

/*
 *@description calc the speed of vSwitch
 *@ param last_one - last instance
 *@ param instance - current instance
 */
function vSwitch_speed_calc(last_one,instance){
    //var time1 = convert_time(last_one.Time,"yyyy-MM-dd hh:mm:ss");
    //var time2 = convert_time(instance.Time,"yyyy-MM-dd hh:mm:ss");
    var time1 = last_one.TimeStamp; //得到毫秒数
    var time2 = instance.TimeStamp; //得到毫秒数
    var time_interval = (time2-time1)/1000;
    if(last_one.Port!=undefined&&instance.Port!=undefined&&time_interval>0){
        var port_map = {};
        for(var i=0; i<last_one.Port.length; i++){
            port_map[last_one.Port[i].Name] = last_one.Port[i];
        }
        for(var j=0; j<instance.Port.length; j++){
            var name = instance.Port[j].Name;
            if(port_map.hasOwnProperty(name)){
                var RxSpeed = (instance.Port[j]["Rxbytes"] - port_map[name]["Rxbytes"])/time_interval;
                var TxSpeed = (instance.Port[j]["Txbytes"] - port_map[name]["Txbytes"])/time_interval;
                instance.Port[j]["RxSpeed"] = RxSpeed;
                instance.Port[j]["TxSpeed"] = TxSpeed;
            }
        }
    }
    return instance;
}

/*
 *@description get node data from opendaylight
 *@param node_name - node name
 *@param local_time - local time
 *@param callback - function for return value
 */
function get_node_info(node_name,local_time,callback){
    var url = "http://";
    url += config.toUrl_ODL();
    url += "/restconf/operational/opendaylight-inventory:nodes/node/";
    url += node_name + "/yang-ext:mount/";
    nodegrass.get(url,function(data,status,headers){
        if(status=="200"){
            var data_info_count = 0;
            var json = JSON.parse(data);
            var resource = null;
            if(json.data.hasOwnProperty("resource")){
                resource = json.data.resource;
                resource["Name"] = node_name;
                resource["Time"] = converter.convert_time(local_time,"yyyy-MM-dd hh:mm:ss");
                var db_operation = config.getOperationByName("Resource");
                db_operation.save(resource,function(err) {
                    if(err==null) {
                        //将原始数据转换为各种需要的数据
                        var nic_data = converter.convert_netdev(node_name,resource);
                        var host_data = converter.convert_host(node_name,resource,nic_data,local_time);
                        var switch_data = converter.convert_switch(node_name,resource,local_time);
                        var vm_data = converter.convert_vm(node_name,resource);
                        //提交各种数据
                        var tag_index = 0;
                        var result_data ={
                            name:node_name,
                            host_data:host_data.config,
                            nic_data:nic_data,
                            vm_data:vm_data,
                            switch_data:switch_data.config,
                            tap_data:switch_data.config_tap
                        };
                        var save_data = {
                            "Host_Config":host_data.config,
                            "Host_Record":host_data.record,
                            "vSwitch_Config":switch_data.config,
                            "vSwitch_Record":switch_data.record
                        };
                        var tag_list = [
                            {
                                name:"Host_Config",
                                table:"Host_Config",
                                op:"save_or_modify"
                            },
                            {
                                name:"vSwitch_Config",
                                table:"vSwitch_Config",
                                op:"save_or_modify"
                            },
                            {
                                name:"Host_Record",
                                table:"Host_Record",
                                op:"last_one_and_save",
                                func:host_speed_calc //带上独特的处理函数
                            },
                            {
                                name: "vSwitch_Record",
                                table:"vSwitch_Record",
                                op: "last_one_and_save",
                                func:vSwitch_speed_calc //带上独特的处理函数
                            }
                        ];
                        //提交实时采集到的数据
                        commit_node_info(save_data,tag_list,tag_index,function(err){
                            //提交转换的数据
                            if(err!=null){
                                console.log("[error]insert resource|"+err);
                                console.log(resource);
                            }
                            callback(err,node_name,result_data);
                        });
                    }else{
                        //保存resource失败
                        var iner_err = "[error]save resource:"+err;
                        callback(iner_err,node_name,null);
                    }//db_operation.save@if
                });
            }else{
                var iner_err = "[warn]not found resource:"+status;
                callback(iner_err,node_name,null);
            }
        }else{
            var iner_err = "[warn]not found resource:"+status;
            callback(iner_err,node_name,null);
        }
    },'gbk').on('error', function(e) {
        callback("get_node_info error",node_name,null);
    });
}

/*
 *@description get node data from opendaylight
 *@param result - the result of monitor-restconf
 *@param callback - function for return value
 */
function get_node_list_info(result,callback){
    var callback_count = 0;
    var resource_list = [];
    var node_num = result.nodes.length;
    for(var i=0; i< result.nodes.length; i++){
        //先保存各种基本点信息
        get_node_info(result.nodes[i].id,result.time,function(err,node_name,save_data){
            console.log("get_node_info:"+node_name);
            callback_count += 1;
            if(save_data!=null){
                var index = resource_list.length;
                resource_list[index] = save_data;
            }
            if(err!=null){
                console.log(err);
            }
            //全部采集完之后再计算拓扑结构
            if(callback_count==node_num){
                callback(null,resource_list);
            }
        });
    }
}

/*
 *@description commit topology list
 *@param result - the result of monitor-restconf
 *@param callback - function for return value
 */
function commit_topo_list(result,callback){
    var tag_index = 0;
    var tag_list = [];
    var topo_list = {};
    //计算id_mac
    var id_mac = converter.convert_id_mac(result);
    for(var j=0; j<result.length; j++){
        var resource = result[j];
        if(resource.switch_data==null){
	    console.log("[warning]no switch data:"+resource.name); 
            continue;
        }
        topo_list[resource.name] = converter.convert_topo(resource.name,resource.host_data,resource.switch_data,resource.vm_data,resource.tap_data,id_mac);
        var valid_topo = true;
        for(var vm_index=0; vm_index<topo_list[resource.name].vm.length; vm_index++){
            if(topo_list[resource.name].vm[vm_index].link_id==""){
                valid_topo = false;
                break;
            }
        }
        if(valid_topo){
            var index = tag_list.length;
            tag_list[index] = {
                name:resource.name,
                table:"Topo",
                op:"save_or_modify"
            };
	    console.log("[info]topo:"+resource.name);
        }else{
	    console.log("[valid_topo]"+JSON.stringify(topo_list[resource.name]));
	}
    }
    //console.log("topo_list:"+JSON.stringify(topo_list));
    //提交实时采集到的数据
    commit_node_info(topo_list,tag_list,tag_index,function(err){
        //提交转换的数据
        if(err!=null){
            console.log("[error]insert resource|"+err);
            console.log(resource);
        }
        callback(null,null);
    });
}

/*
 *@description loop execute function
 *@param funcs - function list
 *@param count - current num for execute
 *@param result - the handle result
 *@param callback - function
 */
function execute_func(funcs,count,result,callback){
    if(count == funcs.length){
        callback(null,result);//处理完成
    }
    else{
        funcs[count](result,function(err,result){
            if(err!=null){
                callback(err,null);//出错
            }
            else{
                count++;
                execute_func(funcs,count,result,callback);
            }
        });
    }
}

/*
 *@description collector
 *@param null
 */
exports.collector = function(){
    //创建ServiceInstance列表
    var result = {
        "time":"",
        "nodes":[]
    };
    //指定函数处理链表
    var func_list = [
        get_nodes,
        get_node_list_info,
        commit_topo_list
    ];
    //执行
    result.time = new Date();
    var local_time = converter.convert_time(result.time,"yyyy-MM-dd hh:mm:ss");
    console.log("["+local_time+"]collect start");
    execute_func(func_list,0,result,function(err,result){
        var local_time = converter.get_local_time("yyyy-MM-dd hh:mm:ss");
        console.log("["+local_time+"]collect complete");
    });
};
