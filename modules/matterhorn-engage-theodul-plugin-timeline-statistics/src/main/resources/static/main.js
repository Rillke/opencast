/**
 *  Copyright 2009-2011 The Regents of the University of California
 *  Licensed under the Educational Community License, Version 2.0
 *  (the "License"); you may not use this file except in compliance
 *  with the License. You may obtain a copy of the License at
 *
 *  http://www.osedu.org/licenses/ECL-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an "AS IS"
 *  BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 *  or implied. See the License for the specific language governing
 *  permissions and limitations under the License.
 *
 */
/*jslint browser: true, nomen: true*/
/*global define*/
define(['require', 'jquery', 'underscore', 'backbone', 'engage/engage_core'], function (require, $, _, Backbone, Engage) {
	var PLUGIN_NAME = "Timeline Usertracking Statistics";
	var PLUGIN_TYPE = "engage_timeline";
	var PLUGIN_VERSION = "0.1";
	var PLUGIN_TEMPLATE = "template.html";
	var PLUGIN_STYLES = ["style.css", "lib/jquery.jqplot.css"];
  var plugin = {
      name: PLUGIN_NAME,
      type: PLUGIN_TYPE,
      version: PLUGIN_VERSION,
      styles: PLUGIN_STYLES,
      template: PLUGIN_TEMPLATE
  };
  
  var initCount = 6; //wait for 4 inits, plugin load done, mediapackage, 2 highchart libs
  
  var StatisticsTimelineView = Backbone.View.extend({
    initialize: function() {
        this.setElement($(plugin.container)); // Every plugin view has it's own container associated with it
        this.videoData = Engage.model.get("videoDataModel");
        this.footprints = Engage.model.get("footprints");
        this.template = plugin.template;
        //bound the render function always to the view
        _.bindAll(this, "render");
        //listen for changes of the model and bind the render function to this
        this.videoData.bind("change", this.render);
        this.footprints.bind("change", this.render);
        this.render();
    },
    render: function() {
        //format values
        var tempVars = {
            width: "1329",
            height: "70"
        };
        // compile template and load into the html
        this.$el.html(_.template(this.template, tempVars));
        
        var duration = this.videoData.get("duration");
        
        //fill array 
        var data = new Array();
        var cView = 0;
        for(i=0;i<duration/1000;i++){
          _.each(this.footprints, function(element, index, list){
            if(this.footprints.at(index).get("position") == i)
              cView = this.footprints.at(index).get("views");
          }, this);
          data.push([i,cView]);
        }
        var data2 = [];
        for(var i=0; i<10000; i++){
          data2[i] = [i,123];
        }
        //init jqcharts with options to the div container
        $.jqplot('engage_timeline_statistics_chart', [ data2 ], {
          axes : {
            yaxis : {
              showLabel : false,
              showTicks : false,
              padMax : 0,
              padMin : 0
            },
            xaxis : {
              showLabel : false,
              showTicks : false
            }
          },
          series : [ {
            color : '#5FAB78',
            lineWidth : 1,
            showMarker : false
          } ],
          grid : {
            drawGridlines : false
          }
        });
    }
  });

  function initPlugin() {
    Engage.log("Timeline: Statistics: init view");
    //create a new view with the media package model and the template
    //new StatisticsTimelineView(Engage.model.get("mediaPackage"), plugin.template);
    //new StatisticsTimelineView(Engage.model.get("videoDataModel"), plugin.template);
    new StatisticsTimelineView("");
  }
  
	//Init Event
  Engage.log("Timeline: Statistics: init");
  
  Engage.model.on("change:mediaPackage", function() { // listen on a change/set of the mediaPackage model
    initCount -= 1;
    if (initCount === 0) {
        initPlugin();
    }
  });
  
  Engage.model.on("change:footprints", function() { 
    initCount -= 1;
    if (initCount === 0) {
        initPlugin();
    }
  });
  
  Engage.model.on("change:videoDataModel", function() {
    initCount -= 1;
    if (initCount === 0) {
        initPlugin();
    }      
  });
  
  // load highchart lib
  require(["./lib/jquery.jqplot.min.js"], function(videojs) {
      Engage.log("Statistics Timeline: Load jqplot.js done");
      initCount -= 1;
      if (initCount === 0) {
          initPlugin();
      }
  });

  // Load moment.js lib
  require(["./lib/moment.min.js"], function(momentjs) {
      Engage.log("Description: load moment.min.js done");
      initCount -= 1;
      if (initCount === 0) {
          initPlugin();
      }
  });
  //All plugins loaded lets do some stuff
  Engage.on("Core:plugin_load_done", function() {   	
    initCount -= 1;
    if (initCount === 0) {
        initPlugin();
    }
  });
   
  return plugin;
});