# Gestor de Gastos Personales

Aplicación web para registrar, consultar, editar y eliminar gastos personales.
Permite organizar los gastos por categoría y fecha, aplicar filtros y visualizar un resumen general mediante un dashboard.

## Funcionalidades

- Registrar nuevos gastos.
- Consultar todos los gastos registrados.
- Editar gastos existentes.
- Eliminar gastos con confirmación.
- Buscar gastos por descripción.
- Filtrar gastos por categoría.
- Filtrar gastos por mes.
- Calcular el total de gastos.
- Mostrar la cantidad de gastos registrados.
- Identificar la categoría con mayor gasto.
- Totalizar gastos por categoría y por mes.
- Mostrar mensajes de carga, éxito y error.
- Validar los datos antes de registrarlos.
- Interfaz responsive para escritorio, tablet y dispositivos móviles.

## Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- CORS
- Dotenv
- Nodemon

## Estructura del proyecto

```
Expense-Manager/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── gastoController.js
│   │   ├── models/
│   │   │   └── Gasto.js
│   │   ├── routes/
│   │   │   └── gastoRoutes.js
│   │   └── app.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
│
├── .gitignore
└── README.md
```

## Entidad Gasto

Cada gasto contiene los siguientes campos:

| Campo       | Tipo   | Descripción                                                      |
| ----------- | ------ | ---------------------------------------------------------------- |
| monto       | Number | Monto del gasto. Debe ser mayor que 0.                           |
| categoria   | String | Categoría asociada al gasto.                                     |
| fecha       | Date   | Fecha en la que se realizó el gasto.                             |
| descripcion | String | Descripción del gasto, con un máximo de 250 caracteres.          |

## Categorías disponibles

* Alimentación
* Transporte
* Vivienda
* Entretenimiento
* Salud
* Educación
* Otros

## API REST

La URL base de la API en desarrollo es:

http://localhost:5000/api/gastos

## Endpoints

| Método | Endpoint                             | Descripción                                         |
| ------ | ------------------------------------ | --------------------------------------------------- |
| GET    | `/api/gastos`                        | Obtener todos los gastos                            |
| GET    | `/api/gastos/:id`                    | Obtener un gasto por ID                             |
| POST   | `/api/gastos`                        | Registrar un nuevo gasto                            |
| PUT    | `/api/gastos/:id`                    | Actualizar un gasto                                 |
| DELETE | `/api/gastos/:id`                    | Eliminar un gasto                                   |
| GET    | `/api/gastos?categoria=Alimentación` | Filtrar gastos por categoría                        |
| GET    | `/api/gastos/resumen`                | Obtener total general y resumen por categoría y mes |

## Códigos HTTP utilizados

La API utiliza distintos códigos HTTP según el resultado de cada operación:

* `200 OK`: operación realizada correctamente.
* `201 Created`: gasto creado exitosamente.
* `400 Bad Request`: datos inválidos o error de validación.
* `404 Not Found`: gasto o ruta no encontrada.
* `500 Internal Server Error`: error interno del servidor.

## Instalación

### 1. Extraer el proyecto

Descargar y descomprimir el archivo ZIP entregado en la plataforma.

Luego abrir la carpeta del proyecto:

Expense-Manager


### 2. Instalar las dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Dentro de la carpeta `backend`, crear un archivo:

```
.env
```

Tomando como referencia `.env.example`:

```env
PORT=5000
MONGO_URI=tu_cadena_de_conexion_de_mongodb
```

### 4. Ejecutar el backend

En modo desarrollo:

```bash
npm run dev
```

El servidor se ejecutará en:

```
http://localhost:5000
```

### 5. Ejecutar el frontend

Abrir:

```
frontend/index.html
```

Puede ejecutarse mediante la extensión **Live Server** de Visual Studio Code.

Por ejemplo:

```
http://127.0.0.1:5500/frontend/index.html
```

## Validaciones

El sistema incluye validaciones tanto en el frontend como en el backend:

* El monto debe ser mayor que 0.
* La categoría es obligatoria.
* Solo se permiten las categorías definidas por el sistema.
* La descripción no puede exceder los 250 caracteres.
* Se validan los identificadores enviados a los endpoints.
* Se manejan errores de recursos inexistentes y errores internos del servidor.

## Dashboard

El dashboard muestra dinámicamente:

* Total gastado.
* Cantidad de gastos.
* Categoría principal.

Los valores se actualizan automáticamente al crear, editar, eliminar o filtrar registros.

## Pruebas

La aplicación fue probada mediante:

* Postman para los endpoints de la API REST.
* Pruebas funcionales desde la interfaz.
* Validaciones de datos.
* Pruebas de errores `400`, `404` y `500`.
* Pruebas de integración entre frontend, backend y MongoDB.
* Pruebas de creación, edición y eliminación con persistencia.
* Pruebas de búsqueda y filtros.
* Pruebas responsive en escritorio, tablet y dispositivos móviles.

## Integrantes

* **Fernando**
* **Montserrat**
* **Ámbar**
