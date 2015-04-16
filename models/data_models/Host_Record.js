/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements the mongoose schema of host history record
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */

var mongoose = require('mongoose');

// 定義model
var model_host = new mongoose.Schema({
    Name: { type: String, required: true },
    Time:{ type: String, required: true },
    TimeStamp:{ type: Number, required: true },
    CPUIdleList:{ type: [Number], required: true },
    CPUUsed:{ type: Number, required: true },
    MemoryFree:{ type: Number, required: true },
    MemoryTotal:{ type: Number, required: true },
    MemoryUsed:{ type: Number, required: true },
    DiskFree:{ type: Number, required: true },
    DiskTotal:{ type: Number, required: true },
    DiskUsed:{ type: Number, required: true },
    Network:{ type: [{
        Name:String,
        MAC:String,
        IP:String,
        Txbytes:Number,
        Rxbytes:Number,
        RxSpeed:Number,
        TxSpeed:Number
    }]/*, required: true */}
});


//建立db存取方法
module.exports = model_host;