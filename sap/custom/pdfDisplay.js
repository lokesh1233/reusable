sap.custom={};
jQuery.sap.declare("sap.custom.pdfDisplay");
sap.ui.define(['sap/ui/core/Control'], function(C) {
    'use strict';
 return C.extend("sap.custom.pdfDisplay", {
  
  metadata : {
    properties : {
    path: {
    	type: "sap.ui.core.URI",
    	group:"Data",
    	defaultValue:null
    },
    width: {
    	type : "sap.ui.core.CSSSize", 
    	defaultValue : "100%",
    	group:"Dimension"
    },
    height: {
    	type : "sap.ui.core.CSSSize",
    	defaultValue : "100%",
    	group:"Dimension"
    },
    download: {
    	 type: "boolean",
         group: "Appearance",
         defaultValue: true
    },
    content:{
    	type: "string",
    	group:"Data",
    	defaultValue:null
    }
    },
    aggregations : {
        _HTMLContainer: {
        	type : "sap.ui.core.HTML",
        	multiple : false,
        	visibility: "hidden"
        		}
    	}
    },
  
  init:function(){
	this.getnerateId=0;
	this.renderingCompleted=false;
	this._objectRemodeling();
  },
  
  setDownload:function(download){
	  
  },
  
  
  setPath:function(path){
	  this.setProperty("path",path,true);
	  if(this.pdfRendrerError == true){
	  this._objectRemodeling();
	  }else if(this.renderingCompleted){
		  jQuery.sap.byId(this.sId + this.getnerateId +"-object")[0].onload=$.proxy(this._pdfError,this);
		  jQuery.sap.byId(this.sId + this.getnerateId + "-object").attr("data",this.getPath()); 
	  }
  },
  setContent:function(content){
	  this.setProperty("content",content,true);
		if (!window.btoa) {
			var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			var table = tableStr.split("");
			window.btoa = function (bin) {
				for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
					var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
					if ((a | b | c) > 255) throw new Error("String contains an invalid character");
					base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
					(isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
					(isNaN(b + c) ? "=" : table[c & 63]);
				}
				return base64.join("");
			};
		} 
		//script block
		// try this way  to open you pdf file like this in javascript hope it will help you.
		function hexToBase64(str)
		{
			return btoa(String.fromCharCode.apply(null,str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
		}

	  this.setPath('data:application/pdf;base64,' +hexToBase64(content));
	 /* if(this.pdfRendrerError == true){
	  this._objectRemodeling();
	  }else if(this.renderingCompleted){
		  jQuery.sap.byId(this.sId + this.getnerateId +"-object")[0].onload=$.proxy(this._pdfError,this);
		  jQuery.sap.byId(this.sId + this.getnerateId + "-object").attr("data",this.getPath()); 
	  }*/
  },
  
  _objectRemodeling:function(){
		  this.removeAggregation("_HTMLContainer");
		  this.setAggregation("_HTMLContainer", new sap.ui.core.HTML({
				content:"<object id='"+ this.sId + ++this.getnerateId + "-object' width='100%' height='100%' />"
			}));
		  jQuery.sap.byId(this.sId + this.getnerateId + "-object").attr("data",this.getPath());
		  this.getAggregation("_HTMLContainer").addEventDelegate({
			  onAfterRendering:function(){
			  jQuery.sap.byId(this.sId + this.getnerateId +"-object")[0].onload=$.proxy(this._pdfError,this);
			  jQuery.sap.byId(this.sId + this.getnerateId + "-object").attr("data",this.getPath());
			  }
		  },this);
  },
  
  _pdfError:function(error){
	  if(typeof error == "object" && error.currentTarget.offsetHeight == 0 && error.currentTarget.offsetWidth == 0){
		  this.pdfRendrerError=true;
		  sap.m.MessageToast.show("loading pdf is failed");
	  }else if(typeof error == "object"){
		  this.pdfRendrerError=false;
	  }
  },
 
  onAfterRendering : function() {
	  this.renderingCompleted=true;
  },
  
  renderer :  function(oRm, oControl) {
    	  	oRm.write("<div");
    	  	oRm.writeControlData(oControl);
			oRm.addClass("PDFViewer");
			oRm.addStyle("width", oControl.getWidth());
			oRm.addStyle("height", oControl.getHeight());
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_HTMLContainer"));
			oRm.write("</div>");
      }
});
});