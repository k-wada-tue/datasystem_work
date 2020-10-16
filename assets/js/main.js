'use strict';

/*jshint loopfunc: true */
/*globals $:false */
/*jshint -W061 */
/*jshint unused:false*/
/*globals maptitles:false */
/*globals Muuri:false */
/*globals vizmaps:false */

// Extract Numbers
let numExt = /[+-]?\d+(?:\.\d+)?/g;

// Capturing XY positions for tooltips
let xLoction;
let yLocation;

document.addEventListener('mousemove', e => {
	xLoction = e.clientX;
	yLocation = e.clientY;
});

// Info window for visualization data card
document.querySelectorAll('.dataCard_item_infoBtn').forEach(infoBtn => {
  //console.log(infoBtn);
  infoBtn.addEventListener('click', e => {
  	console.log('clicked');
    const target = e.target;
    console.log(target);
    
    const infoWindow = target.nextElementSibling;
    if (target.getAttribute('aria-selected') =='false') {
    	target.setAttribute('aria-selected', 'true');
    	infoWindow.setAttribute('aria-hidden', 'false');
    } else {
    	target.setAttribute('aria-selected', 'false');
    	infoWindow.setAttribute('aria-hidden', 'true');
    }
  })
}) //test

document.querySelectorAll('.legend-controller').forEach(Lgd => {
  //console.log(infoBtn);
  Lgd.addEventListener('click', e => {
  	console.log('clicked');
    const target = e.target.parentNode;
    console.log(target);
    
    const legendWindow = target.nextElementSibling;
    if (target.getAttribute('aria-selected') =='false') {
    	target.setAttribute('aria-selected', 'true');
    	legendWindow.setAttribute('aria-hidden', 'false');
    } else {
    	target.setAttribute('aria-selected', 'false');
    	legendWindow.setAttribute('aria-hidden', 'true');
    }
  })
}) //test


// Muuri for search, sort drag/drop data viz cards
document.addEventListener('DOMContentLoaded', ()=> {

	let grid = null,
		wrapper = document.querySelector('.grid-wrapper'),
	  	searchField = wrapper.querySelector('.search-field'),
	  	filterField1 = wrapper.querySelector('.filter-field1'),
	  	filterField2 = wrapper.querySelector('.filter-field2'),
	  	sortField = wrapper.querySelector('.sort-field'),
	  	gridElem = wrapper.querySelector('.grid'),
	  	searchAttr = 'data-title',
	  	filterAttr1 = 'data-category',
	  	filterAttr2 = 'data-type',
	  	searchFieldValue,
	  	filterFieldValue1,
	  	filterFieldValue2,
	  	sortFieldValue,
	  	dragOrder = [];

	grid = new Muuri('.grid', {
		dragEnabled: true,
		layout: {
		    dimensionFormatter: function (value, type, dimension) {
		      return Math.round(value);
		    }
		},
		dragStartPredicate: {
		    handle: '.title-drag'
		}
	});

	// Set inital search query, active filter, active sort value and active layout.
	searchFieldValue = searchField.value.toLowerCase();
	filterFieldValue1 = filterField1.value;
	filterFieldValue2 = filterField2.value;
	//sortFieldValue = sortField.value;

	// Search field event binding
	searchField.addEventListener('keyup', function () {
		let newSearch = searchField.value.toLowerCase();
      	if (searchFieldValue !== newSearch) {
	    	searchFieldValue = newSearch;
	      	filter();
      	}
    });

	 // Filter field event binding
	filterField1.addEventListener('change', filter);
	filterField2.addEventListener('change', filter);
	  
	//Sort field event binding
	//sortField.addEventListener('change', sort);

	// Filtering
	function filter() {
	    filterFieldValue1 = filterField1.value;
	    filterFieldValue2 = filterField2.value;
	    console.log(filterFieldValue2);
	    console.log(filterFieldValue1);

	    grid.filter(function (item) {

	    let element = item.getElement(),
	        isSearchMatch = !searchFieldValue ? true : (element.getAttribute(searchAttr) || '').toLowerCase().indexOf(searchFieldValue) > -1,
	        isFilter1Match = !filterFieldValue1 ? true : (element.getAttribute(filterAttr1) || '') === filterFieldValue1,
	        isFilter2Match = !filterFieldValue2 ? true : (element.getAttribute(filterAttr2) || '') === filterFieldValue2;
	      	return isSearchMatch && isFilter1Match && isFilter2Match;
	    });
	}
  
    // Sorting
    function sort() {
      	// Do nothing if sort value did not change.
      	let currentSort = sortField.value;
      	if (sortFieldValue === currentSort) {
        	return;
     	}

     	// If we are changing from "order" sorting to something else
     	// let's store the drag order.
     	if (sortFieldValue === 'order') {
       		dragOrder = grid.getItems();
     	}

     	// Sort the items.
    	grid.sort(
       		currentSort === 'title' ? compareItemTitle :
       		// currentSort === 'color' ? compareItemColor :
      	 	dragOrder
    	);
      	sortFieldValue = currentSort;
    }
  
    // Compare data-title
    function compareItemTitle(a, b) {
    	let aVal = a.getElement().getAttribute(searchAttr) || '';
      	let bVal = b.getElement().getAttribute(searchAttr) || '';
      	return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    }

}); // Muuri ends


// $('#page-hinder').bind('click',function(){
// 	$('#Bennekel-modal').attr('aria-hidden', true);
// 	$('#page-hinder').attr('aria-hidden', true);
// });

// $('#Bennekel-modal-close').bind('click',function(){
// 	$('#Bennekel-modal').attr('aria-hidden', true);
// 	$('#page-hinder').attr('aria-hidden', true);
// });



