var Sparky = Sparky || (function($) {

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
                
            }
        },
        cache: {
            window: window,
            document: document
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
        parseRoute: function(input) {
	        
		    var delimiter = input.delimiter || '/',
		        paths = input.path.split(delimiter),
		        check = input.target[paths.shift()],
		        exists = typeof check != 'undefined',
		        isLast = paths.length == 0;
		    input.inits = input.inits || [];
		    
		    if (exists) {
		    	if(typeof check.init == 'function'){
	    			input.inits.push(check.init);
	    		}
		    	if (isLast) {
		            input.parsed.call(undefined, {
		                exists: true,
		                type: typeof check,
		                obj: check,
		                inits: input.inits
		            });
		        } else {
		            Utils.parseRoute({
		                path: paths.join(delimiter), 
		                target: check,
		                delimiter: delimiter,
		                parsed: input.parsed,
		                inits: input.inits
		            });
		        }
		    } else {
		        input.parsed.call(undefined, {
		            exists: false
		        });
		    }
		},
		route: function(){
            
            Utils.parseRoute({
	            path: Utils.settings.meta.route,
			    target: Routes,
			    delimiter: '/',
			    parsed: function(res) {
			    	if(res.exists && res.type=='function'){
			    		if(res.inits.length!=0){
			        		for(var i in res.inits){
			        			res.inits[i].call();
			        		}
			        	}
			        	res.obj.call();
			        }
			    }
	        });
            
        } 
    };
    var _log = Utils.log;
	
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
        logic: {},
        init: function() {
            
            Utils.settings.init();
            Events.init();   
            Utils.route();    
            
        }
    };
    
    Public = {
        init: App.init  
    };

    return Public;

})(window.jQuery);

jQuery(document).ready(Sparky.init);