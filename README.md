# Prueba Imaginamos

## Prerrequisitos
* Docker
* Docker Compose

## Puesta en marcha
En la raíz del proyecto ejecutar:

```docker-compose up --build```

El comando anterior, debería ejecutar la api en http://localhost:3000.


Ahora, para crear algunos Técnicos debemos ejecutar:

```docker exec -it api npx nestjs-command create:technician```

Los técnicos creados tienen la siguiente info:
```
Nombre: Técnico uno
Correo: tecnico1@gmail.com
Password: tecnico1

Nombre: Técnico dos
Correo: tecnico2@gmail.com
Password: tecnico2
```

## Descripción API

ESTA ES UNA DESCRIPCIÓN BREVE ACERCA DE CADA UNO DE LOS ENDPOINTS DISPONIBLES.

La documentación oficial fue construida con Swagger y puede ser encontrada en: http://localhost:3000/api

| Endpoint                                  | Descripción                                                                                                  | Autenticación                                          |
|-------------------------------------------|--------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| POST /clients/login                       | Permite crear un nuevo cliente.                                                                              | NO                                                     |
| POST /clients                             | Permite obtener un token para una sesión.                                                                    | NO                                                     |
| POST /technicians/login                   | Permite crear un nuevo técnico.                                                                              | NO                                                     |
| POST /technicians                         | Permite obtener un token para una sesión.                                                                    | NO                                                     |
| POST /services/ticket                     | Permite crear un nuevo ticket por parte de un cliente.                                                       | SI, un token de un cliente.                            |
| GET /services/ticket/verify/{ticketToken} | Permite validar la solicitud de ticket hecha por un cliente.                                                 | SI, el token del cliente que realizo la solicitud.     |
| GET /services/track/{serviceToken}        | Permite hacer un seguimiento al servicio creado a partir de la solicitud de ticket realizada por un cliente. | SI, el token del cliente que realizo la solicitud.     |
| PATCH /services/{idService}/rate          | Permite al cliente calificar el servicio recibido.                                                           | SI, el token del cliente que realizo la solicitud.     |
| PATCH /services/{idService}/status        | Permite al técnico cambiar el estado del servicio que le fue asignado.                                       | SI, el token del técnico que fue asignado al servicio. |
| GET /services                             | Permite a un técnico obtener los diferentes servicios que tiene asignados.                                   | SI, un token de sesión de técnico.                     |
