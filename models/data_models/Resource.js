/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements the mongoose schema of resource
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */

var mongoose = require('mongoose');

var model_resource = new mongoose.Schema({
    Name: { type: String, required: true},
    Time:{ type: String, required: true },
    CPUInfo: {
        type: {
            ModelName:String,
            CPUMhz:String,
            CPUPhNum:String,
            CPULoNum:String,
            CpuIdlePrecent:String,
            CPUInfoNode:[{
                CPUNum:String,
                CPUIdlePrecent:String
            }]
        }, required: true},
    MemInfo:{
        type: {
            MemTotal:String,
            MemFree:String,
            HugePagesTotal:String,
            HugePagesFree:String,
            HugePagesRsvd:String,
            HugePagesSurp:String,
            HugePageSize:String
        }, required: true },
    NetDevInfo: {
        type: {
            NetDevInfoDetail:[{
                DevName:String,
                MAC:String,
                IP:String,
                BroadIp:String,
                NetMask:String,
                Txbytes:String,
                Txpackets:String,
                Txdrop:String,
                Rxbytes:String,
                Rxpackets:String,
                Rxdrop:String
            }]
        }, required: true },
    DiskInfo: {
        type: {
            Partition:[{
                Path:String,
                Total:String,
                Free:String
            }]
        }, require: true},
    OVSInfo: {
        type: {
            OVSBr:[{
                BrName:String,
                PortTotalNum:String,
                OVSPortlist:[{
                    PortName:String,
                    PortSerailNo:String,
                    MAC:String,
                    Txbytes:String,
                    Txpackets:String,
                    Txdrop:String,
                    Rxbytes:String,
                    Rxpackets:String,
                    Rxdrop:String
                }]
            }]
        }/*,required: true */ },
    VMInfo: {
        type: {
            VMInfoDetail:[{
                VMName:String,
                VMUUID:String,
                VMVNC:String,
                VMMemInfo:String,
                VMCPUCores:String,
                VMPID:String,
                VMNetDevInfo:[{
                    NetDevIfname:String,
                    NetDevType:String,
                    NetDevID:String,
                    NetDevDeviceType:String,
                    NetDevDeviceMAC:String
                }]
            }]
        } },
    PIDInfo: {
        type: {
            QemuPIDInfo:{
                QemuPIDInfoDetail:[{
                    QemuProgressName:String,
                    LWPInfo:[{
                        PID:String,
                        LWP:String,
                        PSR:String
                    }]
                }]},
            VSwitchdLWPInfo:{
                VSwitchdProgressName:String,
                LWPInfo:[{
                    PID:String,
                    LWP:String,
                    PSR:String
                }]
            },
            OVSDBLWPInfo:{
                OVSDBProgressName:String,
                LWPInfo:[{
                    PID:String,
                    LWP:String,
                    PSR:String
                }]
            }
        }/*,required: true */}
});
//建立db存取方法
module.exports = model_resource;