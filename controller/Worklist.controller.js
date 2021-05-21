var that;
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("LMES.CovidTracker2021.controller.Worklist", {

		formatter: formatter,

		onInit: function () {
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var url = "https://cdn-api.co-vin.in/api/v2/admin/location/states";
			var oUrl = oJsonModel.loadData(url);
			that = this;
			that.oBusy = new sap.m.BusyDialog({
				text: "Please wait while we fetch the list of states"
			});
			that.oBusy.open();			
			oJsonModel.attachRequestCompleted(function (oUrl) {
				var Data = [];
				Data = {
					Table: oJsonModel.oData.states
				};
				var oJsonState = new JSONModel();
				oJsonState.setData(Data);
				that.byId("listIdStateList").setModel(oJsonState, "Data");
				that.oBusy.close();
			});
		},

		onListStateSelect: function (oEvent) {
			// var sPath = oEvent.getParameter("listItem").getBindingContext("Data").sPath;
			var sPath = oEvent.getSource().getBindingContextPath();
			var index = sPath.split("/")[2];
			var stateSelected = this.byId("listIdStateList").getModel("Data").oData.Table[index].state_id;
			this.getRouter().navTo("object", {
				objectId: stateSelected
			});
		},

		onSearch: function (oSearch) {
			var oValue = oSearch.getParameter("newValue");
			var aFilters = [];
			if (oValue) {
				var oFilter = new Filter("state_name", FilterOperator.Contains, oValue);
				aFilters.push(oFilter);
			}
			this.byId("listIdStateList").getBinding("items").filter(aFilters);
		}

	});
});
