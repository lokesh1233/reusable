sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	//"use strict";
 
	return Object.extend("sap.custom.ReuseSeialDlg", {
 
		_getDialog : function (oView) {
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog =new sap.ui.xmlfragment("sap.custom.Serialdisplay", this);
				// connect dialog to view (models, lifecycle)
				this._oDialog.setModel(new sap.ui.model.json.JSONModel());
				oView.addDependent(this._oDialog);
			}
			return this._oDialog;
		},
 /*
		deleteSerialNum:function(delevt){
			
			var delsrc=delevt.oSource;
			var item=delevt.getParameter("listItem");
			var index=delsrc.indexOfItem(item);
			if(index == -1){
				return;
			}
			delsrc.getModel().getData().splice(index,1);
			delsrc.getModel().updateBindings();
			var data=Dashboard.util.SelectedDelItem;
			var contextData=data.tabData;
			var qty=contextData.getObject().DisptchQty-1;
			contextData.getModel().setProperty("DisptchQty",qty,contextData);
			if(data.screen== "X"){
				data.callbackFn();	
			}else if(data.screen== "Z"){
				if(qty == 0){
					data.table.getModel().getData().splice(data.tabIdx,1);
					data.table.getModel().updateBindings();
					}
				data.callbackFn();
			}
		},*/
		
		
		open : function (oView,result,scanInd,scanProperty) {
			this.scanproprtyvalue=scanProperty;
			var dialog= this._getDialog(oView);
			sap.ui.getCore().byId("srchSralId").setValue("");
			var imei=true,iccid=false,msn=true;
			this.tableDialog =sap.ui.getCore().byId("serialTabid");
			sap.ui.getCore().byId("txtserialid").setText("Serial Number");
			sap.ui.getCore().byId("txticcid").setText("ICCID");
			if(scanInd=="Y" || scanInd=="Z"){
				sap.ui.getCore().byId("txticcid").setText("ICCID");
				sap.ui.getCore().byId("txtserialid").setText("Serial Number");
				imei=false;
				iccid=true;
			}else if(scanInd=="M" || scanInd=="V"){
				imei=false;
				iccid=true;
			}
			
			iccid=scanProperty.ICICID== undefined? false:iccid;
			imei=scanProperty.IMEI1== undefined? false:imei;
			msn=scanProperty.MSN== undefined? false:msn;
			
			sap.ui.getCore().byId("imeiId1").setVisible(imei);
			sap.ui.getCore().byId("imeiId2").setVisible(imei);
			sap.ui.getCore().byId("iccid1").setVisible(iccid);
			sap.ui.getCore().byId("msnid").setVisible(msn);
			
				var serialNo="{"+scanProperty.serialNo+"}",
				ICICID="{"+scanProperty.ICICID+"}",
				IMEI1="{"+scanProperty.IMEI1+"}",
				IMEI2="{"+scanProperty.IMEI2+"}";
				MSN="{"+scanProperty.MSN+"}";
				this.tableDialog.bindItems("/", new sap.m.ColumnListItem({
						cells : [ new sap.m.ObjectIdentifier({
							//title : materialDesc,
							text : serialNo
						}), new sap.m.Text({
							text : ICICID,
						}), new sap.m.Text({
							text : IMEI1,
						}),
						new sap.m.Text({
							text : IMEI2,
						}),new sap.m.Text({
							text : MSN,
						})]
					}));
				this.tableDialog.getModel().setData(result);
				dialog.open();
			/*setTimeout(function(){
				dialog.open();
			},100);*/
			return this._oDialog;
		},
 
		onCloseDialog : function () {
		//	var SerialTab=sap.ui.getCore().byId("serialTabid");
			//var that=this;
			//SerialTab.detachEvent("delete");
			this._getDialog().close();
			/*if (this._oDialog!= undefined) {
				this._oDialog.destroy();
				this._oDialog=undefined;
			}*/
		},
		sreialNumSearch : function(oEvent){
			debugger;
			   var table = sap.ui.getCore().byId("serialTabid");
		        var sValue = oEvent.oSource.getValue();
		        var aFilters = [];
				for(var i in this.scanproprtyvalue){
					aFilters.push(new sap.ui.model.Filter(this.scanproprtyvalue[i],sap.ui.model.FilterOperator.Contains, sValue));
				}
					
				table.getBinding("items").filter( sValue=="" ? [] : [new sap.ui.model.Filter(aFilters, false)]);
			//	oEvent.oSource.setValue("");
		},
		
	});
 
});