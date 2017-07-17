//Sandeep updated file on 02.03.2017 for barcode scanning V 1.4// index is added for line item scaning
jQuery.sap.declare("sap.custom.barcodeLogic");

sap.custom.barcodeLogic = {

    // add serrial num public function
    addSerialNum : function(serialnum, result, values, updatetable, addnewMaterial,callbackFn,index) {

      // validating result array
      if(!(result instanceof Array) || result instanceof Array && result.length === 0){
        sap.m.MessageToast.show("Record not found");
        return;
      }

      var resultData,scanProperty;

      // updating properties in the barcode logic
      this.updatingProperties(serialnum, values, updatetable, addnewMaterial,callbackFn,true,index);
      scanProperty = values.scanProperty;

      // iccid validation
      if(scanProperty.indicator!==undefined && (result[0][scanProperty.indicator] === "M" || result[0][scanProperty.indicator] === "V")){
        result=this.validateICCandRCV(result);
      }

      if(scanProperty.indicator!==undefined && (result[0][scanProperty.indicator] === "Z" || result[0][scanProperty.indicator] === "Y")){
        result=this.sericcidvalidation(result);
      }

      // checking with multi material
      this.ismultiMatnr = this.serialWithMultipleMaterial(result, scanProperty);
      this.materilaMessage="";

      // validating serial nums in stored values
      resultData=this.addMaterialValidation(result);

      // validating result data is an array or false result data
      if(!(resultData instanceof Array) || resultData instanceof Array && resultData.length === 0){
        // result data is returned false
        this.afterUpdatingFunction(this.materilaMessage,resultData);
      }else if(this.ismultiMatnr && resultData.length > 1){
        // result data is multi materials
        this.multiMaterilaFrag(resultData, scanProperty);
      }else {// result data is ready to update

        this.updateTableMaterialvalues(resultData);
      }
    },


    sericcidvalidation : function(ser){
      for(var i=0;i<ser.length;i++){
        var serial = ser[i].SerialNum;
        var iccid = ser[i].ICCID;
        ser[i][this.scanProperty.serialNo]=iccid;
        ser[i][this.scanProperty.ICCID]=serial;
      }
      return ser;
    },


    updateTableMaterialvalues:function(resultData){
      var item=this.materialUpdatingValues.ItemNo[0];
      if(this.beforeUpdatingFunction()){
        if(item!==undefined ){
          this.updateSerialNums(this.tableModelData[item],resultData,item);
        }else if (this.addnewMaterial) {
          // adding new material to the table
          this.updateTableMaterials(resultData);
        }else{
          this.afterUpdatingFunction(this.materilaMessage,resultData);
        }
      }
    },

    afterUpdatingFunction:function(message,resultData){
      if(message == ""){
        message="Record not found";
      }

      if(this.callbackFunction!==undefined && typeof this.callbackFunction.afterUpdatingFunction === "function"){
        if(this.callbackFunction.afterUpdatingFunction(this.materialUpdatingValues,resultData)){
          sap.m.MessageToast.show(message);
        };
      }else{
        sap.m.MessageToast.show(message);
      }
    },


    beforeUpdatingFunction:function(){
      return (this.callbackFunction!==undefined && typeof this.callbackFunction.beforeUpdatingFunction === "function" && !this.callbackFunction.beforeUpdatingFunction(this.materialUpdatingValues))?false: true;
    },


    // validating add serial nums and return returns false if serial Num is
    // matching
    eachSerialValidation:function(arr,serialStr){
      var addVAl=this.addVal,lth=serialStr.length,slth=arr.length, i=0,j,serialArr=[],
      struct=this.serialStructureValidate();
      for(;i<lth;i++){
        for(j=0;j<slth;j++){
          if(struct(serialStr[i],arr[j])){
            if(addVAl){
              return false;
            }
            serialArr.push(i);
            break;
          }
        }
      }
      if(!addVAl){
        return serialArr.length>0?serialArr:false;
      }
      return true;
    },


    serialStructureValidate:function(){
      var id=this.serialIdentityProperty;
      var srnr=this.scanProperty.serialNo;
      if(id !== undefined){
        var IMEI1=id.IMEI1,IMEI2=id.IMEI2,ICCID=id.ICCID,MSN=id.MSN,PALLET=id.PALLET,EAN=id.EAN;
        id[srnr]=srnr;
        return  function(result,sr){
          for(var x in id){
            if(result[id[x]] !== "" &&  result[id[x]] !== undefined &&  result[id[x]] !== "0"){
              switch(result[id[x]]){
              case sr[srnr]:
                return true;
              case sr[IMEI1]:
                return true;
              case sr[IMEI2]:
                return true;
              case sr[ICCID]:
                return true;
              case sr[MSN]:
                return true;
              case sr[PALLET]:
                return true;
              case sr[EAN]:
                return true;
              };
            }
          };
          return false;
        };
      }else{
        return  function(result,serial){
          if(result[srnr] == serial[srnr]){
            return true;
          }
          return false;
        };
      };
    },


    addMaterialValidation:function(result){
      var tabData=this.tableModelData;
      this.isMaterialMatched=false;
      if(tabData instanceof Array){
        var matnr=this.scanProperty.materialNo, Tmatnr=this.tableProperty.materialNo,TmatDes=this.tableProperty.materialDesc,
        path=this.tableProperty.serialStruct,epath=this.tableProperty.extraSerialStruct,
        conditionProperty=this.scanProperty.conditionProperty?this.scanProperty.conditionProperty[0]:undefined,
        values=this.materialUpdatingValues,checkQuantity = this.tableProperty.checkQuantity,
        extraCheckQty=this.tableProperty.extraCheckQty,extraOrderQty,serialNo=this.scanProperty.serialNo,
        scannedquantity = this.tableProperty.scannedquantity,reultArr=[],tablemat=[],that=this;
        var materialValidatingFn=function(outputMatnr,idx,selctdata){

          var m = 0,scanningData;
          if(!isNaN(that.selectedTblIndex)){
            m = that.selectedTblIndex;
          }
          scanningData = that.isPallet ? result:[selctdata];
          for(m;m<tabData.length;m++){
            if(outputMatnr === tabData[m][Tmatnr] && (conditionProperty? tabData[m][conditionProperty] == selctdata[conditionProperty]:true)){
              that.isMaterialMatched=true;
              // isSerial=this.eachSerialValidation(result,tabData[m][path]);

              if(that.batchValidation(scanningData,tabData[m])){
                that.materilaMessage="same batch will be allowed for"+tabData[m][TmatDes];
                reultArr.push(idx);
                return false;
              }
              if(!that.eachSerialValidation(scanningData,tabData[m][path]) || (epath!==undefined && !that.eachSerialValidation(scanningData,tabData[m][epath]))){
                that.materilaMessage="Material is already added";
                reultArr.push(idx);
                return false;
              }
              orderQty = tabData[m][checkQuantity];
              scanQty = tabData[m][scannedquantity];
              extraOrderQty=tabData[m][extraCheckQty];

              if((isNaN(orderQty) || (Number(orderQty) >= (Number(scanQty) + scanningData.length))) && (isNaN(extraOrderQty) || (Number(extraOrderQty) >= (Number(scanQty) + scanningData.length)))){
                values.ItemNo.push(m);
                tablemat.push(selctdata);
              }else{
                that.materilaMessage="Quantity exceeded";
              }
              if(!isNaN(that.selectedTblIndex)){
                return true;
              }
            }
            if(!isNaN(that.selectedTblIndex)){
              return false;
            }
          }
          return true;
        };
        if(this.ismultiMatnr){
          var y;
          for(y=0;y<result.length;y++){
        	//  if(tablemat.length==0 || !(result[y][matnr] == tablemat[matnr] && result[y][serialNo]==tablemat[serialNo])){
        		   materialValidatingFn(result[y][matnr],y,result[y]);
        	//  }
          }
          if(this.addnewMaterial == true){
            for (var y = reultArr.length - 1; y >= 0; y--)  {
              result.splice(reultArr[y],1);
            }
          }else{
            return tablemat;
          }
          return result;
        }else{
          return  materialValidatingFn(result[0][matnr],0)?result:false;
        }

      }else{
        return result;
      }
    },


    batchValidation:function(result, data ){
      var Tval=this.tableValidProperty;
      var Sval=this.scanValidProperty;
      if(Tval == undefined){
        return false;
      }
      for(var i in Tval){
        for(var j in Sval){
          if(data[Tval[i]] != result[0][Sval[j]]){
            return true;
          }
        }
      }
      return false;

    },


    checkValidConditons:function(serialStr,validaArr){
      if(JSON.stringify(validaArr) === "{}"){
        return false;
      }
      for(var x in validaArr){
        if(serialStr[x]!==validaArr[x]){
          return false;
        }
      }
      return true;
    },

    addExtraConditons:function(serialStr,validaArr){
      for(var x in validaArr){
        serialStr[x]=validaArr[x];
      }
    },


    // checking the serial num is repeated for multiple materials
    serialWithMultipleMaterial : function(result, scanProperty) {
      var scanSrval = scanProperty.serialNo;
      var materialNo = scanProperty.materialNo;
      var conditionProperty=scanProperty.conditionProperty?scanProperty.conditionProperty[0]:undefined;
      if (result.length > 1 && result[0][scanSrval] === result[1][scanSrval]
      && ((result[0][materialNo] !== result[1][materialNo]) || (result[0][conditionProperty] !== result[1][conditionProperty]))) {
        this.isPallet = false;
        return true;
      } else if (result.length > 1
          && result[0][scanSrval] !== result[1][scanSrval]) {
        this.isPallet = true;
        return false;
      } else {
        this.isPallet = false;
        return false;
      }
    },


    // validate pallet serial nums
    validateMaterialWithQuantity : function(result) {
      var i, orderQty, isMaterialMatched = false;
      var scnMaterial = this.scanProperty.materialNo;
      var tbleMaterial = this.tableProperty.materialNo;
      var checkQuantity = this.tableProperty.checkQuantity;
      var scannedquantity = this.tableProperty.scannedquantity;
      var matData = this.tableModelData;  // this.getTableData(this.updatetable,
      // this.tableProperty);
      if(matData instanceof Array){
        for (i = 0; i < matData.length; i++) {
          if (matData[i][tbleMaterial] === result[0][scnMaterial]) {
            orderQty = matData[i][checkQuantity];
            scanQty = matData[i][scannedquantity];
            isMaterialMatched=true;
            if (isNaN(orderQty) || (Number(orderQty) >= (Number(scanQty) + result.length))) {
              this.updateSerialNums(matData[i],result,i);
              return;
            }
          }
        }
      }

      if(this.addnewMaterial){
        this.updateTableMaterials(result);
      }else if (isMaterialMatched) {
        sap.m.MessageToast.show("picked quantity must not exceed  Ordered quantity");
        return;
        // material is matched and quantity is exceeded
      }
    },


    // update new material in the table
    updateTableMaterials:function(result){
      var resultop=$.extend(true,{},result[0]);
      resultop[this.tableProperty.scannedquantity]=result.length;
      resultop[this.tableProperty.serialStruct]=[].concat(result);
      var model=this.updatetable.getModel();
      this.addExtraConditons(resultop,this.tableExtraProperty);
      if(model.getData()[this.bindingPath] instanceof Array){
        model.getData()[this.bindingPath].push(resultop);
      }else{
        model.getData()[this.bindingPath]=[resultop];
      };
      this.updatetable.getModel().updateBindings();
      this.updateStoredSerialNums(result);
    },
    //RetailerReceipt
    // updating serial nums
    updateSerialNums : function(tableItem,data,i) {
      tableItem[this.tableProperty.serialStruct]=tableItem[this.tableProperty.serialStruct].concat(data);
      var qty=this.tableProperty.scannedquantity;
      var val=tableItem[qty];
      if(val == undefined){
        tableItem[qty]=0;
      }
      tableItem[qty]=Number(tableItem[qty])+data.length;
      this.updatetable.getModel().updateBindings();
      this.updateStoredSerialNums(data);
    },

    // stored values to handel for validation
    updateStoredSerialNums:function(data){
      this.afterUpdatingFunction("Material is added",data);
      //if(data.length>1){
      this.storedValues[this.serialnum]=$.extend(true,[],data);
      //};
    },


    searchDeleteMaterial:function(srValues){
      var tabData=this.tableModelData,data,that=this;
      if(this.isRangeSerialNum == true){
        data=[];
        var sr1=this.rangeSerialNum.serialNum1,sr2=this.rangeSerialNum.serialNum2,srnr=that.scanProperty.serialNo,
        srType;

        /*var incrementNumber=function(val){
        var lastVal=val.substr(val.length-1);
        if(lastVal == "9" ){
          val.substr(0,val.length-1);
        }else{

        }

        return val;
      };*/


        var incrementString = function(string){
          var newString ="",str="",i; for(i =string.length-1;i>=0; i--){
            if(string[i] == 9){
              str += 0;
              if(i!=0){continue;}} if(i == 0){
                newString =1+ str;
              }else{
                newString = Number(string[i])+1;
                newString += str;
              }
              return string.substr(0,i)+newString ;
          } } ;
          var concat="";

          if(isNaN(sr1) || isNaN(sr2)){
            sap.m.MessageToast.show("Range is valid for only numbers");
            return false;
          }

          sr1=sr1.trim();sr2=sr2.trim();
          if(sr1.length == 18 && sr2.length == 18){
            concat=sr1.substr(14);
            sr1=sr1.substr(0,14);
            sr2=sr2.substr(0,14);
          }

          if(sr2-sr1 >1000){
            sap.m.MessageToast.show("maximum range limit reached in RCV");
            return false;
          }


          for(var r=sr1;r<=sr2;){
            srType={};srType[srnr]=r+concat;
            data.push(srType);
            r=incrementString(r);
          }
      }else{
        data=(srValues && srValues.length>0)?srValues:(function(){
          var srType={},srnr=that.scanProperty.serialNo;srType[srnr]=that.serialnum;
          return [srType];
        })();
      }
      if(tabData instanceof Array){
        var path=this.tableProperty.serialStruct,values=this.materialUpdatingValues,
        matnr=this.scanProperty.materialNo, Tmatnr=this.tableProperty.materialNo;
        this.isPallet=data.length>1?true:false;
        var m = 0;
        if(!isNaN(that.selectedTblIndex)){
          m = that.selectedTblIndex;
        }
        for(m;m<tabData.length;m++){
          //  if(!this.isPallet){

          if((!this.isPallet || this.isRangeSerialNum) && tabData[m][path] !== undefined){
            var searchData=this.eachSerialValidation(data,tabData[m][path]);
            searchData instanceof Array?(values.ItemNo.push(m),
                values.SerialNo.push(searchData)):"";
          }else if(data[0][matnr] === tabData[m][Tmatnr]){
            var searchData=this.eachSerialValidation(data,tabData[m][path]);
            if(searchData instanceof Array){
              searchData.length === data.length?(values.ItemNo.push(m),
                  values.SerialNo.push(searchData)):"";
              return;
            }
          }
          if(!isNaN(that.selectedTblIndex)){
            return true;
          }
        }

      }
    },

    deleteSerialNum : function(serialnum, values, updatetable, addnewMaterial,
        callbackFn,index) {
      this.updatingProperties(serialnum, values, updatetable, addnewMaterial,
          callbackFn, false,index);

      if(this.searchDeleteMaterial(this.storedValues[this.serialnum]) == false){
        return;
      }
      // var validation = this.validateDeleteSerialNums();
      var validData=this.materialUpdatingValues;
      if (validData.ItemNo.length === 0) {
        sap.m.MessageToast.show("Record not found");
        return ;
      }else if(validData.ItemNo.length === 1){
        this.updateDeleteSerialNum();
      }else{
        var validation=[];

        //change on 20-10-2016 for deleteing serial num with multiple material
        var item=validData.ItemNo;
        var serial=validData.SerialNo;
        var data=this.tableModelData,serialStruct=this.tableProperty.serialStruct;
        for(var i=0;i<item.length;i++){
          validation.push(data[item[i]][serialStruct][serial[i]]);
        }
        /*  for(var i=0;i<validData.SerialNo.length;i++){
        validation.push(validData.SerialNo[i][0]);
      }*/

        this.multiMaterilaFrag(validation, values.scanProperty);
      }
      // callbackfunction validation
    },

    updateDeleteSerialNum:function(){
      var tableData=this.tableModelData,validData=this.materialUpdatingValues,
      itm=tableData[validData.ItemNo],path=itm[this.tableProperty.serialStruct],
      srArr=validData.SerialNo[0],lth=srArr.length;
      for(var s=lth-1;s>=0;s--){
        path.splice(srArr[s],1);
      }
      var Quantity=this.tableProperty.scannedquantity;
      itm[Quantity]=Number(itm[Quantity])-lth;
      var eQty=this.tableProperty.extraquantity;
      if(this.addnewMaterial === true && itm[Quantity] == "0" && ( eQty===undefined ||  itm[eQty] == "0")){
        this.tableModelData.splice(validData.ItemNo,1);
      }
      this.afterUpdatingFunction(itm[this.tableProperty.materialDesc]+ " Quantity "+ lth +" Deleted");
      this.updatetable.getModel().updateBindings();
    },

    deleteConfirmationMsg:function(){
      if(this.beforeUpdatingFunction()){
        var validData=this.materialUpdatingValues,
        item=this.tableModelData[validData.ItemNo],
        qty=validData.SerialNo[0].length;
        var that=this;
        sap.m.MessageBox.confirm("Product :"  + item[this.tableProperty.materialDesc] + "'s "
            + " quantity : " + qty
            + " will be deleted.",{
          actions: ["DELETE",sap.m.MessageBox.Action.NO],
          onClose: function(oResult){
            if (oResult === "DELETE") {
              that.updateDeleteSerialNum();
            }
          }});
      }
    },


    destroyProperties : function() {
      this.storedValues = {};
    },


    handleSearch : function(oEvt){
      var table = oEvt.oSource._oTable;
      var Val1="",Val2="",Val3="";
      var sValue = oEvt.mParameters.value.toLowerCase();
      var getItems = table.getItems();
      var srno= this.scanProperty.serialNo;
      var matno=this.scanProperty.materialNo;
      var matDec=this.scanProperty.materialDesc;
      for (var i = 0; i < getItems.length; i++) {
        var sPath = getItems[i].getBindingContext().sPath;
        var sData =getItems[i].getBindingContext().getModel().getProperty(sPath);
        Val1 = sData[srno].toLowerCase();
        Val2 = sData[matno].toLowerCase();
        Val3 = sData[matDec].toLowerCase();
        if (Val1.indexOf(sValue) > -1 || Val2.indexOf(sValue) > -1 || Val3.indexOf(sValue) > -1 ){
          getItems[i].setVisible(true);
        } else {
          getItems[i].setVisible(false);
        }
      }


    },
    handleConfirm : function(evt) {
      var arr=[];
      arr.push(evt.mParameters.selectedContexts[0].getObject());
      if(this.addVal){
        this.validateMaterialWithQuantity(arr);
      }else{
        var itemno=this.tableDialog.indexOfItem(evt.mParameters.selectedItem);
        var item=this.materialUpdatingValues.ItemNo[itemno];
        var serial=this.materialUpdatingValues.SerialNo[itemno];
        this.materialUpdatingValues={
            ItemNo:[item],
            SerialNo:[serial]
        };
        this.updateDeleteSerialNum();
      }
    },

    handleClose  : function() {
      debugger;
    },


    // multi material with fragment
    multiMaterilaFrag : function(result,scanProperty) {

    //  if (!this.tableDialog) {
        var xml = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><TableSelectDialog noDataText="No Materials Found" title="Select Material" search="handleSearch" confirm="handleConfirm" close="handleClose"><columns><Column><header>'
       + 	'<Text text="Materal" /></header></Column><Column minScreenWidth="Tablet" demandPopin="true"><header><Text text="UoM" /></header></Column><Column minScreenWidth="Tablet" demandPopin="true" ><header><Text text="Serial No."'
+'/></header></Column></columns></TableSelectDialog></core:FragmentDefinition>';
        this.tableDialog =new sap.ui.xmlfragment({fragmentContent:xml}, this);
        this.tableDialog.setModel(new sap.ui.model.json.JSONModel([]));
    //  }
      var matner="{"+scanProperty.materialNo+"}",
      serialNo="{"+scanProperty.serialNo+"}",
      materialDesc="{"+scanProperty.materialDesc+"}",
      UoM="{"+scanProperty.UoM+"}";
      var extraCols=scanProperty.addMultiFrag;
      var template=new sap.m.ColumnListItem({
        cells : [ new sap.m.ObjectIdentifier({
          title : materialDesc,
          text : matner
        }), new sap.m.Text({
          text : UoM,
        }), new sap.m.Text({
          text : serialNo,
        }) ]
      });
      if(extraCols instanceof Object){
        for(var i in extraCols){
          this.tableDialog.addColumn(new sap.m.Column({
               header: new sap.m.Text({text:i}),
          }));
        template.addCell(new sap.m.Text({
          text:"{"+extraCols[i]+"}"
        }));

      }}

      this.tableDialog.bindItems("/",template );
      this.tableDialog.getModel().setData(result);
      this.tableDialog.open();
    },

    // getting table Data
    getTableData : function() {
      var tableData = this.updatetable.getModel().getData();
      if (this.bindingPath !== "") {
        this.tableMaterialData = tableData[this.bindingPath];
      } else {
        this.tableMaterialData = tableData;
      };
      return this.tableMaterialData;
    },

    storedValues : { },

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


    updatingProperties : function(serialnum, values, updatetable, addnewMaterial,callbackFn,val,index){
      //validating for range serial num
      var number;
      if(typeof serialnum == "object"){
        number = serialnum.serialNum1 +""+serialnum.serialNum2;
        this.isRangeSerialNum=true;
      }else{
        number=serialnum;
        this.isRangeSerialNum=false;
      }
      this.rangeSerialNum=serialnum;
      this.scanProperty = values.scanProperty;
      this.tableProperty = values.tableProperty;
      this.tableValidProperty=this.tableProperty.validateProperty;
      this.tableExtraProperty=this.tableProperty.extraProperty;
      this.scanValidProperty=this.scanProperty.validateProperty;
      this.scanExtraProperty=this.scanProperty.extraProperty;
      this.serialnum = number;
      this.updatetable = updatetable;
      this.addnewMaterial = addnewMaterial;
      this.serialIdentityProperty=this.scanProperty.serialIdentityProperty;
      var path=updatetable.mBindingInfos["items"].path;
      this.bindingPath=path.substr(1,path.length);
      this.callbackFunction=callbackFn;
      this.addVal=val;
      this.materialUpdatingValues={
          ItemNo:[],
          SerialNo:[]
      };
      this.selectedTblIndex = index;
      this.tableModelData=this.tableProperty.tableData == undefined ?this.getTableData():this.tableProperty.tableData;
    },



    validateICCandRCV : function(ser) {
      var iccidvalus=[],newArr=[];
      var scanSrval = this.scanProperty.serialNo;
      var matnr=this.scanProperty.materialNo;
      for (var i=ser.length-1; i>=0; i--) {
        if (iccidvalus[ser[i][scanSrval]+ser[i][matnr]]==undefined) {
          iccidvalus[ser[i][scanSrval]+ser[i][matnr]]=ser[i];
          ser[i].iccIdArr=[];
          newArr.push(ser[i]);
        } else {
          iccidvalus[ser[i][scanSrval]+ser[i][matnr]].iccIdArr.push(ser[i]);
        }
      }
      return newArr;
    }

};