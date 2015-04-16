/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements the mongoose schema of vm
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */

var mongoose = require('mongoose');

// 定義model
var model_virtual_machine = new mongoose.Schema({
    Name: { type: String, required: true, index: { unique: true } },
    CPUUsed:{ type: String, required: true },
    MemoryUsed: { type: String, required: true },
    DiskUsed: {type: String, require: true},
    HostId:{ type: String, required: true }
});
//建立db存取方法
module.exports = model_virtual_machine;