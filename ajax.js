/**
 * Ajax module
 * 
 * @author Alexis López
 */

var ajax = {
    xhr: window.XMLHttpRequest ? 
         new XMLHttpRequest() : 
         new ActiveXObject("Microsoft.XMLHTTP") || 
         new ActiveXObject("Msxml2.XMLHTTP"),

    metodo: null,
    destino: null,
    datos: null,
    usuario: null,
    clave: null,
    respuesta: null,

    ejecutar: function(param){
        /**
         * @param	string		metodo
         * @param	string		destino
         * @param	NodeList	datos
         * @param	string		usuario
         * @param	string		clave
         * @return  string      XHR response
        */
    	this.metodo = param.metodo || "GET";
    	this.destino = param.destino;
    	this.datos = param.datos || null;
    	this.asincrono = param.asincrono || true;
    	this.usuario = param.usuario || null;
    	this.clave = param.clave || null;    	
    	this.preparar();
    	this.xhr.open(this.metodo, this.destino, this.asincrono, this.usuario, this.clave);
    	this.cabecera(param.cabecera);
    	this.xhr.addEventListener("readystatechange", function(){
    		if (this.readyState < 4){
    			ajax.respuesta = null;
    		}
    		else{
    			switch (this.status){
    				case 200:
    					switch (param.tipo.toUpperCase()){
		    				case "HTML":
		    					ajax.respuesta = this.responseText;
		    					break;
		    				case "XML":
		    					ajax.respuesta = this.responseXML;
		    					break;
		    				case "JSON":
		    					ajax.respuesta = JSON.parse(this.responseText);
		    					break;
		    			}
    					break;
    				case 404:
    					ajax.respuesta = "Error 404: La página no existe";
    					break;
    				default:
    					ajax.respuesta = "Se ha producido un error: " + this.status;
    					break;
    			}
    		}
    	}, false);
    	this.xhr.send(this.datos || null);
    	return this;
    },

    cabecera: function(param){
    	this.xhr.setRequestHeader("Content-Type", param || "application/x-www-form-urlencoded");
    },

    preparar: function(){
    	if (this.destino.indexOf("?") < 0){
    		if (typeof this.datos === "string"){
    			this.destino += "?" + this.datos;
    		}
    		else if (typeof this.datos === "object"){
    			this.datos = this.serializar(this.datos);
    		}
    	}
    	else{
    		this.datos = null;
    	}
    },

    serializar: function(param){
    	if (/HTMLFormControlsCollection/.test({}.toString.call(param))){
    		for (var i = 0, l = param.length, a = []; i < l; a.push(param[i].name + "=" + param[i].value), i++);
    		return a.join("&");
    	}

    	if (/HTMLFormElement/.test({}.toString.call(param))){
    		for (var i = 0, param = param.elements, l = param.length, a = []; i < l; a.push(param[i].name + "=" + param[i].value), i++);
    		return a.join("&");	
    	}

    	if (typeof param === "object"){
    		var a = [];
    		for (var prop in param){
    			a.push(prop + "=" + param[prop]);
    		}
    		return a.join("&");
    	}
    },

    listo: function(fn){
    	var temp = setInterval(function(){
    		if (ajax.respuesta){
    			fn(ajax.respuesta);
    			clearInterval(temp);
    		}
    	}, 1);
    },

    cargando: function(fn){
    	if (this.respuesta == null){
    		fn();
    	}
    	return this;
    },

    inicio: function(fn){
    	this.xhr.addEventListener("loadstart", fn, false);
    	return this;
    },

    progreso: function(fn){
    	this.xhr.addEventListener("progress", fn, false);
    	return this;
    },

    completo: function(fn){
    	this.xhr.addEventListener("load", fn, false);	
    	return this;
    },

    error: function(fn){
    	this.xhr.addEventListener("error", fn, false);	
    	return this;
    },

    abortar: function(fn){
    	this.xhr.addEventListener("abort", fn, false);
    	return this;
    },

    inicioSubida: function(fn){
    	this.xhr.upload.addEventListener("loadstart", fn, false);
    	return this;
    },

    progresoSubida: function(fn){
    	this.xhr.upload.addEventListener("progress", fn, false);
    	return this;
    },

    completoSubida: function(fn){
    	this.xhr.upload.addEventListener("load", fn, false);	
    	return this;
    },

    errorSubida: function(fn){
    	this.xhr.upload.addEventListener("error", fn, false);	
    	return this;
    },

    abortarSubida: function(fn){
    	this.xhr.upload.addEventListener("abort", fn, false);
    	return this;
    },
};
