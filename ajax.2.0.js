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
 * Forma de uso:
 * 
 * Ajax({
 *     url: "La ruta de destino",
 *     method: "El método de envío (por defecto: GET)",
 *     data: Los datos a enviar, (si no se adjuntan, no se considera este atributo)
 *     type: "El tipo de respuesta a recibir (por defecto: TEXT)",
 *     headers: [{name: "Nombre de la cabecera", value: "Valor de la cabecera"}],
 *     config: { //Otros valores de configuración de la petición
 *         mode: Por defecto es CORS,
 *         cache: Por defecto es DEFAULT,
 *         credentials: Por defecto es SAME-ORIGIN,
 *         redirect: Por defecto es FOLLOW,
 *         referrer: Por defecto es INIT,
 *         referrerPolicy: Por defecto es NO-REFERRER-WHEN-DOWNGRADE,
 *         keepalive: Por defecto es FALSE
 *     }
 * }).done(function(respuesta){
 *     //Aquí se puede tratar la respuesta del servidor
 * }).fail(function(error){
 *     //Aquí se puede tratar el mensaje del error producido
 * });
 * 
 *
 * @author	Alexis López Espinoza
 * @param	{opciones}	 Object 		Objeto literal con los datos para realizar la petición
 * @return	{response}   Promise 		Respuesta del método Fetch
 * @this	{Ajax}       Function		La función Ajax
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
    //Lista de métodos HTTP válidos
    httpMethods: ["GET", "POST", "PUT", "DELETE", "HEAD"],

    //Lista de tipos de respuesta válidos
    responseTypes: ["HTML", "JSON", "TEXT", "XML"], 

    //Método que inicializa todo el proceso
    init: function(opciones){
        //Comodín que permite o impide continuar con los procesos (true: permitir | false: impedir)
        this.flag = true;

        //Opciones que se enviarán como segundo argumento al método Fetch
        this.options = {};


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
        if (Ajax.typeOf(opciones.headers, "array") && opciones.headers.length){
            this.headers = opciones.headers;
        }
        else{
            this.headers = [];
        }


        /* LOS DATOS A ENVIAR */

        //Si la URL no contiene una cadena de consulta y si se recibieron datos, se serializan los datos recibidos y se los establece, caso contrario, se asigna el valor "false"
        if (opciones.url.indexOf("?") < 0 && opciones.data){
            //Se pasan como argumentos los datos, el método y la instancia actual de la función
            this.data = Ajax.serialize(opciones.data, this.method, this);

            //Si el método de envío no permite adjuntar los datos por separado
            if (["GET", "HEAD"].indexOf(this.method) > -1){
                this.url += "?" + this.data;
                this.data = null;
            }
        }
        else{
            this.data = null;
        }


        /* SE INSERTAN VALORES EN EL OBJETO CON LAS OPCIONES PARA CONFIGURAR EL MÉTODO FETCH */

        //El método HTTP
        this.options.method = this.method;



        //Las cabeceras (si se permite añadir)
        if (this.headers.length && this.letHeads){
            this.options.headers = {};
            this.headers.forEach((header) => {
                this.options.headers[header.name] = header.value;
            });
        }
        else{
            delete this.options.headers;
        }


        //Los datos
        if (this.data !== null){
            //Si hay datos para enviar, se asignan a la propiedad "body"
            this.options.body = this.data;
        }


        //Otras opciones de configuración
        
        //Opciones con sus valores por defecto
        let opts = [
            {opt: "mode", def: "cors"},
            {opt: "cache", def: "default"},
            {opt: "credentials", def: "same-origin"},
            {opt: "redirect", def: "follow"},
            {opt: "referrer", def: "init"},
            {opt: "referrerPolicy", def: "no-referrer-when-downgrade"},
            {opt: "keepalive", def: false}
        ];
            
        //Se recorre el array de opciones
        opts.forEach((o) => {
            //Si se ha recibido un conjunto de opciones de configuración y la opción de la iteración actual se encuentra en dicho conjunto, se lo establece
            if (opciones.config && opciones.config.hasOwnProperty(o.opt)){
                this.options[o.opt] = opciones.config[o.opt];
            }
            //Caso contrario, se establece el valor por defecto
            else{
                this.options[o.opt] = o.def;
            }
        });


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
Ajax.serialize = function (elemento, metodo, self){
    //Objeto o array que almacenará los datos a enviar, y el comodín que decidirá qué datos se devolverán
    let dataBody = new FormData(), dataNoBody = [], flag;

    //Si se trata de un Array
    if (Ajax.typeOf(elemento, "array")){            
        //Se recorre el array y se asigna un par "variable=valor" al array "data"
        for (let i = 0, l = elemento.length; i < l; i++){
            //Si se recibió un método de envío y es GET o HEAD o no se recibió un método
            if ((metodo && ["GET", "HEAD"].indexOf(metodo.toUpperCase()) > -1) || !metodo){
                dataNoBody.push("array[]=" + elemento[i]);
                flag = "no";
            }
            //Si el método de envío es POST, PUT O DELETE
            else{
                dataBody.append("array[]=", elemento[i]);
                flag = "yes";
            }
        }

        //Se devuelven los datos, según sea el método HTTP elegido (Par: GET o HEAD | Impar o sin método: POST, PUT O DELETE)
        if (flag == "no"){
            return dataNoBody.join("&");
        }
        else{
            let parsedData = new URLSearchParams(dataBody);
            return parsedData;
        }
    }

    //Si se trata de un Object
    if (Ajax.typeOf(elemento, "object")){
        //Se recorre el objeto y se asigna un par "variable=valor" al array "data"
        for (let prop in elemento){
            //Si se recibió un método de envío y es GET o HEAD o no se recibió un método
            if ((metodo && ["GET", "HEAD"].indexOf(metodo) > -1) || !metodo){
                dataNoBody.push(prop + "=" + elemento[prop]);
                flag = "no";
            }
            //Si el método de envío es POST, PUT O DELETE
            else{
                dataBody.append(prop + "=", elemento[prop]);
                flag = "yes";
            }
        }

        //Se devuelven los datos, según sea el método HTTP elegido (Par: GET o HEAD | Impar o sin método: POST, PUT O DELETE)
        if (flag == "no"){
            return dataNoBody.join("&");
        }
        else{
            let parsedData = new URLSearchParams(dataBody);
            return parsedData;
        }
    }

    //Si se trata de un Formulario
    if (Ajax.typeOf(elemento, "form")){
        //Si se ha recibido una instancia de la función
        if (self) self.letHeads = true;

        //Se recorre el conjunto de elementos del formulario
        for (let i = 0, f = elemento.elements, l = f.length; i < l; i++){
            //Si es un radiobox o checkbox y no está marcado, se ignora
            if (["checkbox", "radio"].indexOf(f[i].type) > -1) continue;  

            //Si es un elementos File, se recorre el conjunto de archivos que contiene
            if (f[i].type == "file"){
                //Si se recibió un método de envío y es GET o HEAD o no se recibió un método
                if ((metodo && ["GET", "HEAD"].indexOf(metodo) > -1) || !metodo){
                    flag = "no";
                    continue;                    
                }
                //Si el método de envío es POST, PUT O DELETE
                else{
                    //Si solo es un archivo, se lo añade directamente
                    if (f[i].files.length > 0 && f[i].files.length < 2){
                        dataBody.append(f[i].name, f[i].files[0]);
                    }
                    //Caso contrario, se añade todos los archivos
                    else{
                        for (let j = 0, m = f[i].files.length; j < m; j++){
                            dataBody.append(f[i].name + "[]", f[i].files[j]);
                        }
                    }

                    flag = "yes";
                }

                //Se quitan las cabeceras
                if (self) self.headers = [];

                //Ya no se puede añadir cabeceras
                if (self) self.letHeads = false;

                //Se pasa a la siguiente iteración
                continue;
            }

            //Si es un elemento con atributo "required" y está vacío, se detiene el proceso
            if (f[i].required && !f[i].value.length){
                if (self) self.flag = false;
                return false;
            }

            //Si se trata de cualquier otro tipo de elemento, se añade el valor
            //Si se recibió un método de envío y es GET o HEAD o no se recibió un método
            if ((metodo && ["GET", "HEAD"].indexOf(metodo) > -1) || !metodo){
                dataNoBody.push(f[i].name + "=" + f[i].value);
                flag = "no";
            }
            //Si el método de envío es POST, PUT O DELETE
            else{
                dataBody.append(f[i].name, f[i].value);
                flag = "yes";
            }
        }

        //Se establece como cabecera el valor de formulario (mientras no haya un elemento File)
        if (self && self.letHeads){
            self.headers.push({name: "Content-type", value: "application/x-www-form-urlencoded"});
        }

        //Se devuelven los datos, según sea el método HTTP elegido (Par: GET o HEAD | Impar o sin método: POST, PUT O DELETE)
        if (flag == "no"){
            return dataNoBody.join("&");
        }
        else{
            let parsedData = new URLSearchParams(dataBody);
            return parsedData;
        }
    }

    //Si se trata de un JSON
    if (Ajax.typeOf(elemento, "json")){
        //Si se recibió un método de envío y es GET o HEAD o no se recibió un método
        if ((metodo && ["GET", "HEAD"].indexOf(metodo) > -1) || !metodo){
            return "json=" + JSON.stringify(elemento);
        }
        //Si el método de envío es POST, PUT O DELETE
        else{
            dataBody.append("json", JSON.stringify(elemento));
            let parsedData = new URLSearchParams(dataBody);
            return parsedData;
        }
    }

    //Si se trata de una cadena
    if (Ajax.typeOf(elemento, "string")){
        //Si no es una cadena de consulta
        if (elemento.indexOf("=") < 0) return null;

        let arr = elemento.split("&"), aux;

        for (let i = 0, l = arr.length; i < l; i++){
            aux = arr[i].split("=");

            //Si se recibió un método de envío y es GET o HEAD o no se recibió un método
            if ((metodo && ["GET", "HEAD"].indexOf(metodo) > -1) || !metodo){
                dataNoBody.push(aux[0] + "=" + aux[1]);
                flag = "no";
            }
            //Si el método de envío es POST, PUT O DELETE
            else{
                dataBody.append(aux[0], aux[1]);
                flag = "yes";
            }
        }

        //Se devuelven los datos, según sea el método HTTP elegido (Par: GET o HEAD | Impar o sin método: POST, PUT O DELETE)
        if (flag == "no"){
            return dataNoBody.join("&");
        }
        else{
            let parsedData = new URLSearchParams(dataBody);
            return parsedData;
        }
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
