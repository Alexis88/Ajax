/**
 * Función Ajax
 * 
 * 
 * Esta función, basada en la estructura del método jQuery.ajax(), tiene por finalidad facilitar 
 * el proceso de realización de peticiones asíncronas, con algunas de las facilidades que proporciona 
 * el método de jQuery, pero sin la necesidad de importar toda la librería.
 * 
 * La versión 1.0 se basa en el objeto XMLHttpRequest, mientras que esta versión 2.0 se basa en el método Fetch.
 * 
 *
 * @author	Alexis López Espinoza
 * @param	{opciones}      Object          Objeto literal con los datos para realizar la petición
 * @return	{response}      Promise         Respuesta del método Fetch
 * @this	{Ajax}          Function        La función Ajax
 * @version	2.0
 */

 /* FUNCIÓN AJAX */

"use strict";

let Ajax = function(opciones){
    //Si el objeto "this" no es una instancia de la función Ajax, se retorna una llamada a dicha función con el operador "new" para poder devolver una instancia de la función
    if (!(this instanceof Ajax)) return new Ajax(opciones);

    //Se inicializa el proceso
    this.init(opciones);

    //Se devuelve la función Ajax como instancia
    return this;
};

/************************************* MÉTODOS DINÁMICOS *************************************/
Ajax.prototype = {
    //Comodín que permite o impide continuar con los procesos (true: permitir | false: impedir)
    flag: true,

    //Lista de métodos HTTP válidos
    httpMethods: ["GET", "POST", "PUT", "DELETE", "HEAD"],

    //Lista de tipos de respuesta válidos
    responseTypes: ["HTML", "JSON", "TEXT", "XML"],

    //Opciones que se enviarán como segundo argumento al método Fetch
    options: {},

    //Método que inicializa todo el proceso
    init: function(opciones){
        /* LA URL DE DESTINO */

        //Si es una cadena no vacía, se la establece la URL recibida
        if (Ajax.typeOf(opciones.url, "string") && opciones.url.length){
            this.url = opciones.url.toLowerCase();
        }
        else{
            return false;
        }


        /* EL MÉTODO DE ENVÍO */

        //Si se asigna un método, si es una cadena no vacía y si es un HTTP método válido, se establece el método recibido, caso contrario, se establece el método HTTP GET
        if (opciones.method 
            && Ajax.typeOf(opciones.method, "string") 
            && opciones.method.length 
            && this.httpMethods.indexOf(opciones.method.toUpperCase()) > -1){
            this.method = opciones.method.toUpperCase();
        }
        else{
            this.method = "GET";
        }


        /* EL TIPO DE RESPUESTA A RECIBIR */

        //Si es una cadena no vacía y si es uno de los tipos de respuesta válidos, se establece el tipo de respuesta recibida, caso contrario, se establece el tipo TEXT
        if (Ajax.typeOf(opciones.type, "string") 
            && opciones.type.length 
            && this.responseTypes.indexOf(opciones.type.toUpperCase()) > -1){
            this.type = opciones.type;
        }
        else{
            this.type = "TEXT";
        }


         /* LAS CABECERAS A ESTABLECER */

        //Si es una cadena no vacía, se establece como cabecera. Si no se recibe nada o la cadena está vacía, no se establecen cabeceras
        if (Ajax.typeOf(opciones.headers, "string") && opciones.headers.length){
            this.headers = opciones.headers;
        }
        else{
            this.headers = false;
        }


        /* LOS DATOS A ENVIAR */

        //Si la URL no contiene una cadena de consulta y si se recibieron datos, se serializan los datos recibidos y se los establece, caso contrario, se asigna el valor "false"
        if (opciones.url.indexOf("?") < 0 && opciones.data){
            this.data = Ajax.serialize(opciones.data);
        }
        else{
            this.data = null;
        }


        /* SE INSERTAN VALORES EN EL OBJETO CON LAS OPCIONES PARA CONFIGURAR EL MÉTODO FETCH */

        //El método HTTP
        this.options.method = this.method;

        //Las cabeceras
        if (this.headers){
            this.options.headers = {
                "Content-Type": this.headers
            };
        }

        //Los datos
        this.options.body = this.data;


        /* ENVÍO DE LOS DATOS */

        //Si el comodín permite enviar los datos, se realiza el envío
        if (this.flag){
            this.send();
        }

        //Se devuelve una instancia del método Fetch
        return this;
    },

    send: function(){
        //Se configura el método Fetch y se ejecuta el envío
        this.xhr = fetch(this.url, this.options);

        //Se devuelve una instancia del método Fetch
        return this;
    },

    done: function(callback){
        //En caso de éxito, se recibe la respuesta según el tipo establecido
        this.xhr.then((response) => {
            //Si se recibió la respuesta exitosamente
            if (response.ok >= 200 && response.ok <= 299){
                switch (this.type){
                    case "HTML": case "TEXT": default:
                        response.text().then((htmlText) => callback(htmlText));
                        break;

                    case "JSON":
                        response.json().then((json) => callback(json));
                        break;

                    case "XML":
                        response.text().then((xml) => callback(new window.DOMParser().parseFromString(xml, "text/xml")));
                        break;
                }
            }
            else{
                console.log(response.statusText);
            }
        });

        //Se devuelve una instancia del método Fetch
        return this;
    },

    fail: function(callback){
        //En caso de error, se muestra un mensaje acerca del error producido
        this.xhr.catch((error) => {
            callback(error);
        });

        //Se devuelve una instancia del método Fetch
        return this;
    }
};

/************************************* MÉTODOS ESTÁTICOS *************************************/

//Da formato a los datos recibidos para ser enviados al lado del servidor
Ajax.serialize = function (elemento){
    //Si se trata de un Array
    if (Ajax.typeOf(elemento, "array")){
        let data = [];
            
        //Se recorre el array y se asigna un par "variable=valor" al array "data"
        for (let i = 0, l = elemento.length; i < l; i++){
            data.push("array[]=" + elemento[i]);
        }

        //Se devuelve una cadena de consulta a partir del array "data"
        return data.join("&")
    }

    //Si se trata de un Object
    if (Ajax.typeOf(elemento, "object")){
        let data = [];
            
        //Se recorre el objeto y se asigna un par "variable=valor" al array "data"
        for (let prop in elemento){
             data.push(prop + "[]=" + elemento[prop]);
        }

        //Se devuelve una cadena de consulta a partir del array "data"
        return data.join("&")
    }

    //Si se trata de un Formulario
    if (Ajax.typeOf(elemento, "form")){
        let data = new FormData(), aux = true;

        //Se recorre el conjunto de elementos del formulario
        for (let i = 0, f = elemento.elements, l = f.length; i < l; i++){
            //Si es un radiobox o checkbox y no está marcado, se ignora
            if (["checkbox", "radio"].indexOf(f[i].type) > -1) continue;

            //Se establece como cabecera el valor de formulario (mientras no haya un elemento File)
            if (aux){
                Ajax.headers = "application/x-www-form-urlencoded";
            }

            //Si es un elementos File, se recorre el conjunto de archivos que contiene
            if (f[i].type == "file"){
                //Si solo es un archivo, se lo añade directamente
                if (f[i].files.length === 1){
                    data.append(f[i].name, f[i].files[0]);
                }
                //Caso contrario, se añade todos los archivos
                else{
                    for (let j = 0, m = f[i].files.length; j < m; j++){
                        data.append(f[i].name + j, f[i].files[j]);
                    }
                }

                //Se quitan las cabeceras
                Ajax.headers = false;

                //Ya no se puede añadir cabeceras
                aux = false;

                //Se pasa a la siguiente iteración
                continue;
            }

            //Si es un elemento con atributo "required" y está vacío, se detiene el proceso
            if (f[i].required && !f[i].value.length){
                Ajax.flag = false;
                return false;
            }

            //Si se trata de cualquier otro elemento, se añade el valor
            data.append(f[i].name, f[i].value);
        }

        //Se devuelven los datos
        return data;
    }

    //Si se trata de un JSON
    if (Ajax.typeOf(elemento, "json")){
        return JSON.stringify(elemento);
    }

    //Si se trata de una cadena
    if (Ajax.typeOf(elemento, "string")){
        return elemento;
    }        
};

Ajax.typeOf = (elemento, tipo) => {
    switch (tipo.toUpperCase()){
        case "ARRAY":
            return {}.toString.call(elemento) == "[object Array]";
            break;

        case "OBJECT":
            return {}.toString.call(elemento) == "[object Object]";
            break;

        case "FUNCTION":
            return {}.toString.call(elemento) == "[object Function]";
            break;            

        case "FORM":
            return {}.toString.call(elemento) == "[object HTMLFormElement]";
            break;    

        case "NUMBER":
            return {}.toString.call(elemento) == "[object Number]";
            break;

        case "STRING":
            return {}.toString.call(elemento) == "[object String]";
            break;

        case "JSON":
            let json = Ajax.typeOf(elemento, "string") ? elemento : JSON.stringify(elemento);

            try{
                json = JSON.parse(json);
            }
            catch{
                return false;
            }

            return Ajax.typeOf(json, "object") && json !== null;
            break;

        default:
            return false;
            break;
    }
};
