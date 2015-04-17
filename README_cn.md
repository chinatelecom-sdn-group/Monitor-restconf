#概述#
Monitor-restconf是一个后台监控程序，通过opendaylight提供的restconf接口，给netopeer-server-sl下发采集指令。netopeer-server-sl采集物理机或虚拟机实时信息后，再通过opendaylight将实时信息数据返回给monitor-restconf。在采集信息入库后，monitor-restconf计算VM的拓扑结构并且入库。

#功能#
*	通过连接SDN Controller(opendaylight),采集数据
*	将采集到的数据整理为实时数据格式和历史数据格式并分别入库

#环境#
mongodb >= 2.6.7

nodejs >= 0.10.29

#安装#
	npm install

#配置#
vi bin/config.js

	var system_cfg = {
	    "opendaylight":{
	        "IP": "172.21.4.101",
	        "Port": "8080",
	        "User": "admin",
	        "Password": "admin"
	    },
	    "mongodb":{
	        "IP": "127.0.0.1",
	        "Port": "27019",
	        "User": "admin",
	        "Password": "admin",
	        "DB": "ServiceControlPlatform"
	    }
	};
	exports.system_cfg = system_cfg;
#运行#
	node bin/Monitor-restconf

#公司#

*	Guangzhou Research Institute of China Telecom 

#作者#

##设计##
* Hong Tang(chinatelecom.sdn.group@gmail.com)
* Liang Ou(chinatelecom.sdn.group@gmail.com)

##实现##
* Qianfeng Chen (chinatelecom.sdn.group@gmail.com)