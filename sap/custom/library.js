/**
 * Initialization Code and shared classes of library sap.custom.Library (1.0.0)
 */
jQuery.sap.declare("sap.custom.library");
jQuery.sap.require("sap.ui.core.Core");
/**
 * SCM Fiori reusable library
 *
 * @namespace
 * @name sap.custom
 * @public
 */

// library dependencies
jQuery.sap.require("sap.ui.core.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
	name : "sap.custom",
	dependencies : ["sap.ui.core"],
	types: [],
	interfaces: [],
	controls: [
	           "sap.custom.MessageHandling",
	           "sap.custom.Formatter",
	           "sap.custom.barcodeLogic",
	           "sap.custom.UsageDetails",
	           "sap.custom.Utilities"
	],
	elements: [],
	version: "1.0.0"
});
jQuery.sap.require("sap.custom.UsageDetails");
