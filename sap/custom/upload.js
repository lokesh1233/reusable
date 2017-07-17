jQuery.sap.declare("sap.custom.upload");
sap.custom.upload = {
              file : function(path,file,slug,type,fileMb,succesFunction,errorFunction){
            	   var that = this;
          try {
            if (file) {
            	var validate =this._fileValidation(file, type, fileMb);
            	if(validate != true){
            		typeof errorFunction == 'function'?errorFunction({message:validate,type:"ERROR"}):"";
            		return;
            	}
                var f = {
                    headers : {
                      "X-Requested-With" : "XMLHttpRequest",
                      "Content-Type" : "application/atom+xml",
                      DataServiceVersion : "2.0",
                      "X-CSRF-Token" : "Fetch"
                    },
                    requestUri : path,
                    method : "GET"
                };
                var oHeaders;
                OData.request(f, function(data, oSuccess) {
                  this.oToken = oSuccess.headers['x-csrf-token'];
                  oHeaders = {
                      "x-csrf-token" : this.oToken,
                      "slug" : slug
                  };
                  jQuery.ajax({
                    type: 'POST',
                    url: path,
                    headers: oHeaders,
                    cache: false,
                    contentType: file.type,
                    processData: false,
                    data: file,
                    dataType:"json",
                    success: function(data,msg,response){
                    	typeof succesFunction == 'function'?succesFunction(data,response):"";
                    },
                    error:function(data){
                    	that.errorValidation(error);
                    }
                  });
                },function(error){
                	  that.errorValidation(error);
                });
              }else {
            	  that.errorValidation('upload file');
            }
          } catch(oException) {
        	  that.errorValidation(oException.message);
          }
        },
        
        _errorValidation:function(errorFunction,message){
        	typeof errorFunction == 'function'?errorFunction(message):"";
        },
        
        _fileValidation:function(file,type,fileMb){
        	var fileType=file.type,fileTypeS=!0;
        	for(var i in type){
        		if(type[i] == fileType){
        			fileTypeS=!1;
        			break;
        			};
        	}
        	if(type.length>0 && !fileTypeS){
        	        	return " Upload File of Proper Format";
        	 }
        	 if(typeof fileMb == 'string' && fileMb.length>0 && file.size > fileMb){
      	        	return  "File Size should be <  "+fileMb + " bytes";
      	          }
        	 return !0;
        }
};
