sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		doseCheck: function (oNumber) {
			if (oNumber > 0) {
				return "Success";
			} else {
				return "Error";
			}

		},

		vaccineCheck: function (sVaccine) {
			if (sVaccine == "COVISHIELD") {
				return "Information";
			} else if (sVaccine == "COVAXIN") {
				return "Success";
			} else {
				return "Warning";
			}
		},

		RateCheck: function (oCost) {
			if (oCost == "Free") {
				return "Success";
			} else {
				return "Warning";
			}
		},

		ageCheck: function (oAge) {
			if (oAge == "18") {
				return "Success";
			} else {
				return "Information";
			}
		},

		ageAdjust: function (oAdjust) {
			if (oAdjust == "18") {
				return "18-45";
			} else {
				return "45+";
			}
		}

	};

});