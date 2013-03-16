var App = App || (function($,ko) {

    var Utils   = {}, // Your Toolbox  
        Ajax    = {}, // Your Ajax Wrapper
        Events  = {}, // Event-based Actions      
        Routes  = {}, // Your Page Specific Logic   
        App     = {}, // Your Global Logic and Initializer
        Public  = {}; // Your Public Functions

    Utils = {
        settings: {
            debug: true,
            meta: {},
            init: function() {
                
                $('meta[name^="app-"]').each(function(){
	            	Utils.settings.meta[ this.name.replace('app-','') ] = this.content;
	            });
                
            },
            workingHours:[
            	// Antier
            	[Date.today().addDays(-2).set({hour:6,minute:30}),Date.today().addDays(-2).set({hour:10,minute:30})],
            	[Date.today().addDays(-2).set({hour:10,minute:30}),Date.today().addDays(-2).set({hour:14,minute:30})],
            	[Date.today().addDays(-2).set({hour:14,minute:30}),Date.today().addDays(-2).set({hour:18,minute:30})],
            	[Date.today().addDays(-2).set({hour:18,minute:30}),Date.today().addDays(-2).set({hour:22,minute:30})],
            	[Date.today().addDays(-2).set({hour:22,minute:30}),Date.today().addDays(-1).set({hour:2,minute:30})],
            	// Ayer
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
            	[Date.today().set({hour:18,minute:30}),Date.today().set({hour:22,minute:30})],
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
		tokenizeSiLens: function () {
			for (var o in App.data.series.SiLens) {
				ws = App.data.series.SiLens[o]; //Working Serie
				ws.yieldData = ws.yieldData || [];
				for (var i = 0; i < ws.data.length; i++) {
					var h = _matchHour(ws.data[i][0]);
					// _log(h);
					if (typeof ws.yieldData[h] == 'undefined') {
						ws.yieldData[h] = {h:h,total:0,pass:0,fail:0,meta:0,ciclo:0,yieldProd:0,yieldProc:0,sumTiempo:0};
					};

					ws.yieldData[h]['total'] = 1 + ws.yieldData[h]['total'];
					
					if (ws.data[i][2] == "P") {
						ws.yieldData[h]['pass'] = 1 + ws.yieldData[h]['pass'];
					} else {
						ws.yieldData[h]['fail'] = 1 + ws.yieldData[h]['fail'];
					};
					// ws.yieldData[h]['total'] = 1 + ws.yieldData[h]['total'];
					// ws.yieldData[h]['total'] = 1 + ws.yieldData[h]['total'];
					// ws.yieldData[h]['total'] = ws.yieldData[h]['total']++;
					// _log([ws.name,ws.data[i][0],ws.data[i][1],ws.data[i][2]]);
					// _log([(new Date(ws.data[i][0])),_matchHour(ws.data[i][0])]);
				};
			};
			_log(App.data.series)
			ko.applyBindings(App.data);
		},
		matchHour:function (hour) {
			var h = new Date(hour);
			var o = Utils.settings.workingHours;
			for (var i = 0; i < o.length; i++) {
				var wh = o[i]
				var test = h.between(wh[0],wh[1]);
				if (test) {
					// return [i,wh[1],wh[0]];
					return i;
				};
			};
			return -1;
		}
    };
    var _log = Utils.log;
    var _matchHour = Utils.matchHour;
	
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
    	data: {},
        logic: {},
        init: function() {

            Utils.settings.init();
            Events.init();
            Utils.tokenizeSiLens();
            
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