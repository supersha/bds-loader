;(function(_se){

    _se.Module = _se.Module || { 
		_modules : {},
		_loadedModules : {},
		_moduleDeps : {},
		_config : { baseUri : "" }
	};

	function loadjs(jspath,callback){
		var script = document.createElement('script');
		script.onload = script.onreadystatechange = script.onerror = function (){
			if (script && script.readyState && /^(?!(?:loaded|complete)$)/.test(script.readyState)) return;
			script.onload = script.onreadystatechange = script.onerror = null;
			callback && callback();
		}
		script.src = jspath;
		document.getElementsByTagName("head")[0].appendChild(script);
	}

	function loadModule(module){
		var realUri = _se.Module._config.baseUri + _se['_fileMap'][module];
		loadjs(realUri,function(){
			_se.Module._loadedModules[module] = _se.Module._moduleDeps[module]['deps'].length ? null : 1;
			checkDeps();
		});
	}

	function createModuleDepsObject(moduleName){
		var module = _se.Module._moduleDeps[moduleName];
		if(!module){
			module = _se.Module._moduleDeps[moduleName] = {};
			module['deps'] = [];
			module['callback'] = [];
			if(moduleName.indexOf("|") === -1){ loadModule(moduleName); }
		}
		return module;
	}

	function getDepsReverseKeys(){
		var moduleKeys = [];
		for(var key in _se.Module._moduleDeps){
			moduleKeys[key.indexOf("|") !== -1 ? "unshift" : "push"](key);
		}
		return moduleKeys.reverse();
	}

	function checkDeps(){
		var moduleKeys = getDepsReverseKeys(),
			moduleName,
			applyModules,
			currentDepsModule;

		for(var n = 0, ll = moduleKeys.length; n < ll; n+=1){
			moduleName = moduleKeys[n];
			currentDepsModule = _se.Module._moduleDeps[moduleName];
			applyModules = [];

			for(var i = 0, len = currentDepsModule['deps'].length; i < len; i+=1){
				if(!_se.Module._loadedModules[currentDepsModule['deps'][i]]) {
					_se.Module._loadedModules[moduleName] = null;
					break;
				}
				_se.Module._loadedModules[moduleName] = 1;
				applyModules.push(_se.Module._modules[currentDepsModule['deps'][i]]);
			}
			if(!_se.Module._loadedModules[moduleName]){ continue; }
			if(currentDepsModule['definition']){
				_se.Module._modules[moduleName] = currentDepsModule['definition'].apply(_se.Module,applyModules);
				currentDepsModule['definition'] = null;
			}

			for(var i = 0,len = currentDepsModule['callback'].length; i < len; i+=1){
				currentDepsModule['callback'][i].apply(_se.Module,applyModules);
			}
			currentDepsModule['callback'] = [];
		}
	}

	var define = _se.define = function(module,dependencies,definition){
		var moduleDep = _se.Module._moduleDeps[module];
		dependencies = dependencies || [];

		moduleDep['definition'] = definition;
		for(var i = 0, len = dependencies.length; i < len; i+=1){
			moduleDep['deps'].push(dependencies[i]);
			use(dependencies[i]);
		}
	}

	var use = _se.use = function(module,factory){
		var currentModule,
			loadModules,
			moduleName;

		if(typeof module === "string"){ module = [module]; }

		moduleName = module.join("|");
		if(module.length === 1){ moduleName += "|"; }
		loadModules = module.concat(moduleName);

		for(var i = 0, len = loadModules.length; i < len; i+=1){
			 currentModule = createModuleDepsObject(loadModules[i]);
		}
		currentModule['deps'] = module;

		factory && currentModule['callback'].push(factory);	
		if(_se.Module._loadedModules[moduleName]){ checkDeps(); }
	}

})(bds.se);
