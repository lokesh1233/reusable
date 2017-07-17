//MessageHandling  v 0.19  changes for reuse library
jQuery.sap.declare("sap.custom.MessageHandling");
jQuery.sap.require("sap.custom.reuse.MessagePopover");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.custom.UsageDetails");
jQuery.sap.require("sap.m.MessageToast");
sap.custom.MessageHandling = {
	handleRequestSuccess : function(oResponse, msgCodes, fnRefresh) {
		this.MsgAppVar = {};
		this.MsgAppVar.AppCodes = msgCodes;
		this.response = this.detailMessage(oResponse);
		this.refresh = fnRefresh;
		sap.m.MessageBox.show(this.response.Title, {
			title : "Message",
			icon : this.response.icon,
			actions : [ "Close", "Show Details"],
			initialFocus : "Show Details",
			onClose : function(oAction){
				if(oAction === "Show Details"){
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(sap.custom.MessageHandling.response.message);
					if(!sap.custom.MessageHandling.oMessagePopover1){
						var oMessageTemplate = new sap.m.MessagePopoverItem(
								{
									type : "{path:'severity',formatter:'sap.custom.MessageHandling.messageType'}",
									title : "{message}"
								});
						sap.custom.MessageHandling.oMessagePopover1 = new sap.custom.reuse.MessagePopover("msgPopover", {
							items : {
								path : '/',
								template : oMessageTemplate
							},						
							afterClose : function(oEvent){
								if(typeof sap.custom.MessageHandling.refresh === "function"){
									sap.custom.MessageHandling.refresh(sap.custom.MessageHandling.response.message);
								}
							}
						});
					}					
					
					sap.custom.MessageHandling.oMessagePopover1.setModel(oModel);
					sap.custom.MessageHandling.oMessagePopover1.openBy(new sap.m.Button());
				}
				else if(oAction === "Close"){
					if(typeof sap.custom.MessageHandling.refresh === "function"){
						sap.custom.MessageHandling.refresh(sap.custom.MessageHandling.response.message);
					}					
				}
			}
		});		
		
		var sDoc = "";
		for(var p = 0; p < this.response.message.length; p++){
			var aDocNos = /[0-9]+/.exec(this.response.message[p].message);
			if(aDocNos instanceof Array){
				if(aDocNos[0] !== undefined){
					sDoc = (sDoc === "") ? aDocNos[0] : "-" + aDocNos[0];
				}				
			}			
		}
		
		var codes = this.MsgAppVar.AppCodes;
		for(var i = 0; i < codes.length; i++){
			if(this.MsgAppVar.code.indexOf(codes[i].code) > -1){
				for(var j = 0; j < codes[i].gaParams.length; j++){
					var ele = codes[i].gaParams[j];
					sap.custom.UsageDetails.sendData(sDoc, "", ele.param3, ele.param4, ele.param5, ele.path, ele.appDomain);
				}				
			}
		}
	},
	messageType : function(val) {
		if(typeof val === "string"){
			if (val.toUpperCase() === "SUCCESS") {
				return "Success";
			} else if (val.toUpperCase() === "ERROR") {
				return "Error";
			} else if (val.toUpperCase() === "INFO") {
				return "Information";
			} else if (val.toUpperCase() === "WARNING") {
				return "Warning";
			}
		}
		return "Information";
	},
	//JSON validation
	IsJsonString : function(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	},
	jsonParseValidation : function(svl) {

		return this.IsJsonString(svl) == true ? svl : (function() {
			if (svl.length > 0) {
				var encde = encodeURIComponent(svl);
				return decodeURIComponent(encde.replace(
						/%0D|%0C|%08|%09|%0A|%5C%22|%5C/g, ""));
			}
			return false;
		})();
	},
	//remove duplicates
	removeDuplicates : function(msg) {
		var unique = {}, val, mval, newarr = [];
		$.each(msg, function(item) {
			val = this.message;
			mval = val[val.length - 1] === "." ? val.slice(0, -1) : val;
			if (!unique[mval]) {
				newarr.push(this);
				unique[mval] = this;
			}
		});
		return newarr;
	},	
	// transaction validation
	/*transactionVldtion : function() {
		var appC = this.MsgAppVar.AppCodes, j = 0;
		for (var i = 0; i < appC.length; i++) {
			if (this.MsgAppVar.code.indexOf(appC[i].code) > -1) {
				++j;
			}
		}
		return this.MsgAppVar.AppCodes.length === j ? true : false;
	},*/
	
	
	transactionVldtion : function() {
		var appC = this.MsgAppVar.AppCodes, j = 0,code;
		for (var i = 0; i < appC.length; i++) {
			code=this.MsgAppVar.code.indexOf(appC[i].code);
			if ( code > -1) {
				++j;
				this.MsgAppVar.code.splice(code,1);
			} 
		}
		return this.MsgAppVar.AppCodes.length === j ? true : false;
	}, 
	detailMessage : function(oResponse) {
		this.MsgAppVar.code = [];
		var messages = [];
		var bSuccess = false;
		if (oResponse.headers instanceof Array) {
			var sapmsg = oResponse.headers['sap-message'];
			if (sapmsg == undefined) {
				console.log("no sap-message is defined");
				bSuccess = false;
			}
			else {
				var svl = oResponse.headers['sap-message'].toString(), rspnseMsg = this.jsonParseValidation(svl);				
				if (rspnseMsg) {
					var msg = JSON.parse(rspnseMsg);
					this.MsgAppVar.code.push(msg.code);
					messages.push(msg);
					if (msg.details instanceof Array) {
						var msgval = msg.details;
						for (var i = 0; i < msgval.length; i++) {
							this.MsgAppVar.code.push(msgval[i].code);
							messages.push(msgval[i]);
						}
						delete messages[0].details;
					}
					messages = this.removeDuplicates(messages);
					bSuccess = this.transactionVldtion();
				}
			}
		} else {
			bSuccess = false;
		}
		return {
			Title : "Transaction Completed" +  ((bSuccess) ? "" : " With Errors"),
			icon : ((bSuccess) ? sap.m.MessageBox.Icon.SUCCESS : ""), 
			message : messages
		};
	},
	//failure message request
	handleRequestFailure : function(oError, msgCodes, bShowMsgToast, oMsgBoxOpts) {
		var msgs = "", ErrormsgArray = [];
		var err = oError.response;
		if (err !== undefined) {
			var respMsg = this.jsonParseValidation(err.body);
			if (respMsg) {
				var errmsg = JSON.parse(respMsg).error;
				msgs = "";
				var msg = errmsg.message.value;
				msg = msg[msg.length - 1] == "." ? msg.slice(0, -1) : msg;
				ErrormsgArray.push(msg);
				msgs = msg + "\n";
				var innererror = errmsg.innererror.errordetails;
				if (innererror !== undefined) {
					for (var i = 0; i < innererror.length; i++) {
						msg = innererror[i].message;
						msg = msg[msg.length - 1] == "." ? msg.slice(0, -1) : msg;
						if (ErrormsgArray.indexOf(msg) == -1) {
							ErrormsgArray.push(msg);
							msgs += innererror[i].message + "\n";
						}
					}
				}
				if (bShowMsgToast === true) {
					sap.m.MessageToast.show(msgs);
				} 
				else {
					var oOptions = {
							title : "ERROR",
							icon : sap.m.MessageBox.Icon.ERROR,
							actions : [ sap.m.MessageBox.Action.OK ]
					};
					if(typeof oMsgBoxOpts === "object"){
						if(typeof oMsgBoxOpts.title === "string"){
							oOptions.title = oMsgBoxOpts.title;
						}
						if(typeof oMsgBoxOpts.icon === "string"){
							oOptions.icon = oMsgBoxOpts.icon;
						}						
						if(typeof oMsgBoxOpts.onClose === "function"){
							oOptions.onClose = oMsgBoxOpts.onClose;
						}
					}
					sap.m.MessageBox.show(msgs, oOptions);
				}				
			}
		}		
		
		
		if(msgCodes instanceof Array){
			for(var i = 0; i < msgCodes.length; i++){
				for(var j = 0; j < msgCodes[i].gaParams.length; j++){
					var ele = msgCodes[i].gaParams[j];
					sap.custom.UsageDetails.sendData(msgs, "", ele.param3, ele.param4, ele.param5, ele.path, ele.appDomain);				
				}
			}
		}
		return msgs;
	}
};