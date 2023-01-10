/*Esta aplicación tiene como objetivo brindar la información correspondiente a personas
que haya resultado positiva para COVID, en función de los siguientes parámetros:
- Si tiene esquema de vacunación primario completo (es decir más de una dosis si corresponde)
- Si tuvo síntomas (es decir, que tuvo una FIS (fecha de inicio de síntomas))
- Su FTM (fecha de toma de muestra)
En función de lo que el usuario decida, se deben pedir los datos del paciente 
y se debe indicar la fecha probable de alta.*/


const consultarPacientes = () => {
    const almacenados = JSON.parse(localStorage.getItem("listadoPacientes"));
    const pacientes = [];

    if (!!almacenados) {//Validamos que haya datos almacenados
        for (const x of almacenados) {
            let paciente = new Paciente();
            paciente.dni = x.dni;
            paciente.nombre = x.nombre;
            paciente.esquemaVacunacion = new EsquemaVacunacion(x.esquemaVacunacion.vacunas);
            paciente.fis = x.fis;
            paciente.ftm = x.ftm;
            pacientes.push(paciente);
        }
    }
    return pacientes;
}

const cargarPacientes = () => {
    const pacientes = consultarPacientes();
    let seccion = document.getElementById("section-pacientes");

    
    //Generamos el código para sumar el paciente a la sección
    for (const paciente of pacientes){
        let articulo = document.createElement('article');
        articulo.className = "paciente";
        articulo.innerHTML += paciente.generarHTMLPaciente();

        //Incoporamos al paciente
        seccion.appendChild(articulo);
    }
}

const almacenarPacientes = (paciente) => {
    const pacientes = consultarPacientes();
    pacientes.push(paciente);
    localStorage.setItem("listadoPacientes",JSON.stringify(pacientes));

    $.ajax({
        type: "POST",
        url: "https://my-json-server.typicode.com/kitsunito/proyectofinaljs/pacientes/",
        data: paciente,
        dataType: "dataType",
        success: function (response) {
            console.log(response);
        }
    });
    
}

//Función para la carga de vacunas en el localStorage
const cargarTiposVacunas = () => {
    $.ajax({
        type: "GET",
        url: "https://my-json-server.typicode.com/kitsunito/proyectofinaljs/vacunas/",
        success: function (response) {
            localStorage.setItem("tiposVacunas",JSON.stringify(response))
        }
    });
}

//Función para el agregado de pacientes
const covid19CBA = () => {
    //Validamos que el formulario esté cargado
    if (validarFormulario()){
        //Buscamos los campos del formulario
        let formNombre = document.getElementById("txtnombre");
        let formDNI = document.getElementById("txtdni");
        let formFTM = document.getElementById("txtFTM");
        let formFIS = document.getElementById("txtFIS");
        let formTipoVacuna1 = document.getElementById("cboVacuna1");
        let formFechaVacuna1 = document.getElementById("txtFechaVacuna1");
        let formTipoVacuna2 = document.getElementById("cboVacuna2");
        let formFechaVacuna2 = document.getElementById("txtFechaVacuna2");

        //Convertimos las fechas en Date
        let ftm = new Date(formFTM.value);
        
        let fis,fechaVacuna1,fechaVacuna2;

        if (formFIS.value === "" || formFIS.disabled)
            fis = new Date("12/01/2019");
        else
            fis = new Date(formFIS.value);

        if (formFechaVacuna1.value === "" || formFechaVacuna1.disabled)
            fechaVacuna1 = new Date("12/01/2019");
        else
            fechaVacuna1 = new Date(formFechaVacuna1.value);

        if (formFechaVacuna2.value === "" || formFechaVacuna2.disabled)
            fechaVacuna2 = new Date("12/01/2019");
        else
            fechaVacuna2 = new Date(formFechaVacuna2.value);
        
        //Instanciamos una variable vacunas para cargar el esquema de vacunación
        let vacunas = [];

        //Instanciamos la primera vacuna
        let tipoVacuna1 = new TipoVacuna(parseInt(formTipoVacuna1.value));
        tipoVacuna1.setAtributos();
        vacunas.push(new Vacuna(fechaVacuna1, tipoVacuna1));

        //Si la primer vacuna registrada no es monodosis, guardamos el dato de la segunda vacuna
        if (!vacunas[0].tipoVacuna.monodosis){
            let tipoVacuna2 = new TipoVacuna(parseInt(formTipoVacuna2.value));
            tipoVacuna2.setAtributos();
            vacunas.push(new Vacuna(fechaVacuna2, tipoVacuna2));
        }
        
        //Instanciamos el esquema de vacunación
        let esquema = new EsquemaVacunacion(vacunas);

        //Instanciamos al paciente
        let nombre = formNombre.value;
        let dni = formDNI.value;
        let paciente = new Paciente(dni, nombre, esquema, fis, ftm);

        //Lo sumamos al almacenamiento
        almacenarPacientes(paciente);
        
        //Restablecemos el formulario y cargamos los pacientes
        blanquearCampos();
        cargarPacientes();
    }
}

//Usamos jQuery.ready para que los pacientes sean lo último en cargar
cargarPacientes();
cargarTiposVacunas();