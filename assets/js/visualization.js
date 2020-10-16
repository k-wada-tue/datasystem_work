'use strict';

/*jshint loopfunc: true */
/*globals $:false */
/*globals L:false */
/*globals d3:false */
/*globals geojson_nb:false */
/*globals geojson_wd:false */
/*globals geojson_mp1:false */
/*globals geojson_mp2:false */
/*globals geojson_mp3:false */
/*globals geojson_mp4:false */
/*globals ln1Data:false */
/*globals xPos_ln1:false */
/*globals yPos_ln1:false */
/*jshint -W061 */
/*jshint unused:false*/

const dataPath = '/datasets/'; //change this when we move data to a secure server

// Path to each dataset
//const nb_path = dataPath + 'eh_ngbr.json'; //neighborhoods
//const wd_path = dataPath + 'eh_dist.json' //ward data
const mp1_path = dataPath + 'mp1.json'; //Sports participation in Eindhoven in 2017
const mp2_path = dataPath + 'mp2.json'; //Public Lighting in Eindhoven
const mp3_path = dataPath + 'mp3.json'; //Green space in Eindhoven
const mp4_path = dataPath + 'mp4.json';
const ln1_path = dataPath + 'ln1.json'; //Sports participation in Eindhoven from 2006 to 2017

const mp5_path = "http://data.aireas.com/api/v2/airboxes" //Raw air quality data provided by AiREAS http://www.aireas.com/
//const mp5_path = dataPath +  'mp5.json'; //for test

let maptitles = [];
let loading = [];
let mapCount;

let geojson_mp1;
let geojson_mp2;
let geojson_mp3;
let geojson_mp4;
let geojson_mp5;

let geojson_ln1;

let mapLayers;

//for mp5 realtime air quality data
let aqData; 
let dataLoaded = false;
let initializeComplete = false;

let mp5reset = false;
let svg_mp5;
let g_mp5;
let feature_mp5;

let mp5Overlayed = false;

let aqRadioChnage;

let mp5InputChecked;

let vizmaps = function vizmaps(container, mapType, purpose, zoomLev, lat, lon, data) {

	let mapPurpose = arguments[2]
	//Define 1st parameter (map container)
	let selectedContainer = arguments[0];
	let overlayedContainer = arguments[0].slice(0,-11);
	let passedOverlayData = arguments[3];

	//console.log(data[0]);

	if (mapPurpose == 'Overlay' ) {
		console.log('overlay excuted');
	   	const overlayedBase = document.getElementById(selectedContainer);
	   	//console.log(selectedContainer);
	   	//overlayedBase.setAttribute('aria-hidden', 'true'); //visibility hidden on the base overlayed container first
   	}
	
	
		let map = new L.Map(container, {scrollWheelZoom: false}).setView([lat, lon], zoomLev); //*Leaflet uses lat long / original set:[51.4400, 5.4750]		
    // } else {
    // 	let map = new L.Map(container, {scrollWheelZoom: false}).setView([51.46, 5.450], 12); lon/lat
    
		L.esri.basemapLayer(mapType).addTo(map);
			 
	//Eindhoven base neighborhood map
	mapLayers = {

		mp1: function mp1(loader) {
			// Adjust coordinate system to Leaflet
			let projectPoint = function projectPoint(x, y) {
				let point = map.latLngToLayerPoint(new L.LatLng(y,x)); // *Check lat lon, lon lat
		    	/*jshint validthis: true */
		    	this.stream.point(point.x, point.y);
			};

			// Transform positions
			let transform = d3.geoTransform({point: projectPoint}),
				path = d3.geoPath().projection(transform);

			let svg_mp1 = d3.select(map.getPanes().overlayPane).append('svg');
		    let g_mp1 = svg_mp1.append('g').attr('class', 'leaflet-zoom-hide');


		    if (mapPurpose == 'Overlay') {
		        	geojson_mp1 = data[0];
		        	svg_mp1.attr('id', 'mp1-overlay');
		    }

		    console.log(geojson_mp1);
			let feature_mp1 = g_mp1.selectAll('path')
		        	   .data(geojson_mp1.features)
		        	   .enter()
		        	   .append('path');

		    if (mapPurpose == 'Overlay' && overlayedContainer != 'mp1') {
		        	svg_mp1.attr('aria-hidden', true);
		        	//feature_mp5.style('opacity', 0.5);
		    } else if (mapPurpose == 'Overlay' && overlayedContainer == 'mp1') {
		    	//console.log('overlay mp5');
		    	svg_mp1.attr('aria-hidden', false);
		    	const mp1Input = document.getElementById('mp1Overlay-input');
		    	mp1Input.setAttribute('checked', 'checked');
		    	
		    }

		    map.on('moveend', reset);
		    reset();

		    // Reposition the SVG to cover the features.
		    function reset() {
		        let bounds = path.bounds(geojson_mp1),
		            topLeft = bounds[0],
		            bottomRight = bounds[1];

		        svg_mp1.attr('width', bottomRight[0] - topLeft[0])
		           .attr('height', bottomRight[1] - topLeft[1])
		           .style('left', topLeft[0] + 'px')
		           .style('top', topLeft[1] + 'px');
		        

		        g_mp1.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

		        

		        feature_mp1.attr('d', path)
		               .style('stroke', 'rgb(187,187,187)') //#bbbbbb
		               .style('stroke-width', '1px')
		               .style('fill', (d)=> {
		               		if (d.properties.sports >= 70 & d.properties.sports < 80) { 
		                        return 'rgb(215,48,31)';
		                    } else if (d.properties.sports >= 60 & d.properties.sports < 70) { 
		                        return 'rgb(252,141,89)';
		             		} else if (d.properties.sports >= 50 & d.properties.sports < 60) { 
		                        return 'rgb(253,204,138)';
		                    } else if (d.properties.sports >= 40 & d.properties.sports < 50) { 
		                        return 'rgb(254,240,217)';
		                    } else {
		                        return 'rgb(212,212,212)'; //#d4d4d4;
		                    }
		                })
		              	.attr('class', 'pointer-release') // Release leaflet's css pointer-event:none
		              	.style('cursor', 'pointer');

		        function tooltip_mp1() {
		        	feature_mp1.on('mouseover', function(d){
		              	d3.select(this)        			
		            	  .transition()
		           		  .style('opacity', 0.5)
		           		  .duration(200);    
		        	})
              	.on('mousemove', function(d){
              		let info;
       				if (d.properties.sports !== null && d.properties.neighborhood != 'Bennekel-West, Gagelbosch' && d.properties.neighborhood != 'Bennekel-Oost') {
       					info = '<span class="mp1-tooltip_neighbor">' + d.properties.neighborhood + '</span><span class="mp1-tooltip_value">' + d.properties.sports + '%</span>';
       				} else if (d.properties.neighborhood == 'Bennekel-West, Gagelbosch' || d.properties.neighborhood == 'Bennekel-Oost'){
       					info = '<span class="mp1-tooltip_neighbor">' + d.properties.neighborhood + '</span><span class="mp1-tooltip_value">' + d.properties.sports + '%</span><span class="mp1-tooltip_moreInfo">*Click for more info</span>';
       				} else {
       					info = '<span class="mp1-tooltip_neighbor">' + d.properties.neighborhood + '</span><span class="mp1-tooltip_value">No Data</span>';
       				}

       				
       				//console.log(arguments[2]);
       				if (mapPurpose == 'Overlay') {

       					$('.' + overlayedContainer + '-tooltip').html(info)
       	 					 .attr('aria-hidden','false')
							 .attr('width', 'auto')
							 .css("left", xLoction + "px")
						  .css("top", yLocation + "px");

						        //console.log(xLoction);
								//console.log(yLocation);
       	 			} else {
       					$('.' + selectedContainer + '-tooltip').html(info)
	       					 .attr('aria-hidden','false')
							 .attr('width', 'auto')
							 .css("left", (xLoction + 20) + "px")
						     .css("top", (yLocation + 20) + "px");
       				}
						 
          		})
              	.on('click', function(d) {
              		if (d.properties.neighborhood == 'Bennekel-West, Gagelbosch' || d.properties.neighborhood == 'Bennekel-Oost') {
              			
              			
              			$('#page-hinder').attr('aria-hidden', false);

              			setTimeout(function(){ 
              				$('#Bennekel-modal').attr('aria-hidden', false);
              			}, 500);
              								
              		}
              	})
				.on('mouseout', function(){
					d3.select(this)
						.transition()
       				.style('opacity', 1)
       				.duration(200);

       				if (mapPurpose == 'Overlay') {
       					$('.' + overlayedContainer + '-tooltip').attr('aria-hidden','true');
       				} else {
       					$('.' + selectedContainer + '-tooltip').attr('aria-hidden','true');
       				}

				});
		        } tooltip_mp1();
				//remove loader
				$('#mp1-loader').attr('aria-hidden','true');                	  					
		 	}// function reset
		}, //mp1

		mp2: function mp2(loader){

			let projectPoint = function projectPoint(x, y) {	
	    		let point = map.latLngToLayerPoint(new L.LatLng(x,y)); // *Check lat lon, lon lat
	    		/*jshint validthis: true */
	    		this.stream.point(point.x, point.y);
    		};

	    	let transform = d3.geoTransform({point: projectPoint}),
	 			path = d3.geoPath().projection(transform);

			let svg_mp2 = d3.select(map.getPanes().overlayPane).append('svg');
	    	let g_mp2 = svg_mp2.append('g').attr('class', 'leaflet-zoom-hide');	

	    	if (mapPurpose == 'Overlay') {
		        	geojson_mp2 = data[1];
		        	svg_mp2.attr('id', 'mp2-overlay');
		    }

	        let feature_mp2 = g_mp2.selectAll('path')
	                	   .data(geojson_mp2.features)
	                	   .enter()
	                	   .append('path');

	   

		    if (mapPurpose == 'Overlay' && overlayedContainer != 'mp2') {
		        	svg_mp2.attr('aria-hidden', true);
		        	//feature_mp5.style('opacity', 0.5);
		    } else if (mapPurpose == 'Overlay' && overlayedContainer == 'mp2') {
		    	//console.log('overlay mp5');
		    	svg_mp2.attr('aria-hidden', false);
		    	const mp2Input = document.getElementById('mp2Overlay-input');
		    	mp2Input.setAttribute('checked', 'checked');
		    	
		    }

		    
	        map.on('moveend', reset);
	        reset();

	        // Reposition the SVG to cover the features.
	        function reset() {

	            let bounds = path.bounds(geojson_mp2),
	                topLeft = bounds[0],
	                bottomRight = bounds[1];

	            svg_mp2.attr('width', bottomRight[0] - topLeft[0])
	               .attr('height', bottomRight[1] - topLeft[1])
	               .style('left', topLeft[0] + 'px')
	               .style('top', topLeft[1] + 'px');

	            g_mp2.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');


	         //    if (mapPurpose == 'Overlay') {
	         //    	svg_mp2.classed('mp2-overlay', true);
	        	// }

	            feature_mp2.attr('d', path)
            	   .style('fill', (d)=> {
            	   		//console.log(d.properties.color == "blauw")
            	   		if (d.properties.color == "geel") { 
                            return 'rgb(247,189,48)';
                        } else if (d.properties.color == "wit") { 
                            return 'rgb(255,255,255)';
                 		} else if (d.properties.color == "blauw") { 
                            return 'rgb(81,157,213)';
                        } else if (d.properties.color == "oranje") { 
                            return 'rgb(243,112,33)';
                        } 
            	   	})
            	   	.style('opacity', (d)=> {
            	   		//console.log(d.properties.color == "blauw")
            	   		if (d.properties.watt <= 100) { 
                            return 0.5;
                        } else if (d.properties.watt > 100 && d.properties.watt <= 150) { 
                            return 0.6;
                 		} else if (d.properties.watt > 150 && d.properties.watt <= 200) { 
                            return 0.7;
                        } else if (d.properties.watt > 200 && d.properties.watt <= 250) { 
                            return 0.8;
                        } else if (d.properties.watt > 250 && d.properties.watt <= 300) { 
                            return 0.9;
                        } else if (d.properties.watt > 300) { 
                            return 1;
                        } 
            	    });


	            let zoomLev = map.getZoom();

	            if (zoomLev <= 11) {
	                feature_mp2.attr("d", path.pointRadius([0.5]));
	            } else if (zoomLev == 12) {
	                feature_mp2.attr("d", path.pointRadius([0.5]));
	            } else if (zoomLev == 13) {
	                feature_mp2.attr("d", path.pointRadius([1]));
	            } else if (zoomLev == 14) {
	                feature_mp2.attr("d", path.pointRadius([2]));
	            } else if (zoomLev == 15) {
	                feature_mp2.attr("d", path.pointRadius([3]));
	            } else if (zoomLev == 16) {
	                feature_mp2.attr("d", path.pointRadius([4]));
	            } else if (zoomLev == 17) {
	                feature_mp2.attr("d", path.pointRadius([5]));
	            } else if (zoomLev == 18) {
	                feature_mp2.attr("d", path.pointRadius([6]));
	            } else if (zoomLev == 19) {
	                feature_mp2.attr("d", path.pointRadius([7]));
	            } else {
	            	feature_mp2.attr("d", path.pointRadius([8]));
	            }
						
				//remove loader
				$('#mp2-loader').attr('aria-hidden','true');				                   	  					

	     	}// function reset
	    },

	    mp3: function mp3(loader){ // mp3 map4, loading5

	    	// Adjust coordinate system to Leaflet
			let projectPoint = function projectPoint(x, y) {
				let point = map.latLngToLayerPoint(new L.LatLng(y,x)); // *Check lat lon, lon lat
		    	/*jshint validthis: true */
		    	this.stream.point(point.x, point.y);
			};

	    	const transform = d3.geoTransform({point: projectPoint}),
     			path = d3.geoPath().projection(transform);

			let svg_mp3 = d3.select(map.getPanes().overlayPane).append('svg');
        	let g_mp3 = svg_mp3.append('g').attr('class', 'leaflet-zoom-hide');	

        	if (mapPurpose == 'Overlay') {
		        	geojson_mp3 = data[2];
		        	svg_mp3.attr('id', 'mp3-overlay');
		    }

            let feature_mp3 = g_mp3.selectAll('path')
                    	   .data(geojson_mp3.features)
                    	   .enter()
                    	   .append('path');

	         if (mapPurpose == 'Overlay' && overlayedContainer != 'mp3') {
		        	svg_mp3.attr('aria-hidden', true);
		        	//feature_mp5.style('opacity', 0.5);
		    } else if (mapPurpose == 'Overlay' && overlayedContainer == 'mp3') {
		    	//console.log('overlay mp5');
		    	svg_mp3.attr('aria-hidden', false);
		    	const mp3Input = document.getElementById('mp3Overlay-input');
		    	mp3Input.setAttribute('checked', 'checked');
		    	
		    }

            map.on('moveend', reset);
            reset();

            // Reposition the SVG to cover the features.
            function reset() {

                let bounds = path.bounds(geojson_mp3),
                    topLeft = bounds[0],
                    bottomRight = bounds[1];

	            svg_mp3.attr('width', bottomRight[0] - topLeft[0])
	               .attr('height', bottomRight[1] - topLeft[1])
	               .style('left', topLeft[0] + 'px')
	               .style('top', topLeft[1] + 'px');

	            g_mp3.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

	         //    if (mapPurpose == 'Overlay') {
	         //    	svg_mp3.classed('mp3-overlay', true);
	        	// }

	            feature_mp3.attr('d', path)
		                   //.style('stroke', 'rgb(187,187,187)') //#bbbbbb
		                   .style('stroke-width', '1px')
		                   .style('fill', (d)=> {
		                   		if (d.properties.fclass == "allotments") { 
		                            return 'rgb(237,248,177)';
		                        } else if (d.properties.fclass == "farm") { 
		                            return 'rgb(65,171,93)';
		                 		} else if (d.properties.fclass == "forest") { 
		                            return 'rgb(0,68,27)';
		                        } else if (d.properties.fclass == "grass") { 
		                            return 'rgb(173,221,142)';
		                        } else if (d.properties.fclass == "meadow") { 
		                            return 'rgb(247,252,185)';
		                        } else if (d.properties.fclass == "orchard") { 
		                            return 'rgb(199,233,180)';
		                        } else if (d.properties.fclass == "park") { 
		                            return 'rgb(35,132,67)';
		                        } else {
		                            return 'rgb(212,212,212)'; //#d4d4d4;
		                        }
		                    })
		                    .attr('class', 'pointer-release') // Release leaflet's css pointer-event:none
		                  	.style('cursor', 'pointer');

		        

		        function tooltip_mp3() {
	            	feature_mp3.on('mouseover', function(d){
	                  	d3.select(this)        			
                    	  .transition()
                   		  .style('opacity', 0.5)
                   		  .duration(200);    
	                })
                  	.on('mousemove', function(d){

                  		let info;
               				if (d.properties.fclass === null) {
               					info = '<span class="mp3-tooltip_green"> Not Defined </span>';
               				} else {
               					info = '<span class="mp3-tooltip_green">' + d.properties.fclass + '</span>';
               				}
               			

                  		$('.' + selectedContainer + '-tooltip').html(info)
               							 .attr('aria-hidden','false')
               							 .attr('width', 'auto')
               							 .css("left", (xLoction + 20) + "px")
						     			 .css("top", (yLocation + 20) + "px");
                  	})
						.on('mouseout', function(){
							d3.select(this)
							  .transition()
               				  .style('opacity', 1)
               				  .duration(200);

               				$('.' + selectedContainer + '-tooltip').attr('aria-hidden','true');
						});
		        } tooltip_mp3();

   				//remove loader
   				$('#mp3-loader').attr('aria-hidden', true);				                   	  					

         	}// function reset
        },

        mp4: function mp4(loader) {
        	// Transform positions

        	// Adjust coordinate system to Leaflet
			let projectPoint = function projectPoint(x, y) {
				let point = map.latLngToLayerPoint(new L.LatLng(y,x)); // *Check lat lon, lon lat
		    	/*jshint validthis: true */
		    	this.stream.point(point.x, point.y);
			};

			let transform = d3.geoTransform({point: projectPoint}),
        		path = d3.geoPath().projection(transform);

			let svg_mp4 = d3.select(map.getPanes().overlayPane).append('svg');
            let g_mp4 = svg_mp4.append('g').attr('class', 'leaflet-zoom-hide');

            if (mapPurpose == 'Overlay') {
		        	geojson_mp4 = data[3];
		        	svg_mp4.attr('id', 'mp4-overlay');
		    }
        
        	let feature_mp4 = g_mp4.selectAll('path')
                	   .data(geojson_mp4.features)
                	   .enter()
                	   .append('path');

            if (mapPurpose == 'Overlay' && overlayedContainer != 'mp4') {
		        	svg_mp4.attr('aria-hidden', true);
		        	//feature_mp5.style('opacity', 0.5);
		    } else if (mapPurpose == 'Overlay' && overlayedContainer == 'mp4') {
		    	//console.log('overlay mp5');
		    	svg_mp4.attr('aria-hidden', false);
		    	const mp4Input = document.getElementById('mp4Overlay-input');
		    	mp4Input.setAttribute('checked', 'checked');
		    	
		    }

            map.on('moveend', reset);
            reset();

            // Reposition the SVG to cover the features.
            function reset() {
                let bounds = path.bounds(geojson_mp4),
                    topLeft = bounds[0],
                    bottomRight = bounds[1];

	            svg_mp4.attr('width', bottomRight[0] - topLeft[0])
	               .attr('height', bottomRight[1] - topLeft[1])
	               .style('left', topLeft[0] + 'px')
	               .style('top', topLeft[1] + 'px');

	            g_mp4.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

	            // if (mapPurpose == 'Overlay') {
	            // 	svg_mp4.classed('mp4-overlay', true)
	            // }

	            let zoomLev = map.getZoom();

	            feature_mp4.attr('d', path)
                   .style('stroke', 'rgb(67,133,244)') 
                   .style('opacity', 0.8)
                   .style('stroke-width', ()=>{
                   		if (zoomLev <= 11) {
	                        return 1;
	                    } else if (zoomLev == 12) {
	                        return 1.5;
	                    } else if (zoomLev == 13) {
	                        return 2;
	                    } else if (zoomLev == 14) {
	                        return 3;
	                    } else if (zoomLev == 15) {
	                        return 4;
	                    } else if (zoomLev == 16) {
	                		return 5;
	                    } else {
	                    	return 1;
	                    }
                   })
                   .style('fill', 'none')
        		   .attr('class', 'pointer-release') // Release leaflet's css pointer-event:none
                   .style('cursor', 'pointer');



					//remove loader
				$('#mp4-loader').attr('aria-hidden','true');
 		                   	  					
         	}// function reset
        },

	    mp5: function mp5(loader, newData) {
	    	//console.log(newData);

	    	let projectPoint;
	    	let transform;
	    	let path;

	    	if (dataLoaded == true && initializeComplete == true ) {
	    		    geojson_mp5 = [];
					geojson_mp5 = newData.data;
					console.log('skip initialize process');
			} else { 

			// Adjust coordinate system to Leaflet
			projectPoint = function projectPoint(x, y) {
				let point = map.latLngToLayerPoint(new L.LatLng(y,x)); // *Check lat lon, lon lat
		    	/*jshint validthis: true */
		    	this.stream.point(point.x, point.y);
			};

				// Transform positions
				transform = d3.geoTransform({point: projectPoint});
				path = d3.geoPath().projection(transform);

				svg_mp5 = d3.select(map.getPanes().overlayPane).append('svg').style('pointer-events', 'all');
			    g_mp5 = svg_mp5.append('g').attr('class', 'leaflet-zoom-hide');
			    	
									   

			    //filters go in defs element
				let defs = svg_mp5.append("defs");

				let filter = defs.append("filter")
				    .attr("id", "dot-blur");

				filter.append("feGaussianBlur")
				    .attr("in", "SourceGraphic")
				    .attr("stdDeviation", 1);


		    	if (mapPurpose == 'Overlay') {
		        	geojson_mp5 = data[4];
		        	svg_mp5.attr('id', 'mp5-overlay');
		        	initializeComplete = true;
		        	console.log(initializeComplete);
		    	} else {
		    		svg_mp5.attr('id', 'mp5-svg');
		    	}


				 //console.log(geojson_mp5.features);
				feature_mp5 = g_mp5.selectAll('path')
			        	   .data(geojson_mp5.features)
			        	   .enter()
			        	   .append('path');
		 	
		 	}


		    if (mapPurpose == 'Overlay' && overlayedContainer != 'mp5' && mp5InputChecked != true) {
		        	svg_mp5.attr('aria-hidden', true);
		        	//feature_mp5.style('opacity', 0.5);
		    } else if (mapPurpose == 'Overlay' && overlayedContainer == 'mp5') {
		    	//console.log('overlay mp5');
		    	svg_mp5.attr('aria-hidden', false);
		    	const mp5Input = document.getElementById('mp5Overlay-input');
		    	mp5Input.setAttribute('checked', 'checked');
		    } else if (mapPurpose == 'Overlay' && overlayedContainer != 'mp5' && mp5InputChecked == true) {
		    	svg_mp5.attr('aria-hidden', false);
		    }


		    map.on('moveend', mp5reset);
		    mp5reset();

		    //Reposition the SVG to cover the features.
		    function mp5reset() {
		    	console.log('reset called');
		    	mp5reset = true;
				//console.log(geojson_mp5);

				
				console.log(geojson_mp5);

				// Adjust coordinate system to Leaflet
				projectPoint = function projectPoint(x, y) {
					let point = map.latLngToLayerPoint(new L.LatLng(y,x)); // *Check lat lon, lon lat
			    	/*jshint validthis: true */
			    	this.stream.point(point.x, point.y);
				};

				// Transform positions
				transform = d3.geoTransform({point: projectPoint});
				path = d3.geoPath().projection(transform);


				 //console.log(geojson_mp5.features);
			     feature_mp5 = g_mp5.selectAll('path')
			           .remove()
                       .exit()
		        	   .data(geojson_mp5.features)
		        	   .enter()
		        	   .append('path')
		        	    // Release leaflet's css pointer-event:none
                       .attr('class', 'airbox-dot')
                       .style('cursor', 'pointer');

		        let bounds = path.bounds(geojson_mp5),
		            topLeft = bounds[0],
		            bottomRight = bounds[1];

		        svg_mp5.attr('width', bottomRight[0] - topLeft[0])
		           .attr('height', bottomRight[1] - topLeft[1])
		           .style('left', topLeft[0] + 'px')
		           .style('top', topLeft[1] + 'px');

		        let zoomLev = map.getZoom();
		        //console.log(zoomLev);

	            if (zoomLev <= 11) {
	                feature_mp5.attr("d", path.pointRadius(6));
	            } else if (zoomLev == 12) {
	                feature_mp5.attr("d", path.pointRadius(8));
	            } else if (zoomLev == 13) {
	                feature_mp5.attr("d", path.pointRadius(10));
	            } else if (zoomLev == 14) {
	                feature_mp5.attr("d", path.pointRadius(12));
	            } else if (zoomLev == 15) {
	                feature_mp5.attr("d", path.pointRadius(14));
	            } else if (zoomLev == 16) {
	                feature_mp5.attr("d", path.pointRadius(16));
	            } else if (zoomLev == 17) {
	                feature_mp5.attr("d", path.pointRadius(18));
	            } else if (zoomLev == 18) {
	                feature_mp5.attr("d", path.pointRadius(20));
	            } else if (zoomLev == 19) {
	                feature_mp5.attr("d", path.pointRadius(22));
	            } else {
	            	feature_mp5.attr("d", path.pointRadius(6));
	            }
		        
		        g_mp5.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

		        const mp5Cont = document.getElementById('mp5');
		        console.log(mp5Cont);
		        
		        const mp5select = document.getElementById('mp5select') ;
		        
		        
		        //console.log(mp5select.selectedIndex);

		        //PM1:0, 14 Good to Moderate µg(micrograms)/m3
		        const pm1max = d3.max(geojson_mp5.features, function(d) { return d['properties']['PM1'] });
		        const pm1min = d3.min(geojson_mp5.features, function(d) { return d['properties']['PM1'] });
		        const pm1moderate = 14;

				const pm1color = d3.scaleLinear().domain([pm1min, pm1moderate, pm1max]).range(['blue', 'green', 'red']);
		       
				//PM2.5:1 20 Good to Moderate µg(micrograms)/m3
		        const pm25max = d3.max(geojson_mp5.features, function(d) { return d['properties']['PM25'] });
		        const pm25min = d3.min(geojson_mp5.features, function(d) { return d['properties']['PM25'] });
		        const pm25moderate = 20;

				const pm25color = d3.scaleLinear().domain([pm25min, pm25moderate, pm25max]).range(['blue', 'green', 'red']);

                //PM10:2 30 Good to Moderate µg(micrograms)/m3
		        const pm10max = d3.max(geojson_mp5.features, function(d) { return d['properties']['PM10'] });
		        const pm10min = d3.min(geojson_mp5.features, function(d) { return d['properties']['PM10'] });
		        const pm10moderate = 30;

				const pm10color = d3.scaleLinear().domain([pm10min, pm10moderate, pm10max]).range(['blue', 'green', 'red']);

				//UFP:3 6000 Good to Moderate number of particles/cm3
		        const UFPmax = d3.max(geojson_mp5.features, function(d) { return d['properties']['UFP'] });
		        const UFPmin = d3.min(geojson_mp5.features, function(d) { return d['properties']['UFP'] });
		        const UFPmoderate = 6000;

				const UFPcolor = d3.scaleLinear().domain([UFPmin, UFPmoderate, UFPmax]).range(['blue', 'green', 'red']);

				//Ozone:4 40 Good to Moderate µg(micrograms)/m3
		        const Ozonemax = d3.max(geojson_mp5.features, function(d) { return d['properties']['Ozone'] });
		        const Ozonemin = d3.min(geojson_mp5.features, function(d) { return d['properties']['Ozone'] });
		        const Ozonemoderate = 40;

				const Ozonecolor = d3.scaleLinear().domain([Ozonemin, Ozonemoderate, Ozonemax]).range(['blue', 'green', 'red']);


				//NO2:5 30 Good to Moderate µg(micrograms)/m3
		        const NO2max = d3.max(geojson_mp5.features, function(d) { return d['properties']['NO2'] });
		        const NO2min = d3.min(geojson_mp5.features, function(d) { return d['properties']['NO2'] });
		        const NO2moderate = 30;

				const NO2color = d3.scaleLinear().domain([NO2min, NO2moderate, NO2max]).range(['blue', 'green', 'red']);

				const pm1Radio = document.getElementById('pm1Radio');
				const pm25Radio = document.getElementById('pm25Radio');
				const pm10Radio = document.getElementById('pm10Radio');
				const UFPRadio = document.getElementById('UFPRadio');
				const OzoneRadio = document.getElementById('OzoneRadio');
				const NO2Radio = document.getElementById('NO2Radio');

				//if (overlayedContainer == 'mp5' || selectedContainer == 'mp5') {
				
		        function mp5coloring() {
		        	if (mp5select.selectedIndex == 0) {
						feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return pm1color(d['properties']['PM1']); 
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);

		        	    if (mapPurpose == 'Overlay') {
		        	    pm1Radio.checked = true; 
		        	    }
		        	   // .style();
			        } else if(mp5select.selectedIndex == 1) {
			        	feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return pm25color(d['properties']['PM25']);
		        	   	})
		        	   .style("filter","url(#dot-blur)")
		        	   .style('fill-opacity', 0.8);

		        	   if (mapPurpose == 'Overlay') {
		        	   pm25Radio.checked = true;
		        	}

			        } else if(mp5select.selectedIndex == 2)  {
			        	feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return pm10color(d['properties']['PM10']);
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);

		        	    if (mapPurpose == 'Overlay') {
		        	    pm10Radio.checked = true;
		        		}

			        } else if(mp5select.selectedIndex == 3) {
			        	feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        			return UFPcolor(d['properties']['UFP']);
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);

		        	    if (mapPurpose == 'Overlay') {
		        	    UFPRadio.checked = true;
		        	    }

			        } else if(mp5select.selectedIndex == 4 ) {
			        	feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return Ozonecolor(d['properties']['Ozone']);
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);

		        	    if (mapPurpose == 'Overlay') {
		        	    OzoneRadio.checked = true;
		        	    }

			        } else if(mp5select.selectedIndex == 5) {
			        	feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return NO2color(d['properties']['NO2']);
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);

		        	    if (mapPurpose == 'Overlay') {
		        	    NO2Radio.checked = true;
		        	     }
		        	} 

		        } mp5coloring();

		        mp5select.addEventListener("change", function(){
		        	console.log('changed');
		        	mp5coloring();

		        });
		        //}

				aqRadioChnage = function aqRadioChnage(selectedRadio) {
					if (selectedRadio.id == 'pm1Radio') {
						selectedRadio.checked = true;

						mp5select.selectedIndex = 0;
					  

						feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return pm1color(d['properties']['PM1']); 
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);
					} else if (selectedRadio.id == 'pm25Radio') {
						selectedRadio.checked = true;

					
						mp5select.selectedIndex = 1;
					    

						feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return pm25color(d['properties']['PM25']);
		        	   	})
		        	   .style("filter","url(#dot-blur)")
		        	   .style('fill-opacity', 0.8);

					} else if (selectedRadio.id == 'pm10Radio') {
						selectedRadio.checked = true;

						mp5select.selectedIndex = 2;
					

						feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return pm10color(d['properties']['PM10']);
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);

		        	} else if (selectedRadio.id == 'UFPRadio') {
		        		selectedRadio.checked = true;

		        	
						mp5select.selectedIndex = 3;
					    

						feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        			return UFPcolor(d['properties']['UFP']);
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);
		        	} else if (selectedRadio.id == 'OzoneRadio') {
		        		selectedRadio.checked = true;

		       
						mp5select.selectedIndex = 4;
					   

						feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return Ozonecolor(d['properties']['Ozone']);
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);

		        	} else if (selectedRadio.id == 'NO2Radio') {
		        		selectedRadio.checked = true;

		        		
						mp5select.selectedIndex = 5;
					  

						feature_mp5.attr('d', path)
		        	   .style('fill', (d)=> {
		        	   		return NO2color(d['properties']['NO2']);
		        	   	})
		        	    .style("filter","url(#dot-blur)")
		        	    .style('fill-opacity', 0.8);

		        	}

				}

		       
		        function tooltip_mp5() {
		        	
		        	feature_mp5.on('mouseover', function(d){
		        		console.log('mouseover');
		        		//console.log('mouseover');
		              	d3.select(this)        			
		            	  .transition()
		           		  .style('stroke-width', 2)
		           		  .style('stroke', 'black')
		           		  .style('cursor', 'pointer')
		           		  .duration(200);    
		        })
	          	.on('mousemove', function(d){
	        
	   				
	   				let info = '<span class="mp5-tooltip_street content">' + d.properties.Location + '</span>' +
	   				'<span class="mp5-tooltip_date content">'+ d.properties.Updated + '</span>' + 
	   				'<span class="mp5-tooltip_pm1 content"><span class="title">PM1:&nbsp;&nbsp;</span><span class="figure">'+ d.properties.PM1 + ' µg/m3</span></span>' +
	   				'<span class="mp5-tooltip_pm25 content"><span class="title">PM2.5:&nbsp;&nbsp;</span><span class="figure">'+ d.properties.PM25 + ' µg/m3</span></span>' +
	   				'<span class="mp5-tooltip_pm10 content"><span class="title">PM10:&nbsp;&nbsp;</span><span class="figure">'+ d.properties.PM25 + ' µg/m3</span></span>' + 
	   				'<span class="mp5-tooltip_ufp content"><span class="title">UFP:&nbsp;&nbsp;</span><span class="figure">'+ d.properties.UFP + ' particles/cm3</span></span>' +
	   				'<span class="mp5-tooltip_ozone content"><span class="title">Ozone:&nbsp;&nbsp;</span><span class="figure">'+ d.properties.Ozone + ' µg/m3</span></span>' +
	   				'<span class="mp5-tooltip_no2 content"><span class="title">NO2:&nbsp;&nbsp;</span><span class="figure">'+ d.properties.NO2 + ' µg/m3</span></span>';

	   				//console.log(arguments[2]);
	   				if (mapPurpose == 'Overlay') {

	   					$('.' + overlayedContainer + '-tooltip').html(info)
	   	 					 .attr('aria-hidden','false')
							 .attr('width', 'auto')
							 .css("left", xLoction + "px")
						  .css("top", yLocation + "px");

						        //console.log(xLoction);
								//console.log(yLocation);
	   	 			} else {
	   					$('.' + selectedContainer + '-tooltip')
	   						 .html(info)
	       					 .attr('aria-hidden','false')
							 .attr('width', 'auto')
							 .css("left", (xLoction + 20) + "px")
						     .css("top", (yLocation + 20) + "px");
	   				}
						 
	      		})
				.on('mouseout', function(){
					d3.select(this)
				    .transition()
	   				.style('stroke-width', 0)
	   				.style('stroke', 'none')
	   				.duration(200);

	   				if (mapPurpose == 'Overlay') {
	   					$('.' + overlayedContainer + '-tooltip').attr('aria-hidden','true');
	   				} else {
	   					$('.' + selectedContainer + '-tooltip').attr('aria-hidden','true');
	   				}

				});
		        } tooltip_mp5();

				//remove loader
				$('#mp5-loader').attr('aria-hidden','true');  
				console.log(loader);              	  					
		 	}// function reset
		 	if (mapPurpose == 'Overlay') {
		 		console.log('mp5 overlay excuted');
		 	    mp5Overlayed = true;
		 	}
		} //mp5
	};

    function initializeMaps() {
    	if (selectedContainer == 'mp1') {	
			mapLayers.mp1('#' + selectedContainer + '-loader');
			maptitles[0] = $('#' + selectedContainer).prev().html();
			
		} else if (selectedContainer == 'mp2'){
			mapLayers.mp2('#' + selectedContainer + '-loader');
			maptitles[1] = $('#' + selectedContainer).prev().html();
			
			// overlaysList (maptitles[1]);
		} else if (selectedContainer == 'mp3') {
			mapLayers.mp3('#' + selectedContainer + '-loader');
			maptitles[2] = $('#' + selectedContainer).prev().html();
			// overlaysList (maptitles[2]);
		} else if (selectedContainer == 'mp4') {
			mapLayers.mp4('#' + selectedContainer + '-loader');
			maptitles[3] = $('#' + selectedContainer).prev().html();
			// overlaysList (maptitles[3]);
		} else if (selectedContainer == 'mp5') {
			mapLayers.mp5('#' + selectedContainer + '-loader');
			maptitles[4] = $('#' + selectedContainer).prev().html();
			// overlaysList (maptitles[3]);
		} else if (selectedContainer == 'mp1OverlayCont') {
			mapLayers.mp1('#' + selectedContainer + '-loader');
			mapLayers.mp2('#' + selectedContainer + '-loader');
			mapLayers.mp3('#' + selectedContainer + '-loader');
			mapLayers.mp4('#' + selectedContainer + '-loader');
			mapLayers.mp5('#' + selectedContainer + '-loader');

		} else if (selectedContainer == 'mp2OverlayCont') {
			mapLayers.mp1('#' + selectedContainer + '-loader');
			mapLayers.mp2('#' + selectedContainer + '-loader');
			mapLayers.mp3('#' + selectedContainer + '-loader');
			mapLayers.mp4('#' + selectedContainer + '-loader');
			mapLayers.mp5('#' + selectedContainer + '-loader');
		} 
		else if (selectedContainer == 'mp3OverlayCont') {
			mapLayers.mp1('#' + selectedContainer + '-loader');
			mapLayers.mp2('#' + selectedContainer + '-loader');
			mapLayers.mp3('#' + selectedContainer + '-loader');
			mapLayers.mp4('#' + selectedContainer + '-loader');
			mapLayers.mp5('#' + selectedContainer + '-loader');
		} else if (selectedContainer == 'mp4OverlayCont') {
			mapLayers.mp1('#' + selectedContainer + '-loader');
			mapLayers.mp2('#' + selectedContainer + '-loader');
			mapLayers.mp3('#' + selectedContainer + '-loader');
			mapLayers.mp4('#' + selectedContainer + '-loader');
			mapLayers.mp5('#' + selectedContainer + '-loader');
		} else if (selectedContainer == 'mp5OverlayCont') {
			mapLayers.mp1('#' + selectedContainer + '-loader');
			mapLayers.mp2('#' + selectedContainer + '-loader');
			mapLayers.mp3('#' + selectedContainer + '-loader');
			mapLayers.mp4('#' + selectedContainer + '-loader');
			mapLayers.mp5('#' + selectedContainer + '-loader');
		} 
    } initializeMaps();

    if (mapPurpose == 'Overlay') {

    const mp1OverlayInput = document.getElementById('mp1Overlay-input');
	const mp2OverlayInput = document.getElementById('mp2Overlay-input');
	const mp3OverlayInput = document.getElementById('mp3Overlay-input');
	const mp4OverlayInput = document.getElementById('mp4Overlay-input');
	const mp5OverlayInput = document.getElementById('mp5Overlay-input');

	const mp1Overlay = document.getElementById('mp1-overlay');
	const mp2Overlay = document.getElementById('mp2-overlay');
	const mp3Overlay = document.getElementById('mp3-overlay');
	const mp4Overlay = document.getElementById('mp4-overlay');
	const mp5Overlay = document.getElementById('mp5-overlay');


	mp1OverlayInput.addEventListener('change', function(event) {
	  if (event.target.checked == true) {
	  	mp1Overlay.setAttribute('aria-hidden', false);
	  } else {
	  	mp1Overlay.setAttribute('aria-hidden', true);
	  }
	});

	mp2OverlayInput.addEventListener('change', function(event) {
	  if (event.target.checked == true) {
	  	mp2Overlay.setAttribute('aria-hidden', false);
	  } else {
	  	mp2Overlay.setAttribute('aria-hidden', true);
	  }
	});

	mp3OverlayInput.addEventListener('change', function(event) {
	  if (event.target.checked == true) {
	  	mp3Overlay.setAttribute('aria-hidden', false);
	  } else {
	  	mp3Overlay.setAttribute('aria-hidden', true);
	  }
	});

	mp4OverlayInput.addEventListener('change', function(event) {
	  if (event.target.checked == true) {
	  	mp4Overlay.setAttribute('aria-hidden', false);
	  } else {
	  	mp4Overlay.setAttribute('aria-hidden', true);
	  }
	});

	mp5OverlayInput.addEventListener('change', function(event) {
	  if (event.target.checked == true) {
	  	mp5Overlay.setAttribute('aria-hidden', false);
	  	mp5InputChecked = true;
	  } else {
	  	mp5Overlay.setAttribute('aria-hidden', true);
	  	mp5InputChecked = false;
	  }
	});

   };



   
}; //vizmaps

function mp1(zoomLev, lat, lon){
	//mp1: Green space in Eindhoven
	d3.json(mp1_path).then(function(geojson) { //5 mp3

		geojson_mp1 = geojson;

		vizmaps('mp1', 'Gray', 'initialize', zoomLev, lat, lon);
		loading[0] = "mp1";
	});
};

//mp2: Public Lighting in Eindhoven
function mp2(zoomLev, lat, lon) {
	d3.json(mp2_path).then(function(geojson) { //5 mp3

		geojson_mp2 = geojson;

		vizmaps('mp2', 'DarkGray', 'initialize', zoomLev, lat, lon);
		loading[2] = "mp2";

	});
};


//mp3: Green space in Eindhoven

function mp3(zoomLev, lat, lon) {
	d3.json(mp3_path).then(function(geojson) { //5 mp3

		geojson_mp3 = geojson;

		vizmaps('mp3', 'Gray', 'initialize', zoomLev, lat, lon);//visualization.js
		loading[3] = 'mp3'

	});
}


//mp4: Bike Routes in Eindhoven

function mp4(zoomLev, lat, lon) {
	d3.json(mp4_path).then(function(geojson) { //5 mp3

		geojson_mp4 = geojson;

		vizmaps('mp4', 'Gray', 'initialize', zoomLev, lat, lon);//visualization.js
		loading[4] = 'mp4'
	});
};


//console.log(initializeComplete); //false
//console.log(dataLoaded); //false
let mp5zoomLev;

function mp5(zoomLev, lat, lon) {

	mp5zoomLev = zoomLev;
	const socket = io();

	const handleServerRequest = function(data) {
		aqData = data.data;
		dataLoaded = data.status;
		//console.log(JSON.stringify(aqData));
		//console.log(data.status);
		console.log(data);
		console.log(dataLoaded);
		console.log(initializeComplete);
		console.log(aqData);
		if (dataLoaded == true && initializeComplete == true) {
			mapLayers.mp5('mp5', data);
			//document.getElementById("mp5-svg").remove();
		}
	}

	socket.on('server request', handleServerRequest);

	function checkData() {
		
	    if(dataLoaded == true && typeof aqData != 'undefined') {

	    	console.log('move forward');
	    	console.log(dataLoaded);

	       function initiateMp5() {
	       	console.log('move forward2');
	       	console.log(mp5zoomLev);
	      	    //console.log(aqData);
				geojson_mp5 = aqData; 
				console.log('move forward3');
				vizmaps('mp5', 'Gray', 'initialize', mp5zoomLev, lat, lon);//visualization.js
				console.log('move forward4');
				loading[5] = 'mp5'

		  } initiateMp5();
		  console.log('move forward5');
		  initializeComplete = true;
		  
		  //console.log(initializeComplete);
	       
	    } else {
	     console.log(dataLoaded);
	     console.log(initializeComplete);
	     console.log('recheck data status');
	     window.setTimeout(checkData, 500); /* repeat (wait) until data is loaded */
	    }
	} checkData();
}
// Socket io for real-time air quality data 
	
function mpOverlay(baseMapId, overlayContId, Base, zoomLev, lat, lon) {

	const socket = io();

	const handleServerRequest = function(data) {
		aqData = data.data;
		dataLoaded = data.status;
		//console.log(JSON.stringify(aqData));
		//console.log(data.status);
		console.log(data);
		console.log(dataLoaded);
		console.log(initializeComplete);
		console.log(aqData);

		const mp5OverlayInput = document.getElementById('mp5Overlay-input');

		if (dataLoaded == true && initializeComplete == true && mp5OverlayInput.checked == true) {
			mapLayers.mp5('mp5', data);
			//document.getElementById("mp5-svg").remove();
		}
	}

	socket.on('server request', handleServerRequest);

	// Control the order of fetching data and return them as a json
	const apiRequest1 = fetch(mp1_path).then((response)=> { 
	    return response.json();
	});
	const apiRequest2 = fetch(mp2_path).then((response)=> {
	    return response.json();
	});

	const apiRequest3 = fetch(mp3_path).then((response)=> {
	     return response.json();
	});

	const apiRequest4 = fetch(mp4_path).then((response)=> {
	     return response.json();
	});

	const aqDataCheck = new Promise(function(resolve, reject) {
       function checkData2() {
		    if(typeof aqData != 'undefined' ) {
		    	resolve(aqData);
		    } else {
		       console.log('recheck  aqData');
		       window.setTimeout(checkData2, 500); /* repeat (wait) until data is loaded */
		    }
		} checkData2();
    });


	Promise.all([apiRequest1,apiRequest2,apiRequest3,apiRequest4, aqDataCheck]).then((data)=> {

    	console.log('mpOverlay executed');

	    const loaderId = `${baseMapId}-loader`;
	    const loaderDOM = document.getElementById(loaderId);

	    const mainCont = document.getElementById(baseMapId);


		console.log(overlayContId);

		let overlayContainer = document.createElement('div');
		overlayContainer.setAttribute('id', overlayContId);
		overlayContainer.classList.add('vizEach_content_visframe_canvas', 'mpOverlayCont');

		// overlayParent.nextElementSibling.setAttribute('aria-hidden', false);
		
		mainCont.parentNode.insertBefore(overlayContainer, mainCont.nextSibling);
		console.log(lat);
		console.log(lon);
		console.log(data);
		vizmaps(overlayContId, Base, 'Overlay', zoomLev, lat, lon, data);

	})
}


let vizcharts = function vizcharts(chartType) {

	//Define 1st parameter (map container)
	let selectedContainer = arguments[0];
	//Responsive D3.js by Brendan Sudol: https://brendansudol.com/writing/responsive-d3
    function responsivefy(svg) {
	// get container + svg aspect ratio
		let container = d3.select(svg.node().parentNode),
			width = parseInt(svg.style("width")),
			height = parseInt(svg.style("height")),
			aspect = width / height;

		// add viewBox and preserveAspectRatio properties,
		// and call resize so that svg resizes on inital page load
		svg.attr("viewBox", "0 0 " + width + " " + height)
		   .attr("perserveAspectRatio", "xMinYMid")
		   .call(resize);

		// to register multiple listeners for same event type, 
		// you need to add namespace, i.e., 'click.foo'
		// necessary if you call invoke this function for multiple svgs
		// api docs: https://github.com/mbostock/d3/wiki/Selections#on
		d3.select(window).on("resize." + container.attr("id"), resize);

		// get width of container and resize svg to fit it
		function resize() {
		    let targetWidth = parseInt(container.style("width"));
		   		svg.attr("width", targetWidth);
		        svg.attr("height", Math.round(targetWidth / aspect));
		}
	}

	let chartLayers = {
		ln1: function ln1() {

			let data = geojson_ln1;
	        let margin = {top: 30, right: 26, bottom: 80, left: 40}, //{top: 20, right: 40, bottom: 0, left: 60},
	          	w = parseInt(d3.select('#ln1').style('width')) - margin.left - margin.right,
	            h = parseInt(d3.select('#ln1').style('height')) - margin.top - margin.bottom;

	       	let svg_w = parseInt(d3.select('#ln1').style('width')),
	        	svg_h = parseInt(d3.select('#ln1').style('height')) - 40;
	       
	        /* Format Data */
			let parseDate = d3.timeParse("%Y");
							
			data.forEach((d)=> { 
				d.values.forEach((d)=> {
					d.year = parseDate(d.year);
					d.percent = +d.percent; 
				});
			});

	        //set the ranges
			let x = d3.scaleTime().range([0, w]);
			let y = d3.scaleLinear().range([h, 0]);

			//Scale the range of the data
			x.domain(d3.extent(data[0].values, function(d) { return d.year; }));
			y.domain([40, 85]);

			let xAxis = d3.axisBottom(x);        
				let yAxis = d3.axisLeft(y)
							  .ticks(7)
							  .tickSize(4);

				let gridlines = d3.axisLeft()
	    					  .tickFormat("")
	    					  .tickSize(-w)
	       					  .scale(y);

	       	//const userAgent = window.navigator.userAgent;
	       	//console.log(navigator.vendor);
	       	//navigator.vendor ==  "Apple Computer, Inc."

	        //Chart area exclude x/y axis area
	       	let svg = d3.select('#ln1')
	                    .append('svg')
	                    .attr('class', ()=>{ // for safari transform translate issue
	                    	if (navigator.vendor ==  "Apple Computer, Inc.") {
									return 'topMargin';
								}				
	                    })
	                    .attr('height', svg_h)
	                    .attr('width', svg_w)
	                    .style('cursor', 'pointer')
	                    .on('mouseenter', ()=> {

	 						$('.ln1-group').addClass('in-active');
	 					})
	 					.on('mouseleave', ()=> {
	 						$('.ln1-group').removeClass('in-active');
	 					})
	                    .call(responsivefy) //for responsive chart
	                    .attr('transform', 'translate(' + 0 + ',' + 40 + ')')
	                    //.append("rect") //Background color (not implemented)
	 					//.attr('width', w)
				 			// .attr('height', h)
				 			// .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	                    .append('g')       
	                    .attr('width', w)
	 					.attr('height', h)
	 					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			svg.append("g")
				   .attr("class", "grid")
	           .call(gridlines);

				let line = d3.line()
						     .x((d) => x(d.year))
						     .y((d) => y(d.percent));
	                       
				let lines = svg.append('g')
							   .attr('class', 'ln1lines');

			lines.selectAll('.ln1line-group')
				     .data(data)
				     .enter()
				     .append('g')
					 .attr('class', 'ln1-group')
					 .append('path')
					 .attr('class', 'line')
					 .attr('d', (d) => line(d.values))
					 .on("mouseover", function (d){
						this.parentNode.appendChild(this);			
						//console.log(d.values[0].year + d.values[0].percent)
						d3.select(this).classed('active', true);

			     })
					 .on('mousemove', function (d){

					 	let info = '<span class="ln1-tooltip_neighbor">' + d.name + '</span>';
					 	$('.ln1-tooltip').html(info)
	           								.attr('aria-hidden', false)
	           								.attr('width', 'auto')
	           								.attr('height', '100px')
	           								.css("left", (xLoction + 20) + "px")
						     				.css("top", (yLocation + 20) + "px");

					 })

				.on("mouseout", function () {
				  d3.select(this).classed('active', false);
				  $('.ln1-tooltip').attr('aria-hidden', true);				            					
				    
				});

				svg.append('g')
			   .attr('class', 'ln1-xAxis')
			   .attr('transform', 'translate(0,' + h + ')')
			   .call(xAxis);
			   //.call(g => g.select(".domain").remove());

			svg.append('g')
			   .attr('class', 'ln1-yAxis')
			   .call(yAxis)
			   .call(g => g.select(".domain").remove());

			svg.append("text")
		        .attr("y", 0 - 20)
		        .attr("x", 0)
		        .attr("dy", "1em")
		        .style("text-anchor", "middle")
		        .text("percent")
		        .style('font-size', '10px')
		        .style('font-weight', 'bold');	

		    //remove loader
			$('#ln1-loader').attr('aria-hidden', true);	
		}
	};

	if (selectedContainer == 'ln1') {
		chartLayers.ln1();
	}
};

//ln1: Sports Participation in Eindhoven from 2006 to 2017
function ln1() {
	d3.json(ln1_path).then(function(geojson) { //5 mp3

	geojson_ln1 = geojson;

	vizcharts('ln1');
	loading[1] = "ln1";

});
};


