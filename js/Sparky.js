var App = App || (function($,ko) {

	var Utils   = {}, // Your Toolbox  
		Ajax    = {}, // Your Ajax Wrapper
		Events  = {}, // Event-based Actions      
		Routes  = {}, // Your Page Specific Logic   
		App     = {}, // Your Global Logic and Initializer
		Public  = {}; // Your Public Functions

	Utils = {
		settings: {
			whTest : 0,
			debug: false,
			meta: {},
			init: function() {
				
				$('meta[name^="app-"]').each(function(){
					Utils.settings.meta[ this.name.replace('app-','') ] = this.content;
				});
				
			},
			workingHours:[
				// Antier
				[Date.today().addDays(-3).set({hour:22,minute:30}),Date.today().addDays(-2).set({hour:2,minute:30})],
				[Date.today().addDays(-2).set({hour:2,minute:30}),Date.today().addDays(-2).set({hour:6,minute:30})],
				[Date.today().addDays(-2).set({hour:6,minute:30}),Date.today().addDays(-2).set({hour:10,minute:30})],
				[Date.today().addDays(-2).set({hour:10,minute:30}),Date.today().addDays(-2).set({hour:14,minute:30})],
				[Date.today().addDays(-2).set({hour:14,minute:30}),Date.today().addDays(-2).set({hour:18,minute:30})],
				[Date.today().addDays(-2).set({hour:18,minute:30}),Date.today().addDays(-2).set({hour:22,minute:30})],
				[Date.today().addDays(-2).set({hour:22,minute:30}),Date.today().addDays(-1).set({hour:2,minute:30})],
				// Ayer
				[Date.today().addDays(-1).set({hour:2,minute:30}),Date.today().addDays(-1).set({hour:6,minute:30})],
				[Date.today().addDays(-1).set({hour:6,minute:30}),Date.today().addDays(-1).set({hour:10,minute:30})],
				[Date.today().addDays(-1).set({hour:10,minute:30}),Date.today().addDays(-1).set({hour:14,minute:30})],
				[Date.today().addDays(-1).set({hour:14,minute:30}),Date.today().addDays(-1).set({hour:18,minute:30})],
				[Date.today().addDays(-1).set({hour:18,minute:30}),Date.today().addDays(-1).set({hour:22,minute:30})],
				[Date.today().addDays(-1).set({hour:22,minute:30}),Date.today().set({hour:2,minute:30})],
				// Hoy
				[Date.today().set({hour:2,minute:30}),Date.today().set({hour:6,minute:30})],
				[Date.today().set({hour:6,minute:30}),Date.today().set({hour:10,minute:30})],
				[Date.today().set({hour:10,minute:30}),Date.today().set({hour:14,minute:30})],
				[Date.today().set({hour:14,minute:30}),Date.today().set({hour:18,minute:30})],
				[Date.today().set({hour:18,minute:30}),Date.today().set({hour:22,minute:30})]
			]
		},
		cache: {
			window: window,
			document: document
		},
		addSeries: function (series) {
			App.data.series = series;
			return App.data.series;
		},
		home_url: function(path){
			if(typeof path=="undefined"){
				path = '';
			}
			return Utils.settings.meta.homeURL+path+'/';            
		},
		log: function(what) {
			if (Utils.settings.debug) {
				console.log(what);
			}
		},
		template: function (arr, html) {
			return arr.map(function(obj) {
				return html.join('').replace(
					/#\{(\w+)\}/g,
					function(_, match) { return obj[match]; }
				);
			}).join('');
		},
		filter:function (needle, haystack) {
			// body...
		},
		tokenizeSiLens:function () {
			Utils.tokenize('SiLens',6);
		},
		tokenizeALPS:function () {
			Utils.tokenize('ALPS',27);
		},
		tokenize: function (processName,meta) {
			for (var o in App.data.series[processName]) {
				ws = App.data.series[processName][o]; //Working Serie
				ws.yieldData = ws.yieldData || [];
				for (var i = 0; i < ws.data.length; i++) {
					var h = _matchHour(ws.data[i][0]);
					//var h = Utils.newMatchHour(ws.data[i][0]);
					hIndex = Utils.findIdGiven_h(ws.yieldData, h);
					// _log(hIndex);
					if (h !== -1) {
						if ( hIndex === -1 ) {
							// Siendo la primera vez que se trabaja con el elemento se inicializa el objeto
							var process = 1,
								pass = 0,
								fail = 0,
								ciclo = ws.data[i][1],
								yieldProd = 0,
								yieldProc = 0,
								processTime = ws.data[i][1];

							if (ws.data[i][2] == "P") {
								pass = 1;
							} else {
								fail = 1;
							}

							yieldProc = ((100 * pass) / process).toFixed(2);
							yieldProd =  ((100 * process) / meta).toFixed(2);
							// Se integran los datos al objeto
							ws.yieldData.push({
								h:h,
								process:process,
								pass:pass,
								fail:fail,
								meta:meta,
								ciclo:ciclo,
								yieldProd:yieldProd,
								yieldProc:yieldProc,
								processTime:processTime
							});
	
						}else{
							ws.yieldData[hIndex].process = 1 + ws.yieldData[hIndex].process;
							
							if (ws.data[i][2] == "P") {
								ws.yieldData[hIndex].pass = 1 + ws.yieldData[hIndex].pass;
							} else {
								ws.yieldData[hIndex].fail = 1 + ws.yieldData[hIndex].fail;
							}
						
							ws.yieldData[hIndex].processTime = ws.yieldData[hIndex].processTime + ws.data[i][1];
							ws.yieldData[hIndex].ciclo = (ws.yieldData[hIndex].processTime / ws.yieldData[hIndex].process).toFixed(2);
							ws.yieldData[hIndex].yieldProc = ((100 * ws.yieldData[hIndex].pass) / ws.yieldData[hIndex].process).toFixed(2);
							ws.yieldData[hIndex].yieldProd = ((100 * ws.yieldData[hIndex].process) / ws.yieldData[hIndex].meta).toFixed(2);
						}
					} else {
						_log("h: " + h + " reference:" + (moment(ws.data[i][0])))
					}
				};
			};
		},
		findIdGiven_h:function (source, id) {
			for (var i = 0; i < source.length; i++) {
				if (source[i].h === id) {
					return i;
				};
			}
			return -1;
		},
		findbyName:function (source, id) {
			for (var o in source){
				if (source.o === id) {
					return source.o;
				};
			}
			return false;
		},
		isBetween:function (test,start,end) {
			if (test.isBefore(start) && test.isAfter(end)) {
				// _log([true,test,start,end])
				return true;
			}else{
				// _log([false,test,start,end])
				return false;
			};
		},
		newMatchHour:function (hour) {
			var h = moment(hour);
			var o = Utils.settings.momentWorkingHours;
			for (var j = 0; j < o.length; j++) {
				var wh = o[j],
					start = wh[0],
					end = wh[1];
				if (_isBetween(h,start,end)) {
					// _log(j + " > " + h.format('hh:mm') + " [ " + wh[0].format('hh:mm') + " - " + wh[1].format("hh:mm") +" ] ");
					return j;
				}else{
					_log("# " + h.format('hh:mm') + " [ " + wh[0].format('hh:mm') + " - " + wh[1].format("hh:mm") +" ] ");
					Utils.whTest++;
					return -1;
				};
			};
		},
		matchHour:function (hour) {
			var h = new Date(hour);
			var o = Utils.settings.workingHours;
			for (var i = 0; i < o.length; i++) {
				var wh = o[i]
				var test = h.between(wh[0],wh[1]);
				if (test) {
					// _log(i + " > " + moment(h).format('hh:mm') + " [ " + moment(wh[0]).format('hh:mm') + " - " + moment(wh[1]).format("hh:mm") +" ] ");
					return i;
				};
			};
			return -1;
		}
	};
	var _log = Utils.log;
	var _matchHour = Utils.matchHour;
	var _isBetween = Utils.isBetween;
	
	Ajax = {
		ajaxUrl: Utils.home_url('ajax'),
		send: function(type, method, data, returnFunc){
			$.ajax({
				type:'POST',
				url: Ajax.ajaxUrl+method,
				dataType:'json',
				data: data,
				success: returnFunc
			});
		},
		call: function(method, data, returnFunc){
			Ajax.send('POST', method, data, returnFunc);
		},
		get: function(method, data, returnFunc){
			Ajax.send('GET', method, data, returnFunc);
		}
	};

	Events = {
		endpoints: {},
		bindEvents: function(){
			
			$('[data-event]').each(function(){
				var _this = this,
					method = _this.dataset.method || 'click',
					name = _this.dataset.event,
					bound = _this.dataset.bound;
				
				if(!bound){
					Utils.parseRoute({
						path: name,
						target: Events.endpoints,
						delimiter: '.',
						parsed: function(res) {
							if(res.exists){
								_this.dataset.bound = true;
								$(_this).on(method, function(e){ 
									res.obj.call(_this, e);
								});
						   }
						}
					});
				}
			});
			
		},
		init: function(){
			Events.bindEvents();
		}
	};
	Routes = {};
	App = {
		data: {
			debug:ko.observable(false),
			wh:Utils.settings.workingHours
		},
		logic: {},
		init: function() {

			Utils.settings.init();
			Events.init();
			Utils.tokenizeSiLens();
			Utils.tokenizeALPS();
			// _log(App.data.series)
			ko.applyBindings(App.data);

		}
	};
	
	Public = {
		init: App.init,
		addSeries:Utils.addSeries,
		log:_log,
		data:App.data,
		h:Utils.settings.workingHours,
		match:Utils.matchHour
	};

	return Public;

})(window.jQuery,ko);

jQuery(document).ready(App.init);