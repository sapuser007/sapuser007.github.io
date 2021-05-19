var that;
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"	
], function (BaseController, JSONModel, History, formatter,Filter,FilterOperator) {
	"use strict";

	return BaseController.extend("LMES.CovidTracker2021.controller.Object", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		_onObjectMatched: function (oEvent) {
			var stateSelected = oEvent.getParameter("arguments").objectId;
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var url = "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + stateSelected;
			var oUrl = oJsonModel.loadData(url);
			that = this;
			that.oBusy = new sap.m.BusyDialog({
				text: "Please wait while we fetch the list of districts"
			});
			that.oBusy.open();
			oJsonModel.attachRequestCompleted(function (oUrl) {
				var Data = [];
				Data = {
					Table: oJsonModel.oData.districts
				};
				var oJsonDist = new JSONModel();
				oJsonDist.setData(Data);
				that.byId("listIdDistrictList").setModel(oJsonDist, "DataDistrict");
				that.oBusy.close();
			});
		},

		onListDistrictSelect: function (oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContext("DataDistrict").sPath;
			var index = sPath.split("/")[2];
			var distSelected = this.byId("listIdDistrictList").getModel("DataDistrict").oData.Table[index].district_id;
			var dateSelected = this.byId("DP1").getValue();
			// Date Mandatory Validation 
			if (!dateSelected) {
				this.byId("DP1").setValueState("Error");
				this.byId("DP1").setValueStateText("Kindly select date to proceed further");
				return;
			} else {
				this.byId("DP1").setValueState("None");
			}

			this.getRouter().navTo("slots", {
				distId: distSelected,
				districtName: this.byId("listIdDistrictList").getModel("DataDistrict").oData.Table[index].district_name,
				date: dateSelected
			});
		},

		onSearchDistrict: function (oSearch) {
			var oValue = oSearch.getParameter("newValue");
			var aFilters = [];
			if (oValue) {
				var oFilter = new Filter("district_name", FilterOperator.Contains, oValue);
				aFilters.push(oFilter);
			}
			this.byId("listIdDistrictList").getBinding("items").filter(aFilters);
		}

	});

});