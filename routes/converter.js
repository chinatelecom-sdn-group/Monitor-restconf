/*
 * Copyright (c) 2015 GuangZhou Research Institute of China Telecom. and others.  All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */
/**
 * This model implements converting data to model of db
 * <p/>
 *
 * @author Qianfeng chen (chinatelecom.sdn.group@gmail.com)
 * @version 0.1
 *          <p/>
 * @since 2015-03-23
 */

/*
 *@description get local time
 *@ param fmt - time format
 */
exports.get_local_time = function (fmt){
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
 *@description convert time format
 *@param data - datatime
 *@param fmt - time format,eg.yyyy-MM-dd hh:mm:ss
 */
exports.convert_time = function(date,fmt){
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
};

/*
 *@description convert network device data from resource
 *@param node_name - use ip as node name
 *@param resource - the global data that contain host 、vm
 */
exports.convert_netdev =function(node_name,resource){
    //获取网络设备信息
    var net_dev_info = {
        nic:[],
        tap:{}
    };
    for(var index_dev=0; index_dev<resource.NetDevInfo.NetDevInfoDetail.length; index_dev++){
        var dev = resource.NetDevInfo.NetDevInfoDetail[index_dev];
        if(dev.DevName.indexOf("tap")==0){
            net_dev_info.tap[dev.DevName] = dev;
        }else if(dev.DevName.indexOf("dpdk")==0){
            net_dev_info.tap[dev.DevName] = dev;
        }else if(dev.DevName!="lo"&&dev.DevName!="LOCAL"){
            var index_nic = net_dev_info.nic.length;
            net_dev_info.nic[index_nic] = dev;
        }
    }
    return net_dev_info;
};

/*
 *@description convert host data from resource
 *@param name - use ip as node name
 *@param resource - the global data that contain host 、vm
 *@param nic_data - nic data
 *@param local_time - local time
 */
exports.convert_host =function(name,resource,nic_data,local_time){
    var host = {
        config:{
            Name: name,
            Time:convert_time(local_time,"yyyy-MM-dd hh:mm:ss"),
            CPUMhz:"",
            CPUNum:"",
            MemoryTotal:"",
            DiskTotal:"",
            Network:[]
        },
        record:{
            Name: name,
            Time:convert_time(local_time,"yyyy-MM-dd hh:mm:ss"),
            TimeStamp:local_time.getTime(),
            CPUIdleList:[],
            CPUUsed:"",
            MemoryFree:"",
            MemoryTotal:"",
            MemoryUsed: "",
            DiskFree:"",
            DiskTotal:"",
            DiskUsed: "",
            Network:[]
        }
    };
    //calc_cpu
    var cpu_idle = 0;
    var cpu_num = resource.CPUInfo.CPUInfoNode.length;
    host.config.CPUNum = resource.CPUInfo.CPUInfoNode.length;
    host.config.CPUMhz = resource.CPUInfo.CPUMhz;
    for(var index1=0; index1<resource.CPUInfo.CPUInfoNode.length; index1++){
        cpu_idle += resource.CPUInfo.CPUInfoNode[index1].CPUIdlePrecent;
        host.record.CPUIdleList[index1] = resource.CPUInfo.CPUInfoNode[index1].CPUIdlePrecent;
    }
    var cpu_all = 100*cpu_num;
    var CPUUsed = 1-(cpu_idle / cpu_all);
    host.record.CPUUsed = CPUUsed.toFixed(2);//取小数点两位
    //calc_mem
    host.config.MemoryTotal = resource.MemInfo.MemTotal;
    host.record.MemoryFree = resource.MemInfo.MemFree;
    host.record.MemoryTotal = resource.MemInfo.MemTotal;
    var MemoryUsed = 1-(resource.MemInfo.MemFree/resource.MemInfo.MemTotal);
    host.record.MemoryUsed = MemoryUsed.toFixed(2);//取小数点两位
    //calc_disk
    var disk_free_size = 0;
    var disk_total_size = 0;
    for(var index2=0; index2<resource.DiskInfo.Partition.length; index2++){
        disk_free_size += resource.DiskInfo.Partition[index2].Free;
        disk_total_size += resource.DiskInfo.Partition[index2].Total;
    }
    host.config.DiskTotal = disk_total_size;
    host.record.DiskFree = disk_free_size;
    host.record.DiskTotal = disk_total_size;
    var DiskUsed = 1-(disk_free_size/disk_total_size);
    host.record.DiskUsed = DiskUsed.toFixed(2);//取小数点两位
    //calc_network
    for(var index3=0; index3<nic_data.nic.length; index3++){
        host.config.Network[index3] = {
            Name:nic_data.nic[index3].DevName,
            MAC:nic_data.nic[index3].MAC,
            IP:nic_data.nic[index3].IP
        };
        host.record.Network[index3] = {
            Name:nic_data.nic[index3].DevName,
            MAC:nic_data.nic[index3].MAC,
            IP:nic_data.nic[index3].IP,
            Txbytes :nic_data.nic[index3].Txbytes,
            Rxbytes :nic_data.nic[index3].Rxbytes,
            RxSpeed:0,
            TxSpeed:0
        };
    }
    return host;
};

/*
 *@description convert vSwitch data from resource
 *@param host_name - use ip as node name
 *@param resource - the global data that contain host 、vm
 *@param local_time - local time
 */
exports.convert_switch =function(host_name,resource,local_time){
    var switch_data_null = {
        config:null,
        record:null,
        config_tap:null
    };
    if(!resource.hasOwnProperty("OVSInfo")){
        return switch_data_null;
    }
    if(!resource.OVSInfo.hasOwnProperty("OVSBr")){
        return switch_data_null;
    }
    var switch_data = {
        config:{
            Name:"Switch@"+host_name,
            Time:convert_time(local_time,"yyyy-MM-dd hh:mm:ss"),
            Port:[]
        },
        record:{
            Name:"Switch@"+host_name,
            Time:convert_time(local_time,"yyyy-MM-dd hh:mm:ss"),
            TimeStamp:local_time.getTime(),
            Port:[]
        },
        config_tap:{

        }
    };
    //获取端口信息和tap信息
    for(var i=0; i<resource.OVSInfo.OVSBr.length; i++){
        var br = resource.OVSInfo.OVSBr[i];
        for(var j=0; j<br.OVSPortlist.length; j++){
            var port = br.OVSPortlist[j];
            var ovs_port_config = {
                Name:port.PortName,
                Port:port.PortSerailNo,
                Mac:port.MAC,
                BrName:br.BrName
            };
            var ovs_port_record = {
                Name:port.PortName,
                Txbytes:port.Txbytes,
                Txdrop:port.Txdrop,
                Rxbytes:port.Rxbytes,
                Rxdrop:port.Rxdrop,
                RxSpeed:0,
                TxSpeed:0
            };
            var index = switch_data.config.Port.length;
            if(port.PortName.indexOf("qvo")==0
                ||port.PortName.indexOf("int")==0
                ||port.PortName.indexOf("dpdk")==0
                ||port.PortName.indexOf("phy")==0
                ||port.PortName.indexOf("Client")==0
                ||port.PortName.indexOf("Port")==0){
                switch_data.config.Port[index] = ovs_port_config;
                switch_data.record.Port[index] = ovs_port_record;
            }
            if(port.PortName.indexOf("qvo")==0){
                var port_name = port.PortName.substring(3,port.PortName.length);
                switch_data.config_tap["tap"+port_name] = index;//记录索引
            }else if(port.PortName.indexOf("dpdk")==0){
                switch_data.config_tap[port.PortName] = index;//记录索引（针对dpdk的switch）
            }
        }
    }
    return switch_data;
};

/*
 *@description convert vm data from resource
 *@param host_name - use ip as node name
 *@param resource - the global data that contain host 、vm
 */
exports.convert_vm =function(host_name,resource) {
    if(!resource.hasOwnProperty("VMInfo")){
        return null;
    }
    if(!resource.VMInfo.hasOwnProperty("VMInfoDetail")){
        return null;
    }
    var vm_data = [];
    for(var i=0; i<resource.VMInfo.VMInfoDetail.length; i++){
        var vm = resource.VMInfo.VMInfoDetail[i];
        //console.log("vm_instance:"+JSON.stringify(vm));
        if(vm.VMName!=null&&vm.VMName!=""){
            var index = vm_data.length;
            vm_data[index] = vm;
        }
    }
    if(vm_data.length==0){
        return null;
    }
    else{
        return vm_data;
    }
}

/*
 *@description convert vm data from resource
 *@param host_name - use ip as node name
 *@param resource - the global data that contain host 、vm
 */
exports.convert_id_mac =function(result) {
    var id_mac = {};
    for(var i=0; i<result.length; i++){
        //if contain network node
        if(result[i].host_data.hasOwnProperty("Network")){
            for(var j=0; j<result[i].host_data.Network.length; j++){
                var nic = result[i].host_data.Network[j];
                //if contain mac node
                if(nic.hasOwnProperty("MAC")){
                    if(!id_mac.hasOwnProperty(nic.MAC)){
                        //id_mac[nic.MAC] = result[i].host_data.link_id;
                        id_mac[nic.MAC] = {
                            name:result[i].host_data.Name,
                            link_id:result[i].host_data.link_id
                        };
                    }
                }else if(nic.hasOwnProperty("Mac")){
                    if(!id_mac.hasOwnProperty(nic.Mac)){
                        //id_mac[nic.Mac] = result[i].host_data.link_id;
                        id_mac[nic.Mac] = {
                            name:result[i].host_data.Name,
                            link_id:result[i].host_data.link_id
                        };
                    }
                }
            }
        }
    }
    //console.log(JSON.stringify(id_mac));
    return id_mac;
}

/*
 *@description build the data of vm
 *@param vm_instance - the data of collection
 *@param switch_data - the data of switch config
 *@param tap_data - the data of collection
 *@param id_mac - the map of id and mac
 */
function build_vm_data(vm_instance,switch_data,tap_data,id_mac){
    var vm = {
        name:vm_instance.VMName,
        link_id:"",
        type:vm_instance.VMName,
        pty:"",
        ovs_ports:[],
        mgr_port:{
            name:"",
            outway:""
        }
    };
    if(vm_instance.hasOwnProperty("VMNetDevInfo")&&switch_data!=null){
        for(var i=0; i<vm_instance.VMNetDevInfo.length; i++){
            var vm_port = build_vm_port_data(vm_instance.VMNetDevInfo[i],switch_data,tap_data);
            if(vm_port.port_no!=undefined&&vm_port.port_no!=""){
                var index =  vm.ovs_ports.length;
                vm.ovs_ports[index] = vm_port;
            }
            if(vm.link_id==""){
                //console.log(vm_instance.VMNetDevInfo[i].NetDevDeviceMAC);
                if(id_mac.hasOwnProperty(vm_instance.VMNetDevInfo[i].NetDevDeviceMAC)){
                    vm.link_id = id_mac[vm_instance.VMNetDevInfo[i].NetDevDeviceMAC].link_id;
                    vm.name = id_mac[vm_instance.VMNetDevInfo[i].NetDevDeviceMAC].name;
                    vm.type = vm_instance.VMName;
                    //console.log("vm.link_id:"+vm.link_id );
                }
            }
        }
    }
    return vm;
}

/*
 *@description build data of the vm port
 *@param port_info - the data of collection
 *@param switch_data - the data of switch config
 *@param tap_data - the data of collection
 */
function build_vm_port_data(port_info,switch_data,tap_data){
    var port = "";
    var name = "";
    if(tap_data.hasOwnProperty(port_info.NetDevIfname)){
        var port_index = tap_data[port_info.NetDevIfname];
        port = switch_data.Port[port_index].Port;
        name = switch_data.Port[port_index].Name;
    }
    var ovs_port = {
        name:port_info.NetDevID,
        outway:name, //填上名字
        port_no:port
    };
    return ovs_port;
}

/*
 *@description build data of the switch
 *@param switch_data - the data of switch config
 */
function build_switch_data(switch_data){
    if(switch_data==null){
        return null;
    }
    var switch_instance = {
        mac:"00:00:00:00:00:00",
        name:switch_data.Name,
        link_id:switch_data.link_id,
        int_ports:[],
        phy_ports:[],
        port_map:{}
    };
    for(var i=0; i<switch_data.Port.length; i++){
        var port = switch_data.Port[i];
        if(port.Name.indexOf("qvo")==0){
            var index = switch_instance.int_ports.length;
            switch_instance.int_ports[index] = port.Name;
            switch_instance.port_map[port.Name] = port.Port;
        }else if(port.Name.indexOf("int")==0
            ||port.Name.indexOf("phy")==0){
            /*物理端口*/
            var index = switch_instance.phy_ports.length;
            switch_instance.phy_ports[index] = {
                name:port.Name,
                port_no:port.Port,
                re_mac:port.Mac
            };
            switch_instance.port_map[port.Name] = port.Port;
        }
    }
    return switch_instance;
}

/*
 *@description build the data of vm
 *@param node_name - the data of collection
 *@param host_data - the host data
 *@param switch_data - the data of switch config
 *@param vm_data - the data of vm config
 *@param tap_data - the data of collection
 *@param id_mac - the map of id and mac
 */
exports.convert_topo = function(node_name,host_data,switch_data,vm_data,tap_data,id_mac){
    //初始化数据
    var topo_data = {
        name: node_name,
        link_id:host_data.link_id,
        ip:"",
        pty1: "",
        pty2: "",
        vm:[],
        switch:""
    };
    //填写vm的信息
    if(vm_data!=null){
        for(var i=0; i<vm_data.length; i++){
            var vm = build_vm_data(vm_data[i],switch_data,tap_data,id_mac);
            if(vm!=null){
                //console.log("[debug1]"+JSON.stringify(vm));
                var index = topo_data.vm.length;
                topo_data.vm[index] = vm;
            }
        }
    }
    //先写switch信息
    topo_data.switch = build_switch_data(switch_data);
    //console.log("[debug]"+JSON.stringify(topo_data));
    return topo_data;
};