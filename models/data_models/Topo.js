/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements the mongoose schema of topology
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */

var mongoose = require('mongoose');

var model_vm = new mongoose.Schema({
    name:String,
    link_id:String,
    type:String,
    pty:String,
    ovs_ports:[{
        name:String,
        outway:String,
        port_no:Number
    }],
    mgr_port:{
        name:String,
        outway:String,
        port_no:Number
    }
});

var model_topo = new mongoose.Schema({
    name: { type: String, required: true, index: { unique: true } },
    link_id:{ type: String },
    ip:{ type: String },
    pty1: { type: String },
    pty2: { type: String },
    vm: {
        type: [model_vm] },//必选么？
    switch:{
        type:{
            mac:String,
            name:String,
            link_id:String,
            int_ports:[String],
            phy_ports:[
                {
                    name:String,
                    re_mac:String,
                    port_no:Number
                }
            ]
        }, required: true
    }
});
//建立db存取方法
module.exports = model_topo;