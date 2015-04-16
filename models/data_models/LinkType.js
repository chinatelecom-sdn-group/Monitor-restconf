/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements the mongoose schema of LinkType
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */
var mongoose = require('mongoose');

// 定義model
var model_link_type = new mongoose.Schema({
    Name: { type: String, required: true, index: { unique: true } },
    PolicyListNum:{ type: String, required: true },
    PolicyList: { type: [{ _id: String, Name: String }], required: true },
    Description: {type: String, require: true}
});
//建立db存取方法
module.exports = model_link_type;