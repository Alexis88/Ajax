/**
 * Clase Ajax
 *
 * @author	Alexis López Espinoza
 * @param	{object}	obj 		Objeto literal con los datos para realizar la petición
 * @return	{XHR} 		object 		Objeto XMLHttpRequest
 * @this	{Ajax} 					La clase Ajax
 * @version	1.0
 */

/***************************************** CLASE AJAX *****************************************/
"use strict";

var Ajax = function(obj){
	if (!(this instanceof Ajax)) return new Ajax(obj);
	this.prepare(obj);
	this.exec();
	return this;
};

/************************************* MÉTODOS DINÁMICOS *************************************/
Ajax.prototype = {
	prepare: function(obj){
		var aux;
		this.xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
		this.url = obj.url;
		this.method = obj.method ? obj.method.toUpperCase() : "GET";
		this.async = obj.async || true;
		this.data = obj.data || null;
		this.type = obj.type ? obj.type.toUpperCase() : "HTML";
		this.header = obj.header || "application/x-www-form-urlencoded";

		if (this.method == "GET"){
			if (typeof this.data == "string"){
				this.url += "?" + this.data;
			}
			else if (this.data && typeof this.data == "object"){
				aux = [];
				for (var prop in this.data){
					aux.push(prop + "=" + this.data[prop]);
				}
				this.url += "?" + aux.join("&");
			}			
			this.data = null;
		}
		else{
			if ({}.toString.call(this.data) === "[object Object]"){
				aux = [];
				for (var prop in this.data){
					aux.push(prop + "=" + this.data[prop]);
				}
				this.data = aux.join("&");
			}
		}
	},

	exec: function(){
		var self = this;
		if (window.Promise){
			this.promise = new Promise(function(resolve, reject){
				self.cross(resolve, reject);
			});
		}
		else{
			self.cross();
		}
	},

	cross: function(d, f){
		var self = this;
		this.xhr.open(this.method, this.url, this.async);
		this.xhr.setRequestHeader("Content-Type", this.header);
		this.xhr.send(this.data);
		this.xhr.addEventListener("load", function(){
			if (this.status == 200){
				switch (self.type){
					case "XML":
						self.response = this.responseXML;
						break;
					case "JSON":
						self.response = JSON.parse(this.responseText);
						break;
					case "HTML": default:
						self.response = this.responseText;
						break;
				}
				if (window.Promise) d(self.response);
			}
			else{
				self.response = this.statusText;
				if (window.Promise) f(self.response);
			}
		}, false);
		this.xhr.addEventListener("error", function(){
			self.response = this.statusText;
			if (window.Promise) f(self.response);
		});
	},

	done: function(callback){
		var self = this;
		if (window.Promise){
			this.promise.then(function(response){
				callback(response);	
			});			
		}
		else{
			this.xhr.addEventListener("load", function(){
				if (this.status == 200){
					switch (self.type){
						case "XML":
							self.response = this.responseXML;
							break;
						case "JSON":
							self.response = JSON.parse(this.responseText);
							break;
						case "HTML": default:
							self.response = this.responseText;
							break;
					}					
				}
				else{
					self.response = this.statusText;
				}
				callback(self.response);
			}, false);
		}
		return this;
	},

	fail: function(callback){
		var self = this;
		if (window.Promise){
			this.promise.catch(function(errorText){
				callback(errorText);
			});			
		}
		else{
			this.xhr.addEventListener("error", function(){
				self.response = this.statusText
				callback(self.response);
			}, false);
		}
		return this;
	}
};

/************************************* MÉTODOS ESTÁTICOS *************************************/
Ajax.serialize = function(form){
	for (var i = 0, l = form.elements.length, data = []; i < l; data.push(form.elements[i].name + "=" + form.elements[i].value, i++));
	return data.join("&");
};

/*************************************** FORMA DE USO ***************************************
Ajax({
	url: La ruta del archivo de destino o el valor del atributo "action" del formulario.
	method: El método HTTP o el valor del atributo "method" del formulario.
	type: Tipo de datos a recibir como respuesta a la petición. Por defecto es HTML.
	data: Los datos a enviar. Pueden estar dados como una cadena de texto o como un objeto 
		  literal. 

		  Cadena de texto: "foo=bar&bin=bar"
		  Objeto literal: {
		  	  foo: bar,
		  	  bin: baz
		  }

		  También puede usar el método .serialize() para serializar 
		  los datos del formulario.
	async: Valor lógico que determina si la petición será asíncrona o no. Por defecto es true.
	header: Cabecera de la petición. Por defecto es "application/x-www-form-urlencoded".
})
	.done(function(response){
		Método que ejecuta una llamada de retorno con la respuesta de la petición cuando esta 
		  se completa y es exitosa.
	})

	.fail(function(errorText){
		Método que ejecuta una llamada de retorno con el mensaje de error cuando se produce 
		  uno en la petición o cuando esta se completa pero la respuesta no es exitosa.
	})

La siguiente forma también es válida:

var peticion = Ajax({valores});
peticion.done(llamada de retorno(respuesta));
peticion.fail(llamada de retorno(mensaje de error));

Uso del método .serialize():

Solo hay que pasarle como argumento al propio formulario: Ajax.serialize(formulario).
*********************************************************************************************/
