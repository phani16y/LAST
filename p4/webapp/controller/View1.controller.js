sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,JSONModel,DateFormat,MessageBox,Fragment) {
        "use strict";

        return BaseController.extend("p4.controller.View1", {
            onInit: function () {
            var oViewModel = new JSONModel({
                    busy : false,
                    delay : 0
                });
            //Routing
            // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            debugger;
			this.getRouter().getRoute("RouteView1").attachPatternMatched(this._onRouteMatched, this);
            this.setModel(oViewModel, "View");  
            // debugger;
        //     var oModel = this.getOwnerComponent().getModel();
        //     oModel.read("/EKKOSet('"+Ebeln+"')", {
        //    success: function(oRetrievedResult) { 
        //      debugger;
        //      oView.byId("attribute3").setText(oRetrievedResult.Ekorg);
        //      oView.byId("attribute2").setText(oRetrievedResult.Lifnr);
        //      oView.byId("attribute1").setText(oRetrievedResult.Bukrs);
        //      oView.byId("attribute4").setText(oRetrievedResult.Waers);
        //      oView.byId("title1").setText(oRetrievedResult.Ebeln);
        //         },
        //         error: function(oError) { 
        //             alert("error");
        //          }
        //       });

            },

            _onRouteMatched: function (oEvent) {
			debugger;
            var POID = oEvent.getParameter("arguments").POID;
            if ( POID == undefined )
            {
            //Call Dialog
            if (!this.pDialog) {
				this.pDialog = this.loadFragment({
					name: "p4.view.Dialog" });
			} 
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
            //
             }
             else {
            this.getView().byId("title1").setActive(false);
            this.getView().byId("title2").setActive(false);   
            this.getModel().metadataLoaded().then(function() {
                this._onGetData(POID);
                }.bind(this));
            }
            },
            onPopup :function(){
                debugger;
                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "p4.view.Dialog" });
                } 
                this.pDialog.then(function(oDialog) {
                    oDialog.open();
                });
            },

            onCloseDialog : function () {
                // note: We don't need to chain to the pDialog promise, since this event-handler
                // is only called from within the loaded dialog itself.
                var mpo = this.byId("poInput").getValue();
                debugger;
                if ( mpo !== '' ){
                this.byId("helloDialog").close();
                this.getModel().metadataLoaded().then(function() {
                    this._onGetData(mpo);
                    }.bind(this));
                }
            },

            _onGetData: function(POID){
                debugger;
                // alert(POID);
                var Ogr = this.getOwnerComponent().getModel("GrModel");
                var Oinvoice = this.getOwnerComponent().getModel("InvoiceModel");
                var oJSONModel = new JSONModel();
                var oView = this.getView();
                var oModel1 = this.getOwnerComponent().getModel();
                var oViewModel = this.getModel("View");
                var filter = new sap.ui.model.Filter("Ebeln", "EQ", POID);
                 oViewModel.setProperty("/busy", true);
                oModel1.read("/EKKOSet", {
                      urlParameters: {
                          "$expand": "EKKOTOEKPO"
                      },
                      filters: [filter], 
                  success: function(oResult) { 
                   if ( oResult.results[0] !== undefined ){
                   oView.byId("attribute3").setText(oResult.results[0].Ekorg);
                   oView.byId("attribute2").setText(oResult.results[0].Lifnr);
                   oView.byId("attribute1").setText(oResult.results[0].Bukrs);
                   oView.byId("attribute4").setText(oResult.results[0].Waers);
                   oView.byId("attribute6").setText(oResult.results[0].Ekgrp);
                   oView.byId("attribute8").setText(oResult.results[0].Ernam);
                   const dt = DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy" });    
                   var date = oResult.results[0].Aedat;
                  //  const jsDateObject = dt.parse(date); 
                   const dayMonthYear = dt.format(date);
                   oView.byId("attribute7").setText(dayMonthYear);
                   debugger;
                  // var p = "Purchase Order: ";
                   var p = oResult.results[0].Ebeln;
                  // p += oResult.results[0].Ebeln;
                   oView.byId("title1").setText(p);
                   oView.byId("title2").setText(p);
                   p = "Purchase Order History ";
                   p += oResult.results[0].Ebeln;
                   oView.byId("t1").setText(p);
                   oJSONModel.setData({"Output":oResult.results});
                   var ekkotoekpo = oJSONModel.oData.Output[0].EKKOTOEKPO.results;
                   var gr = [];
                   var inv = [];
                   var i= 0;
                   for ( i = 0;i<ekkotoekpo.length; i++)
                   {
                      const dayMonthYear = dt.format(ekkotoekpo[i].Bldat);
                      ekkotoekpo[i].Bldat = dayMonthYear;
                      const daybudat = dt.format(ekkotoekpo[i].Budat);
                      ekkotoekpo[i].Budat = daybudat;
                    if ( ekkotoekpo[i].Vgabe == '1')
                    {
                      gr.push(ekkotoekpo[i]);
                    }
                     else if ( ekkotoekpo[i].Vgabe == '2')
                    {
                      inv.push(ekkotoekpo[i]);
                    }
                   }
                   Ogr.setData(gr);
                   Oinvoice.setData(inv);
                    debugger;
                     }
                     else if( oResult.results[0] == undefined ){
                       var n = "Click here to Enter Purchase Order";
                       var igr = [];
                       var iinv = [];
                        oView.byId("title1").setText(n);
                        oView.byId("title2").setText(n);  
                        Ogr.setData(igr);
                        Oinvoice.setData(iinv);
                      MessageBox.error("Invalid Purchase Order");
                     }
                     oViewModel.setProperty("/busy", false);
                      },
                      error: function(oError) { 
                        oViewModel.setProperty("/busy", true);
                       }
                    });  
            }
        });
    });
