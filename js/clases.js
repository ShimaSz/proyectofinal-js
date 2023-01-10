/*Abstracción de clases utilizada en la solución*/
class TipoVacuna{
    constructor(id){
        this.id = id;
        this.nombre = "Sin vacunar";
        this.monodosis = true;
    }

    //Método para asignar el nombre y el atributo monodosis de la vacuna en función del ID
    setAtributos() {
        let tiposVacunas = []
        tiposVacunas = JSON.parse(localStorage.getItem("tiposVacunas"));

        let tipo = tiposVacunas.filter(x => x.id === this.id)[0];
        this.nombre = tipo.nombre;
        this.monodosis = tipo.monodosis;

        return this;
    }
}

class Vacuna{
    constructor(fecha, tipoVacuna){
        this.fecha = fecha;
        this.tipoVacuna = tipoVacuna;
    }
}

class EsquemaVacunacion{
    constructor(vacunas){
        this.vacunas = vacunas;
    }

    //Este método sirve para ordenar las vacunas según la fecha de aplicación de las mismas.
    ordenarVacunas(){
        //Establecemos el largo del array
        var len = this.vacunas.length;

        //Con un for, recorremos el vector desde el inicio hasta el final.
        for (let i = 0; i < len; i++){
            //Con otro for, vamos recorriendo los primeros valores del array, 
            //pero descartando los últimos puestos
            for (let j = 0; j < len - i - 1; j++){
                //Comparamos si el valor de la fecha de la posición actual es mayor que
                //la de la posición siguiente y, si sí, la empujamos a la posición siguiente.
                if (this.vacunas[j].fecha > this.vacunas[j + 1].fecha){
                    let temp = this.vacunas[j];
                    this.vacunas[j] = this.vacunas[j+1];
                    this.vacunas[j+1] = temp;
                }
            }
        }

    }
}

class Paciente{
    constructor(dni,nombre,esquemaVacunacion,fis,ftm){
        this.dni = dni;
        this.nombre = nombre;
        this.esquemaVacunacion = esquemaVacunacion;
        this.fis = fis;
        this.ftm = ftm;
    }

    validarEsquemaPrimario() {
        //Si no hay vacunas cargadas, el esquema primario está incompleto
        if (this.esquemaVacunacion.vacunas.length === 0)
            return false;
        //Caso contrario, ordenamos las vacunas por fecha, por las dudas
        this.esquemaVacunacion.ordenarVacunas();
        //Si en esquema de vacunación, la vacuna es "sin vacunar", el esquema primario está incompleto
        if (this.esquemaVacunacion.vacunas[0].tipoVacuna.id === 0)
            return false;
        //Si la primer vacuna corresponde a un tipo de una sola aplicación, considerar completo
        if (this.esquemaVacunacion.vacunas[0].tipoVacuna.monodosis)
            return true;
        //Si tiene dos aplicaciones o más, considerar el esquema completo
        if (this.esquemaVacunacion.vacunas.length >= 2)
            return true;
        //Cualquier otro caso, esquema incompleto
        return false;
    }
    
    calcularFechaDeCurva(){
        //validamos que tenga FIS
        //var diaCero2 = DateTime(2019, 12, 1);
        var diaCero = new Date("12/01/2019");
        var inicio = new Date(this.fis);
        if (inicio.getTime() === diaCero.getTime())
            return new Date(this.ftm);
        else {
            //Si no, devolvemos la menor de las fechas entre la FTM y la FIS
            if (this.fis >= this.ftm)
                return new Date(this.ftm);
            else
                return new Date(this.fis);
        }
    }

    calcularFechaAlta(){
        var dias = 0;
        let fechaAlta = new Date(this.calcularFechaDeCurva());
        /*Si la persona no está vacunada, el alta se da a 10 días de la fecha de curva.
        - Si está vacunada y no tiene síntomas, a los 5 días.
        - Si está vacunada y tiene síntomas, a los 7 días.*/
        if (this.validarEsquemaPrimario()){
            var diaCero = new Date("12/01/2019");
            var inicio = new Date(this.fis);
            if (inicio.getTime() === diaCero.getTime())
                dias = 5;
            else
                dias = 7;
        } else {
            dias = 10;
        }
        fechaAlta.setDate(fechaAlta.getDate()+ dias)
        return fechaAlta;
    }

    //Método que permite generar el HTML necesario para insertar pacientes
    generarHTMLPaciente(){
        //Generamos el texto para el esquema
        let esquema = "";
        if (this.validarEsquemaPrimario())
            esquema = "COMPLETO";
        else
            esquema = "INCOMPLETO";

        //Generamos el texto para las fechas
        let fechaAlta = this.calcularFechaAlta().getDate() + "/" +
                        (this.calcularFechaAlta().getMonth() + 1) + "/" + 
                        this.calcularFechaAlta().getFullYear();
        
        let fechaCurva = this.calcularFechaDeCurva().getDate() + "/" +
                        (this.calcularFechaDeCurva().getMonth() + 1) + "/" + 
                        this.calcularFechaDeCurva().getFullYear();
        
        let html = '<h3>' + this.nombre + '</h3>\n' +
                    '<div>Esquema ' + esquema + '</div>\n' +
                    '<div>FC: ' + fechaCurva + '</div>\n' +
                    '<div>Fecha estimada de alta: ' + fechaAlta + '</div>\n';
                    
        return html;
    }
}