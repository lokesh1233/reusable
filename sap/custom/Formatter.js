jQuery.sap.declare("sap.custom.Formatter");

sap.custom.Formatter = { 
  appPathUrl : "/sap/bc/ui5_ui5/sap/",
  codeOnServer : function(){
    var regExp = /^localhost$/;//Regular Expression to check host name
    var hostname = window.location.hostname;
    return (!regExp.test(hostname));
  },
  getOrigin : function(){
	if(typeof window.location.origin !== "undefined") {
		return window.location.origin;
	} 
	else if(typeof window.location.protocol !== "undefined" && typeof window.location.hostname !== "undefined" && typeof window.location.port !== "undefined"){
		return window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
	}
	return "";
  },
 
  showLoader : function() { // for opening dialog
	  if (!this.loader) {
		  var xml = "<BusyDialog xmlns='sap.m' />";
		  this.loader = new sap.ui.xmlfragment({
			  fragmentContent : xml
		  }, this);
	  }
	  this.loader.open();
  },
  
  hideLoader : function() { // for closing dialog
	  this.loader.close();
  }
};
