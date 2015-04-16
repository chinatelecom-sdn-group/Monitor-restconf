/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements the mongoose schema of vSwitch history
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */
var mongoose = require('mongoose');

var model_virtual_switch_record = new mongoose.Schema({
    Name: { type: String, required: true },
    Time:{ type: String, required: true },
    TimeStamp:{ type: Number, required: true },
    Port: { type: [{
        Name:String,
        Txbytes:Number,
        Txdrop:Number,
        Rxbytes:Number,
        Rxdrop:Number,
        RxSpeed:Number,
        TxSpeed:Number
    }]/* required: true*/ }
});

module.exports = model_virtual_switch_record;