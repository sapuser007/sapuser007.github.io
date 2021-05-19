var that;
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	'sap/m/library',
	"sap/m/MessageBox",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, History, formatter, mobileLibrary, MessageBox, Sorter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("LMES.CovidTracker2021.controller.Slots", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("slots").attachPatternMatched(this._onObjectMatched, this);
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("LMES.CovidTracker2021.Dialog.Dialog", this);
			}
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("object", {
					objectId: "test"
				}, true);
			}
		},

		_onObjectMatched: function (oEvent) {
			var distSelected = oEvent.getParameter("arguments").distId;
			this.districtName = oEvent.getParameter("arguments").districtName;
			var date = oEvent.getParameter("arguments").date;
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + distSelected +
				"&date=" + date + "";
			var oUrl = oJsonModel.loadData(url);
			that = this;
			that.oBusy = new sap.m.BusyDialog({
				text: "Fetching the slots"
			});
			that.oBusy.open();
			oJsonModel.attachRequestCompleted(function (oUrl) {
				var Data = [];
				Data = {
					Table: oJsonModel.oData.centers
				};
				this.oJsonSlots = new JSONModel();
				this.oJsonSlots.setData(Data);
				sap.ui.getCore().setModel(this.oJsonSlots); //For the Dialog
				that.byId("tabSlots").setModel(this.oJsonSlots, "DataSlots");
				that.byId("slotsPage").setTitle("Please choose your nearest centre in " + that.districtName + " district");
				if (Data.Table.length === 0) {
					MessageBox.show("Apologies!No Slot Available", {
						icon: "ERROR",
						title: "No Slots",
						actions: MessageBox.Action.OK,
						emphasizedAction: MessageBox.Action.OK,
						onClose: function (sAction) {
							that.oBusy.close();
							that.onNavBack();
						}
					});
				}
				that.oBusy.close();
			});

			// Start of Table Sort, Filter Function
			// this.oTable = that.byId("tabSlots");
			// if (!this._oResponsivePopover) {
			// 	this._oResponsivePopover = sap.ui.xmlfragment("LMES.CovidTracker2021.Dialog.Dynamic", this);
			// 	this._oResponsivePopover.setModel(that.getView().getModel());
			// }
			// that = this;
			// debugger;
			// that.oTable.addEventDelegate({
			// 	onAfterRendering: function () {
			// 		var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
			// 		// for (var i = 0; i < oHeader.length; i++) {
			// 		for (var i = 0; i < 2; i++) {
			// 			var oID = oHeader[i].id;
			// 			var history = History.getInstance().getPreviousHash();
			// 			if (!history) {
			// 				that.onClick(oID);
			// 			}
			// 		}
			// 	}
			// }, that.oTable);
			// End of Table Sort,Filter Function				
		},

		//////////////////////
		onClick: function (oID) {
			that = this;
			$('#' + oID).click(function (oEvent) { //Attach Table Header Element Event
				var oTarget = oEvent.currentTarget; //Get hold of Header Element
				var oIndex = oTarget.cellIndex;
				var oView = that.getView();

				var Data = [];
				Data = sap.ui.getCore().getModel().oData;
				var oModel = Data.Table; //Get Hold of Table Model Values

				var oKeys = Object.keys(oModel[0]); //Get Hold of Model Keys to filter the value
				oView.getModel().setProperty("/bindingValue", oKeys[oIndex]); //Save the key value to property
				that._oResponsivePopover.openBy(oTarget);
				that.colIndex = oIndex;

				if (that.colIndex === 1) {
					that.sortCol = "name";
				} else if (that.colIndex === 2) {
					that.sortCol = "block_name";
				}
				//  else if (that.colIndex === 3) {
				// 	that.sortCol = "available_capacity_dose1";
				// } 
				// else if (that.colIndex === 4) {
				// 	that.sortCol = "available_capacity_dose2";
				// } else if (that.colIndex === 5) {
				// 	that.sortCol = "date";
				// } else if (that.colIndex === 6) {
				// 	that.sortCol = "min_age_limit";
				// } else if (that.colIndex === 7) {
				// 	that.sortCol = "vaccine";
				// } else if (that.colIndex === 8) {
				// 	that.sortCol = "fee_type";
				// }

			});
		},

		onAscending: function (oAsc) {
			var oItems = this.byId("tabSlots").getBinding("items");
			var oSorter = new Sorter(that.sortCol);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onDescending: function () {
			var oItems = this.byId("tabSlots").getBinding("items");
			var oSorter = new Sorter(that.sortCol, true);
			oItems.sort(oSorter);
			this._oResponsivePopover.close();
		},

		onChange: function (oEvent) {
			var oValue = oEvent.getParameter("value");
			var oMultipleValues = oValue.split(",");
			var aFilters = [];
			for (var i = 0; i < oMultipleValues.length; i++) {

				if (that.sortCol === "available_capacity_dose1") {
					var oFilter = new Filter("sessions/0/available_capacity_dose1", FilterOperator.EQ, oMultipleValues[i]);
				} else {
					var oFilter = new Filter(that.sortCol, FilterOperator.Contains, oMultipleValues[i]);
				}
				// this.test = "sessions/0/available_capacity_dose1"

				aFilters.push(oFilter);
			}
			var oItems = this.byId("tabSlots").getBinding("items");
			oItems.filter(aFilters, "Application");
			this._oResponsivePopover.close();
		},
		///////////////////

		onGetAddress: function (oAddress) {
			var path = oAddress.getSource().getParent().getBindingContextPath();
			var index = path.split('/')[2];
			var oJsonAddModel = new JSONModel();
			oJsonAddModel.setData(sap.ui.getCore().getModel().oData.Table[index]);
			sap.ui.getCore().byId("idSimpleForm").setModel(oJsonAddModel, "AddressData");
			if (this.oDialog) {
				this.oDialog.open();
			}
		},

		onFilterCentre: function (oCentre) {
			var oValue = oCentre.getParameter("newValue");
			var aFilters = [];
			if (oValue) {
				var oFilter = new Filter("name", FilterOperator.Contains, oValue);
				aFilters.push(oFilter);
			}
			this.byId("tabSlots").getBinding("items").filter(aFilters);
		},

		onFilterArea: function (oArea) {
			var oValue = oArea.getParameter("newValue");
			var aFilters = [];
			if (oValue) {
				var oFilter = new Filter("block_name", FilterOperator.Contains, oValue);
				aFilters.push(oFilter);
			}
			this.byId("tabSlots").getBinding("items").filter(aFilters);
		},

		fragClose: function () {
			if (this.oDialog) {
				this.oDialog.close();
			}
		},

		bookAppointment: function (oBook) {
			var URLHelper = mobileLibrary.URLHelper;
			URLHelper.redirect("https://selfregistration.cowin.gov.in/", true);
		},

		onGetSlots: function (oSlots) {
			debugger;
			if (!this.oDialog2) {
				this.oDialog2 = sap.ui.xmlfragment("LMES.CovidTracker2021.Dialog.Dynamic", this);
			}
			var path = oSlots.getSource().getParent().getBindingContextPath();
			var index = path.split('/')[2];
			var oJsonSlotsModel = new JSONModel();
			oJsonSlotsModel.setData(sap.ui.getCore().getModel().oData.Table[index]);
			sap.ui.getCore().byId("slotList").setModel(oJsonSlotsModel, "slotsData");
			sap.ui.getCore().byId("idDialog").setTitle("Next Slot details for centre " + sap.ui.getCore().getModel().oData.Table[index].name);
			this.oDialog2.open();
		},

		fragSlotClose: function () {
			if (this.oDialog2) {
				this.oDialog2.close();
			}
		}
	});

});