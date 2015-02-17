// ==UserScript==
// @id             log-filter@cybot.eu.org
// @name           IITC plugin: log filter
// @category       Misc
// @version        0.0.3
// @namespace      http://cybot.eu.org/ingress/
// @updateURL      http://cybot.eu.org/ingress/log-filter.user.js
// @downloadURL    http://cybot.eu.org/ingress/log-filter.user.js
// @description    Simple log filter
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
window.plugin.logfilter = function() {};

window.plugin.logfilter.filter = ".*";
window.plugin.logfilter.selectedLog = null;
window.plugin.logfilter.neg = false;
window.plugin.logfilter.active = false;

// dialog
window.plugin.logfilter.dialog = function() {
  var html = '<div class="logfilterStyles">'
           + 'Hide all messages from <select id="logfilter_log">'
           + '<option value="all">all</option>'
           + '<option value="faction">faction</option>'
           + '<option value="falerts">alerts</option>'
           + '</select> which <select id="logfilter_match"><option value="true" selected="selected">match</option><option value="false">don\'t match</option></select> this RegExp:<br/>'
           + '<input type="text" id="logfilter" value="' + window.plugin.logfilter.escapeHtml(window.plugin.logfilter.filter) + '" />'
           + '<button onclick="window.plugin.logfilter.updateFilter(); return false;">Apply</button> <button onclick="window.plugin.logfilter.reset(); return false;">Reset</button>'
           + '</div>';

  dialog({
    html: html,
    dialogClass: 'ui-dialog-logfilter',
    title: 'Log Filter'
  });
}

window.plugin.logfilter.entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

window.plugin.logfilter.escapeHtml = function(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return window.plugin.logfilter.entityMap[s];
  });
}

window.plugin.logfilter.updateSelectedLog = function() {
  switch ($('#logfilter_log').val()) {
    case 'all':
      window.plugin.logfilter.selectedLog = $('#chatall');
      break;
    case 'faction':
      window.plugin.logfilter.selectedLog = $('#chatfaction');
      break;
    case 'alerts':
      window.plugin.logfilter.selectedLog = $('#chatalerts');
      break;
  }
}

window.plugin.logfilter.origRender = null;
window.plugin.logfilter.origRenderChat = null;

window.plugin.logfilter.removeHooks = function() {
  if (window.plugin.logfilter.origRender == null)
    return;
  switch (window.plugin.logfilter.origRenderChat) {
    case 'chatall':
      window.chat.renderFull = window.plugin.logfilter.origRender;
      break;
    case 'chatfaction':
      window.chat.renderFaction = window.plugin.logfilter.origRender;
      break;
    case 'chatalerts':
      window.chat.renderAlerts = window.plugin.logfilter.origRender;
      break;
  }
  window.plugin.logfilter.origRender = null;
}

window.plugin.logfilter.updateHooks = function() {
  if (window.plugin.logfilter.selectedLog == null)
    return;
  window.plugin.logfilter.removeHooks();
  window.plugin.logfilter.origRenderChat = window.plugin.logfilter.selectedLog.attr('id');
  switch (window.plugin.logfilter.origRenderChat) {
    case 'chatall':
      window.plugin.logfilter.origRender = window.chat.renderFull;
      window.chat.renderFull = function(p) {
        window.plugin.logfilter.origRender(p);
        window.plugin.logfilter.applyFilter();
      }
      break;
    case 'chatfaction':
      window.plugin.logfilter.origRender = window.chat.renderFaction;
      window.chat.renderFaction = function(p) {
        window.plugin.logfilter.origRender(p);
        window.plugin.logfilter.applyFilter();
      }
      break;
    case 'chatalerts':
      window.plugin.logfilter.origRender = window.chat.renderAlerts;
      window.chat.renderAlerts = function(p) {
        window.plugin.logfilter.origRender(p);
        window.plugin.logfilter.applyFilter();
      }
      break;
  }
}

window.plugin.logfilter.updateFilter = function() {
  window.plugin.logfilter.filter = $('#logfilter').val();
  window.plugin.logfilter.updateSelectedLog();
  window.plugin.logfilter.neg = ($('#logfilter_match').val() == 'false');
  window.plugin.logfilter.active = true;
  window.plugin.logfilter.selectedLog.find('tr').show();
  window.plugin.logfilter.applyFilter();
  window.plugin.logfilter.updateHooks();
}

window.plugin.logfilter.applyFilter = function() {
  if (!window.plugin.logfilter.active)
    return;
  var regex = new RegExp(window.plugin.logfilter.filter);
  window.plugin.logfilter.selectedLog.find('tr').filter(function () {
   var matches = regex.test($(this).text());
   return window.plugin.logfilter.neg ? !matches : matches;
  }).hide();
}

window.plugin.logfilter.reset = function() {
  window.plugin.logfilter.active = false;
  window.plugin.logfilter.updateSelectedLog();
  window.plugin.logfilter.removeHooks();
  window.plugin.logfilter.selectedLog.find('tr').show();
}

window.plugin.logfilter.setup = function() {
  //add options menu
  $('#toolbox').append('<a onclick="window.plugin.logfilter.dialog();return false;">Log Filter</a>');

  $('head').append('<style>' +
        '.drawtoolsSetbox > a { display:block; color:#ffce00; border:1px solid #ffce00; padding:3px 0; margin:10px auto; width:80%; text-align:center; background:rgba(8,48,78,.9); }'+
        '.ui-dialog-drawtoolsSet-copy textarea { width:96%; height:250px; resize:vertical; }'+
        '</style>');
}

var setup =  window.plugin.logfilter.setup;

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

