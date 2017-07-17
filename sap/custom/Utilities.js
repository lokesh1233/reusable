jQuery.sap.declare("sap.custom.Utilities");
sap.custom.Utilities = {	
	currencyDisplayValue : function(val) {
		if (val === undefined || val === "" || isNaN(val)) {
			console.log("Invalid Format");
			return "";
		}
		val = Number(val).toFixed(2);
		var dec = val.substring(val.indexOf("."));
		val = val.substring(0, val.indexOf(".")).toString();
		var lastThree = val.substring(val.length - 3);
		var otherNumbers = val.substring(0, val.length - 3);
		if (otherNumbers != '')
			lastThree = ',' + lastThree;
		val = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + dec;
		return val;
	},
	
	 truncateICCIDNumb: function(val){
		 if(val.length > 18 && val.length <= 20 ){
             return val.slice(val.length-18,val.length);
          }
		 return val;
	 },
	 

		 // date range validation 26-6-2017
	DateRangeValidation : function(valfrm, valTo, range, futureDte) {
		var type = "E", message = "Date formate is not valid", postDate1 = "", postDate2 = "";
		if (Object.prototype.toString.call(valfrm) === "[object Date]"
				&& Object.prototype.toString.call(valTo) === "[object Date]"
				&& !((isNaN(valfrm.getTime()) && isNaN(valTo.getTime())))) {
			var frmDate = valfrm.getTime(), toDate = valTo.getTime(),
			CrntTime = new Date().getTime();
			if (!toDate > frmDate) {
				var date1 = frmDate;
				var date2 = toDate;
				toDate = date1;
				frmDate = date2;
			}
			if (futureDte == false && (CrntTime < frmDate || CrntTime < toDate)) {
				type = "E";
				message = "Future Date should not be Allowed";
			} else if ((toDate - frmDate) / 1000 * 60 * 60 * 24 > range) {
				message = "Select the Date within " + range + " days only ";
				type = "E";
			} else {
				type = "S";
				message = "";
				postDate1 =  sap.ui.core.format.DateFormat.getInstance({
					pattern : "YYYY-MM-ddT00:00:00"
				}).oDateFormat.format(new Date(frmDate));
				postDate2=sap.ui.core.format.DateFormat.getInstance({
					pattern : "YYYY-MM-ddT00:00:00"
				}).oDateFormat.format(new Date(toDate));
			}
			}
		return {
			type : type,
			message : message,
			frmDate : postDate1,
			toDate : postDate2
		}
	},
// Quantity validation.	
	QuantityValidation : function(enterQuantity,orderQuantity,AvailableQuantity,isDecimal){
		var type = "S", message = "";
		var rex =/^[0-9]*$/;
		if(isDecimal){
		 rex =/^\d*(?:\.\d{1,2})?$/;
		}
		if(!rex.test(enterQuantity)){
			type = "E";
			message = "Enter valid quanity";
		}else if(AvailableQuantity && (Number(enterQuantity) > Number(AvailableQuantity))|| (orderQuantity && Number(enterQuantity) > Number(orderQuantity))){
			type="E";
			message = "Quantity is exceeded";
		}
		return {
			type : type,
			message : message
		}
	},
	
	 
	scanOverride : function(){
		$(".sapMInputBaseInner").keydown(function(event) {
			  if ((event.which === 74 || event.keycode === 74 || event.key === "j") && event.ctrlKey === true ) {
			return false;
			  }
			});
	},
	
	keypressRegisterCallback : function(inputId,callback,context,isFrom){
		var that=this;
		inputId.addEventDelegate({onAfterRendering:function(){
			setTimeout(function(){
				that.onSerialKeyPressFrom(inputId,callback,context,isFrom);
			},100);
			}});
		
	
	},
	
	onSerialKeyPressFrom:function(inputId,callback,context,isFrom){
		var that=this;
		
		if(sap.ui.Device.system.phone == true){
			$("#"+inputId.sId).keydown(function(e){
				context.keyPressed=!0;
				if(e.which == 13 &&  inputId.getValue().length>0){
				var	value = inputId.getValue();
					callback(value);
					inputId.setValue("");
					context.keyPressed=!1;
				}
				
			});
			
		}else{
			
	
		
		
	$("#"+inputId.sId).keypress(function(e){
		context.keyPressed=!0;
		if(e.which == 13 &&  inputId.getValue().length>0){
		var	value = inputId.getValue();
			callback(value);
			inputId.setValue("");
			context.keyPressed=!1;
		}
	
	});
		}
		that.scanOverride();
	},
	
	//Round Off Function calculating denomination min and max amount calculation.
	  roundoffFn:function(minLim,maxLim,denomination,value,transferAmt,hisBalance){
	         var change=false,message="",origionVal,negVal;
	         transferAmt=isNaN(transferAmt)?0:transferAmt;
	         hisBalance=Number(hisBalance);
	         maxLim=maxLim-Number(transferAmt);
	         var minLim= minLim-Number(hisBalance);
	         denomination=Number(denomination);
	         value=Number(value);
	         /* if(minLim>value){
	                        origionVal=minLim;
	                        number=origionVal;
	                        change=true;
	                        negVal=origionVal%denomination;
	                        if(negVal>0){
	                               origionVal =minLim+denomination-negVal;
	                        }
	                        message="Minimum  suggested Qty "+origionVal;
	                 }else if((minLim<=value)&& (value<maxLim)){*/
	         if((value>0)&& (value<maxLim)){
	               origionVal=value;
	               negVal=origionVal%denomination;
	               if(negVal>0){
	                      origionVal =origionVal+denomination-negVal;
	                      change=true;
	                      message=" Sale quantity should be in multiples of "+denomination;
	               }
	         }else if(value>=maxLim){
	               origionVal=maxLim;
	               negVal=origionVal%denomination;
	               if(negVal>0){
	                      origionVal =origionVal-negVal;
	               }
	               change=true;
	               message="Sale quantity should not exceed maximum order limit "+maxLim+" for the day";
	         }else{
	               origionVal=value;
	         }
	         return {
	               message:message,
	               value:origionVal,
	               change:change
	         };
	  },

	  
	  
	  
	
	returnSerialNo : function(serStruct) {
		// var serialNo,indicator;
		var serialStructure, serialVal;
		serialStructure = function(srno, ind) {
			return {
				serialNo : srno,
				indicator : ind
			};
		};

		if (serStruct === undefined || serStruct === null || serStruct === "") {
			return serialStructure("", "");
		}
		serStruct = serStruct.replace(/\s+/g, '').toUpperCase();
		
		serialVal = function(serStruct, idStart, idEnd, num) {
			return serStruct.substring(serStruct.indexOf(idStart) + num, serStruct.indexOf(idEnd));
		};

		if (serStruct.indexOf('<PALLET>') !== -1) {
			return serialStructure(serialVal(serStruct, "<PALLET>", "</PALLET>", 8), "PALLET");
		} else if (serStruct.indexOf('<MSN>') !== -1) {
			return serialStructure(serialVal(serStruct, "<MSN>", "</MSN>", 5), "MSN");
		} else if (serStruct.indexOf('<SRNO>') !== -1) {
			return serialStructure(serialVal(serStruct, "<SRNO>", "</SRNO>", 6), "");
		} else if (serStruct.indexOf('<RSN>') !== -1) {
			return serialStructure(serialVal(serStruct, "<RSN>", "</RSN>", 5), "");
		} else if (serStruct.indexOf('<IMEI>') !== -1) {
			serialStructure(serialVal(serStruct, '<IMEI>', '</IMEI>', 6), "");
		} else if (serStruct.indexOf('<IMEI1>') !== -1) {
			serialStructure(serialVal(serStruct, '<IMEI1>', '</IMEI1>', 7), "");
		} else if (serStruct.indexOf('<IMEI2>') !== -1) {
			serialStructure(serialVal(serStruct, '<IMEI2>', '</IMEI2>', 7), "");
		} else if (serStruct.indexOf('<ICCID>') !== -1) {
			return serialStructure(serialVal(serStruct, "<ICCID>", "</ICCID>", 7), "");
		} else if (serStruct.indexOf('<EAN>') !== -1) {
			return serialStructure(serialVal(serStruct, "<EAN>", "</EAN>", 5), "");
		} else {
			return serialStructure(serStruct.trim(), "");
		}
	},
	copyClipboard:function(data,property){
        var value = "";
            for (var i in data) {
                 for ( var x in property) {
                      if(data[i][property[x]]!== undefined && data[i][property[x]] != "0"){
                      value += data[i][property[x]] + " \t ";
                      }else{
                           value += "  \t ";
                      }
                 }
                 value += "\n";
            }
        var target = document.createElement("textarea");
        target.id = "textArea";
        target.textContent = value;
        document.body.appendChild(target);
        target.setSelectionRange(0, target.value.length);
        document.execCommand("copy");
        target.remove();
     },
     
     // mobile Number Validation(vikas)....
     mobNumValidation:function(value,inputId){
    	 if(value && inputId){
    		 var mobRegExp=/(^\d{10}$|^\+91 \d{10}$|^\+91-\d{10}$|^\+91\d{10}$)/;
    		 if(mobRegExp.test(value)){
    			 inputId.setValueState(sap.ui.core.ValueState.None);
    		 }else{
    			 sap.m.MessageToast.show("Enter a valid phone number");	
    		 }	 inputId.setValueState(sap.ui.core.ValueState.Error);

    	 }
     },
     
     // pin code validation(Vikas)....
     PinCodeValidation:function(value,inputId){
    	 if(value && inputId){
    		 var pinCodeRegExp=/^\d{6}$/;
    		 if(pinCodeRegExp.test(value)){
    			 inputId.setValueState(sap.ui.core.ValueState.None);
    		 }else{
    			 sap.m.MessageToast.show("Enter a valid pin number");	
    		 }	 inputId.setValueState(sap.ui.core.ValueState.Error);

    	 } 
     },
     
     // email validation(Vikas)....
   emailValidation:function(value,inputId){
   if(value && inputId){
	   var emailRegExp =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		 if(emailRegExp.test(value)){
			 inputId.setValueState(sap.ui.core.ValueState.None);
		 }else{
			 sap.m.MessageToast.show("Enter a valid email id");	
		 }	 inputId.setValueState(sap.ui.core.ValueState.Error);

	 }  
     },
     // char validation(Vikas)....
     charValidation:function(value,inputId){
    	 if(value && inputId){
    		 value = value.toLowerCase();
    		   var charregExp =/^[a-z]+$/;
    			 if(charregExp.test(value)){
    				 inputId.setValueState(sap.ui.core.ValueState.None);
    			 }else{
    				 sap.m.MessageToast.show("Enter a valid character");	
    			 }	 inputId.setValueState(sap.ui.core.ValueState.Error);

    		 }  
     },
     
  // Live Search method for all fragments(vikas)....
 	selectDialogSearch:function(oEvent){
 		if(oEvent){
 		var inputValue = oEvent.getParameter("value").trim().toUpperCase();
 		var Items = oEvent.getSource().getItems();
 		for (var i = 0; i < Items.length; i++) {
 			var title = Items[i].getTitle().toUpperCase();
 			if (title.indexOf(inputValue) > -1) {
 				Items[i].setVisible(true);
		} else {
 				Items[i].setVisible(false);
 			}
 		}
 		}
 	},
 	
 	masterRefersh:function(eventBus,AppName,EventId,data){
 		if(eventBus && AppName && EventId){
 			if(!data){
 				data = "";	
 			}
 		eventBus.publish(AppName,EventId,data);
 		}
 	},
     
	

};