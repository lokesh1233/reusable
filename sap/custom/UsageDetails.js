 jQuery.sap.declare("sap.custom.UsageDetails");
 
 ga=function(path,appDomain){
		/*var exactPath=path;
		var usage=[{
			Hash:location.hash,
			Path:exactPath[0] == "/"?exactPath.slice(1):exactPath,
			Status:""
			}];
		sap.custom.UsageDetails.postDetails("","", "", "", path, appDomain,usage);*/
	};


 
sap.custom.UsageDetails = {
sendData : function(docNo,userId, p3, p4, p5, path, appDomain,button){
	var btnPath=path+"/"+p4+"/"+p3;//buttonText
	var usage=[{
		Hash:location.hash,
		Path:btnPath[0] == "/"?btnPath.slice(1):btnPath,
		Status:docNo+" ("+(new Date().getTime()).toString()+" )"
		}];
	sap.custom.UsageDetails.postDetails(docNo,p3, p4, p5, btnPath, appDomain,usage);
},

postDetails:function(docNo,p3,p4,p5,path,appDomain,usage){
		var data = {};
		if(typeof navigator !== "undefined"){
			if(typeof navigator.language === "string"){
				data.Language = navigator.language;
			}
			if(typeof navigator.platform === "string"){
				data.Platform = navigator.platform;
			}
			if(typeof navigator.userAgent === "string"){
				data.Useragent = navigator.userAgent;
			}
			if(typeof navigator.vendor === "string"){
				data.Vendor = navigator.vendor;
			}
			if(typeof navigator.vendorSub === "string"){
				data.VendorSub = navigator.vendorSub;
			}
		}
		if(typeof screen !== "undefined"){
			if(typeof screen.colorDepth === "number"){
				data.Colordepth = screen.colorDepth.toString();
			}
			if(typeof screen.height === "number"){
				data.Height = screen.height.toString();
			}
			if(typeof screen.orientation !== "undefined"){
				if(typeof screen.orientation.type === "string"){
					data.Orientation = screen.orientation.type;
				}
			}
			if(typeof screen.pixelDepth === "number"){
				data.Pixeldepth = screen.pixelDepth.toString();
			}
			if(typeof screen.width === "number"){
				data.Width = screen.width.toString();
			}
		}
		var session=sessionStorage.getItem("SessionUniqueID");
		if(session!==null)
			{
		data.SAPToken=session;
			}
		
		//data.Hash = location.hash;
		data.Host = location.host;
		data.Hostname = location.hostname;
		data.Href = location.href;
		if(typeof location.origin !== "undefined"){
			data.Origin = location.origin;
		}
		else{
			data.Origin = location.protocol + "//" + location.hostname + ":" + location.port;
		}
		data.Port = location.port;
		data.Protocol = location.protocol;
		
		if(typeof sap !== "undefined" && typeof sap.ui !== "undefined" && typeof sap.ui.Device !== "undefined"){
			var device = sap.ui.Device;
			if(typeof device.os !== "undefined"){
				data.Os = device.os.name + " " + device.os.versionStr;
			}
			data.Zsystem = "";
			if(device.system !== undefined){
				for(var sys in device.system){
					if(device.system[sys]){
						data.Zsystem = sys;
						break;
					}
				}
			}			
		}
		data.OAMUser = sap.ushell != undefined?sap.ushell.Container.getUser().getId():"";
		data.AppDomain = (appDomain === "" || appDomain === undefined) ? "SCM" : appDomain;
		data.USAGETRANNAV=usage;
		if(typeof sap.custom.UsageDetails !== "undefined" && typeof sap.custom.UsageDetails.usageModelData !== "undefined"){
			sap.custom.UsageDetails.usageModelData.create("/UsageDetailsSet", data, {
				async : true,
				success : function(oData, oResponse){
					console.log("Usage Analytics Created Successfully");
				},
				error : function (oError) {
					console.log(JSON.parse(oError.response.body).error.message.value);
		        }
			});
		}		
	}
};



(function(){
	var serviceUrl="/sap/opu/odata/sap/Z_FIORI_ES_USAGE_SRV/";
	var Reuseproxy=window.location.hostname == "localhost"?".."+window.location.pathname+"proxy":"";
	var saml=window.location.hostname == "localhost"?"?saml2=disabled":"";
	var UsageDetails=sap.custom.UsageDetails;
	if(UsageDetails.usageModelData == undefined){
		UsageDetails.usageModelData = new sap.ui.model.odata.ODataModel(Reuseproxy+serviceUrl+saml,{
	    	loadMetadataAsync:true,
	    	json:true,
	    	defaultCountMode:"None"
	    });
	}
		if(sessionStorage.getItem("SessionUniqueID")===null)
			{
		
	var d = new Date().getTime();
	    if(window.performance && typeof window.performance.now === "function"){
	        d += performance.now(); //use high-precision timer if available
	    }
	    var uuidSession = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    sessionStorage.setItem("SessionUniqueID",uuidSession);
			}
	})();