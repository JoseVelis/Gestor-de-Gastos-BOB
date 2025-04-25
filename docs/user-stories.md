### Historias de Usuario para Bob Subastas

## Historia 1:

Gestionar clientes con validación de datos duplicados

- **Criterios de aceptación:**

- El sistema debe permitir agregar nuevos clientes con nombre, tipo de documento, número de documento y correo electrónico
- Al intentar registrar un cliente con un número de documento ya existente, el sistema debe mostrar un mensaje de error
- Al intentar registrar un cliente con un correo electrónico ya existente, el sistema debe mostrar un mensaje de error
- El sistema debe permitir editar la información de clientes existentes manteniendo las validaciones
- El sistema debe permitir eliminar clientes y todas sus transacciones asociadas





## Historia 2:

Visualizar balance financiero por moneda

- **Criterios de aceptación:**

- El dashboard debe mostrar el total de ingresos separados por moneda (PEN y USD)
- El dashboard debe mostrar el total de egresos separados por moneda (PEN y USD)
- El dashboard debe mostrar el balance total separado por moneda (PEN y USD)
- La tabla de clientes con mayor balance debe mostrar ingresos y egresos separados por moneda
- Al ver el detalle de un cliente, se debe mostrar su balance separado por moneda
- Los montos deben actualizarse automáticamente cuando se registren nuevos ingresos o egresos