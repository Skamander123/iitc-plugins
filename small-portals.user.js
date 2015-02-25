// ==UserScript==
// @id             iitc-plugin-highlight-small-portals@dilbertus
// @name           RESWUE: decrease portal size
// @category       Highlighter
// @version        0.0.7
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://www.resistance-mainfranken.de/iitc/small-portals.meta.js
// @downloadURL    https://www.resistance-mainfranken.de/iitc/small-portals.user.js
// @description    Show all portals with smaller size
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.portalHighlighterShowSmallPortals = function() {};

window.plugin.portalHighlighterShowSmallPortals.highlight = function(data) {
  var params = { radius: 3+(L.Browser.mobile ? PORTAL_RADIUS_ENLARGE_MOBILE : 0), weight: 2};
  data.portal.setStyle(params);
}

var setup =  function() {
  window.addPortalHighlighter('Show small Portals', window.plugin.portalHighlighterShowSmallPortals.highlight);
}

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);



