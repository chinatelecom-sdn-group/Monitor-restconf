
#采集数据结构#
##主机配置表：Resource_Host_Config##
	var model_host = new mongoose.Schema({
	    Name: { type: String, required: true, index: { unique: true } },
	    CPUMhz:{ type: Number, required: true },
	    CPUNum:{ type: Number, required: true },
	    MemoryTotal:{ type: Number, required: true },
	    DiskTotal:{ type: Number, required: true },
	    Network:{ type: [{
	        Name:String,
	        MAC:String,
	        IP:String
	    }], required: true }
	});

##主机运行记录表：Resource_Host_Record##
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
	    }], required: true }
	});

##虚拟交换机配置表：Resource_vSwitch_Config##
	var model_virtual_switch_config = new mongoose.Schema({
	    Name: { type: String, required: true, index: { unique: true } },
	    Port: { type: [{
	        Name:String,
	        Port:String,
	        Mac:String,
	        BrName:String
	    }], required: true }
	});

##虚拟交换机运行记录表：Resource_vSwitch_Record##

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
	    }], required: true }
	});

##拓扑记录表：Resource_Topo##
	var model_vm = new mongoose.Schema({
	    name:String,
	    link_id:String,
	    type:String,
	    pty:String,
	    ovs_ports:[{
	        name:String,
	        outway:String
	    }],
	    mgr_port:{
	        name:String,
	        outway:String
	    }
	});

	var model_topo = new mongoose.Schema({
	    name: { type: String, required: true, index: { unique: true } },
	    link_id:{ type: String },
	    ip:{ type: String },
	    pty1: { type: String },
	    pty2: { type: String },
	    vm: {
	        type: [model_vm], required: true },
	    switch:{
	        type:{
	            mac:String,
	            name:String,
	            link_id:String,
	            int_ports:[String],
	            phy_ports:[
	                {
	                    name:String,
	                    re_mac:String
	                }
	            ]
	        }, required: true
	    }
	});