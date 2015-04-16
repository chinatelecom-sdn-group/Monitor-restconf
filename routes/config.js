/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements the system configure
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */

var fs = require('fs');
var mongoose = require('mongoose');
var dbOperation = require('../models/db_models/db_operation');
var model_resource = require('../models/data_models/Resource');
var model_host_config = require('../models/data_models/Host_Config');
var model_host_record = require('../models/data_models/Host_Record');
var model_chain = require('../models/data_models/Chain');
var model_topo = require('../models/data_models/Topo');
var model_link_type = require('../models/data_models/LinkType');
var model_virtual_machine = require('../models/data_models/VirtualMachine');
var model_virtual_switch_config = require('../models/data_models/vSwitch_Config');
var model_virtual_switch_record = require('../models/data_models/vSwitch_Record');
var system_cfg = require('../bin/config').system_cfg;//数据库配置

//connection list
var db_connection_list = {
    "ScpDB":null
};

//database operation list
var db_operation_list = {
    "Topo":null,
    "Chain":null,
    "Host_Config":null,
    "Host_Record":null,
    "vSwitch_Config":null,
    "vSwitch_Record":null,
    "LinkType":null,
    "VirtualMachine":null,
    "Resource":null
};
/*
 *@description convert url
 *@param mongodb - config
 */
function toMongoDBUrl(mongodb){
    var db_url = "mongodb://";
    db_url += mongodb.User + ":" + mongodb.Password+"@";
    db_url += mongodb.IP +":" + mongodb.Port;
    db_url += "/"+mongodb.DB;
    return db_url;
}

/*
 *@description init
 *@param callback - function
 */
exports.init = function(callback){
    //数据库链接
    var scp_db_url = toMongoDBUrl(system_cfg.mongodb);
    db_connection_list["ScpDB"] = mongoose.createConnection(scp_db_url);
    //数据库操作
    db_operation_list["Chain"] = new dbOperation("Resource_Chain",model_chain,db_connection_list["ScpDB"]);
    db_operation_list["Host_Config"] = new dbOperation("Resource_Host_Config",model_host_config,db_connection_list["ScpDB"]);
    db_operation_list["Host_Record"] = new dbOperation("Resource_Host_Record",model_host_record,db_connection_list["ScpDB"]);
    db_operation_list["vSwitch_Config"] = new dbOperation("Resource_vSwitch_Config",model_virtual_switch_config,db_connection_list["ScpDB"]);
    db_operation_list["vSwitch_Record"] = new dbOperation("Resource_vSwitch_Record",model_virtual_switch_record,db_connection_list["ScpDB"]);
    db_operation_list["LinkType"] = new dbOperation("Resource_LinkType",model_link_type,db_connection_list["ScpDB"]);
    db_operation_list["VirtualMachine"] = new dbOperation("Resource_VirtualMachine",model_virtual_machine,db_connection_list["ScpDB"]);
    db_operation_list["Resource"] = new dbOperation("Resource",model_resource,db_connection_list["ScpDB"]);
    db_operation_list["Topo"] = new dbOperation("Resource_Topo",model_topo,db_connection_list["ScpDB"]);
    callback();
};

/*
 *@description convert url
 *@param null
 */
exports.toUrl_ODL = function(){
    return system_cfg.opendaylight.IP + ":" + system_cfg.opendaylight.Port;
};

/*
 *@description get operation by name
 *@param name - eg.Chain
 */
exports.getOperationByName = function (name) {
    return db_operation_list[name];
}