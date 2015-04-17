#Overview#
Monitor-restconf is a background monitor program which communicates with netopeer-server-sl to obtain real-time information of physics servers and virtual machines through restconf API provided by OpenDaylight.  Next, monitor-restconf put the information into mongodb database.  After that, monitor calculates topology structure of virtual machine and put it into database.

#Function#
* Collect data by connecting to the SDN Controller(OpenDaylight)
* Divide the collected data into real-time format and historical format, put them in database respectively.

#Environment#
mongodb >= 2.6.7

nodejs >= 0.10.29

#Installation#
	npm install

#Configuration#
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

#Run#
	node bin/Monitor-restconf

#Corporation#
* Guangzhou Research Institute of China Telecom 

#Author#

##Algorithm design##
* Hong Tang(chinatelecom.sdn.group@gmail.com)
* Liang Ou(chinatelecom.sdn.group@gmail.com)
*
##Coding##
* Qianfeng Chen (chinatelecom.sdn.group@gmail.com)