/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements the operation of mongo database （eg.CRUD）
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */

var mongoose = require('mongoose');

var db_operation = function (Name, Schema,dbConnection) {
    this.attrArray = new Array();
    this.dbConnection = dbConnection;
    this.model = dbConnection.model(Name, Schema, Name);
    for (var attr in Schema.paths) {
        if (attr != "_id" && attr != "__v") {
            this.attrArray.push(attr);
        }
    }
}
module.exports = db_operation;
//查找
db_operation.prototype.getAttrs = function () {
    return this.attrArray;
}

db_operation.prototype.findOne = function (condition, callback) {
    var target = this.model.findOne(condition);
    this.dbConnection.once('error', function(e){
        console.log('server disconnected'+e);
        callback('server disconnected',null);
    });
    //console.log(target);
    target.exec(function(err, docs) {
        if (err) {
            callback(err,null);
        } else {
            callback(null, docs);
        }
    });
    //this.dbConnection.on('connection', console.error.bind(console, 'connection error:'));
};

db_operation.prototype.get = function(condition,callback){
    if(!condition.hasOwnProperty("search")){
        callback("[query error]no param:search", null);
    }else if(!condition.hasOwnProperty("columns")){
        callback("[query error]no param:columns", null);
    }else{
        var q=condition.search;
        var col=condition.columns;
        var query = this.model.find(q, col).sort('-TimeStamp');
        query.exec(function (error, results) {
            if (error!=null) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    }
}

db_operation.prototype.get_last_one = function(condition,callback){
    var q=condition.search;
    var col=condition.columns;
    //var query = this.model.find(q, col).sort({'Time':1}).limit(1);//正序
    var query = this.model.find(q, col).sort({'TimeStamp':-1}).limit(1);//倒序
    query.exec(function (error, results) {
        if (error!=null) {
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
}

db_operation.prototype.save = function (instance, callback) {
    var obj = new this.model(instance);
    //console.log(obj._id);
    obj.save(function (err) {
        callback(err,obj._id);
    });
};

db_operation.prototype.modify = function (id, instance, callback) {
    this.model
        .update({_id: id}, instance, { multi: true}, function (err, numberAffected, raw) {
            if (err) {
                callback(err,id);
            } else {
                callback(null,id);
            }
        });
};

db_operation.prototype.get_last_one_and_save = function(condition,instance,func,callback){
    var operation = this;
    this.get_last_one(condition,function(err,result){
        if(result!=null&&result.length>0){
            //已经存在则更新(取第一个)
            instance = func(result[0],instance);
            operation.save(instance,callback);
        }else{
            //不存在则保存
            operation.save(instance,callback);
        }
    });
}


db_operation.prototype.save_or_modify = function (condition,instance, callback) {
    var operation = this;
    this.get(condition,function(err,result){
        if(result!=null&&result.length>0){
            //已经存在则更新(取第一个)
            operation.modify(result[0]._id,instance,callback);
        }else{
            //不存在则保存
            operation.save(instance,callback);
        }
    });
};


db_operation.prototype.remove = function (id, callback) {
    var array;
    if (id.indexOf(",") > 0) {
        array = id.split(",");
    }
    else {
        array = new Array(id);
    }
    this.model
        .remove({_id: {$in: array}}, function (err, docs) {
            if (err) {
                callback(err, docs);
            } else {
                callback(null, docs);
            }
        });
};

db_operation.prototype.getPagination = function (condition, callback) {
    var q = condition.search;
    var col = condition.columns;

    var pageNumber = condition.page.num || 1;
    var resultsPerPage = condition.page.limit || 10;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;
    var query = this.model.find(q, col).sort('-create_date').skip(skipFrom).limit(resultsPerPage);
    //var query = _Model.find(q,col).sort('-create_date');
    var tmpModel = this.model;
    query.exec(function (error, results) {
        if (error) {
            callback(error, null, null);
        } else {
            tmpModel.count(q, function (error, count) {
                if (error) {
                    callback(error, null, null);
                } else {
                    var pageCount = Math.ceil(count / resultsPerPage);
                    callback(null, pageCount, results);
                }
            });
        }
    });
};