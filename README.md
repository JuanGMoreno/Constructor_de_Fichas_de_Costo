# Cost Token Builder

Constructor visual para definir la estructura JSON de una ficha de costo. La aplicacion permite disenar bloques libres sobre una rejilla, exportar la estructura generada y volver a importarla para reconstruir el diseno.

## Objetivo del proyecto

El proyecto existe para resolver un problema muy concreto: muchas empresas no trabajan con una ficha de costo unica o estandar. En lugar de obligarlas a usar una plantilla fija, esta herramienta permite construir visualmente la estructura de la ficha y guardar ese resultado como JSON.

Ese JSON no representa solo la posicion de los elementos, sino tambien:

- el tipo de bloque
- el tipo de dato esperado
- la composicion de filas con subcampos
- y la definicion de campos calculados

La idea es que otro sistema, mas adelante, consuma este JSON para renderizar o ejecutar la ficha de costo final.

## Stack tecnico

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- react-grid-layout

## Comandos principales

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

## Funcionamiento general

La aplicacion trabaja con dos representaciones internas:

- `layout`: describe la geometria del grid
- `items`: describe el contenido semantico de los bloques

El grid visual se dibuja combinando ambas estructuras.

Cuando exportas:

- `layout + items -> JSON`

Cuando importas:

- `JSON -> layout + items`

Ese diseno hace que el constructor sea flexible y que la interfaz no dependa directamente del JSON para renderizar.

## Tipos de bloques disponibles

### 1. Campo individual

Representa un campo simple dentro de la ficha.

Ejemplos:

- Producto
- Codigo
- Unidad de medida
- Fecha

Tipos de dato soportados:

- `text`
- `number`
- `date`
- `email`
- `tel`
- `list`

### 2. Label

Es un bloque puramente visual. Sirve para:

- titulos
- subtitulos
- nombres de seccion
- encabezados institucionales

No almacena valor, solo estructura y posicion.

### 3. Fila compuesta

Es un contenedor que agrupa subcampos dentro de un mismo bloque visual.

Sirve para modelar conceptos como:

- costo de material
- combustibles y lubricantes
- salarios directos

Cada fila puede contener varios subcampos con sus propios tipos y configuraciones.

## Campos calculados

El constructor soporta campos calculados tanto en:

- campos individuales
- subcampos dentro de una fila compuesta

La configuracion del calculo se realiza desde el panel lateral.

Cada campo calculado puede definir:

- operacion
- lista de campos fuente que participan

Operaciones soportadas:

- `sum`
- `subtract`
- `multiply`
- `divide`
- `average`
- `percent`

### Como funciona visualmente

Cada campo o subcampo tiene un boton `fx`.

Cuando pulsas ese boton:

- el campo queda seleccionado como objetivo del calculo
- el panel lateral muestra su configuracion
- puedes elegir la operacion
- puedes marcar los campos que participan en el calculo

### Importante

En esta aplicacion no se ejecuta la formula como tal. Aqui solo se define la estructura y el comportamiento esperado para que otro sistema lo use mas adelante.

## Importacion y exportacion de JSON

### Exportacion

La aplicacion genera un JSON estructurado con:

- configuracion del grid
- lista ordenada de bloques
- posicion y tamano de cada bloque
- configuracion de subcampos
- configuracion de calculos

El orden exportado respeta el orden visual del lienzo:

- primero de arriba hacia abajo
- luego de izquierda a derecha

### Importacion

Tambien es posible pegar un JSON compatible para reconstruir la tablilla.

Durante la importacion se valida:

- la existencia de `items`
- el tipo de bloque
- las coordenadas del grid
- el tipo de dato
- la estructura de calculos

Si el JSON no es valido, la interfaz muestra el error sin romper la pagina.

## Estructura del modulo principal

La logica del constructor esta separada en varios archivos:

### `components/gridTable/gridTable.tsx`

Es el orquestador principal.

Responsabilidades:

- manejar estados
- crear y eliminar bloques
- agregar y quitar subcampos
- exportar JSON
- importar JSON
- administrar configuracion de calculos

### `components/gridTable/gridTable.types.ts`

Define todos los tipos TypeScript del constructor.

Aqui viven:

- tipos de bloque
- tipos de campo
- tipos de calculo
- estructura del JSON exportado

### `components/gridTable/gridTable.config.ts`

Contiene configuracion reutilizable.

Por ejemplo:

- columnas y filas del grid
- opciones de tipos de dato
- opciones de operaciones
- helpers de layout por tipo de bloque

### `components/gridTable/GridTableSidebar.tsx`

Renderiza el panel lateral.

Responsabilidades:

- crear nuevos bloques
- exportar JSON
- importar JSON
- configurar campos calculados

### `components/gridTable/GridTableCanvas.tsx`

Renderiza el lienzo con `react-grid-layout`.

Responsabilidades:

- mostrar el grid
- pintar los bloques
- sincronizar posiciones y tamanos

### `components/gridTable/GridTableBlockCard.tsx`

Renderiza cada bloque individual del grid.

Responsabilidades:

- mostrar labels
- mostrar campos individuales
- mostrar filas compuestas
- renderizar subcampos
- permitir seleccionar el objetivo de calculo

### `components/gridTable/GridTableJsonPreview.tsx`

Muestra el JSON generado en pantalla.

## Flujo de datos

### Crear un bloque

1. El usuario escribe un nombre y elige un tipo de dato.
2. Pulsa uno de los botones de creacion.
3. La app crea un id unico.
4. Se guarda contenido en `items`.
5. Se guarda geometria en `layout`.
6. El grid se renderiza automaticamente.

### Exportar

1. Se toma `layout`.
2. Se toma `items`.
3. Se ordena segun posicion visual.
4. Se fusiona todo en un objeto `SavedStructure`.
5. Se convierte a JSON y se muestra.

### Importar

1. El usuario pega un JSON.
2. La app lo parsea.
3. Valida formato y tipos.
4. Reconstruye `layout`.
5. Reconstruye `items`.
6. Reconstruye `rowDrafts`.
7. El grid vuelve a dibujarse.

## Formato general del JSON

Ejemplo simplificado:

```json
{
  "grid": {
    "cols": 12,
    "rows": 12
  },
  "items": [
    {
      "id": "label_1",
      "label": "FICHA DE COSTOS",
      "kind": "label",
      "x": 0,
      "y": 0,
      "w": 12,
      "h": 2
    },
    {
      "id": "field_1",
      "label": "Producto",
      "kind": "single",
      "type": "text",
      "x": 0,
      "y": 2,
      "w": 6,
      "h": 2
    },
    {
      "id": "field_2",
      "label": "Costo total",
      "kind": "single",
      "type": "number",
      "calculation": {
        "operation": "sum",
        "sourceFieldIds": ["field_3", "field_4"]
      },
      "x": 6,
      "y": 2,
      "w": 6,
      "h": 2
    }
  ]
}
```

## Decisiones de implementacion importantes

### 1. El grid no renderiza directamente desde el JSON

Se usa un modelo intermedio porque facilita:

- mover bloques
- editar contenido
- validar cambios
- importar y exportar

### 2. Los calculos se definen, pero no se ejecutan

Esto mantiene el constructor enfocado en disenar estructura, no en resolver logica de negocio final.

### 3. Las referencias de calculo son globales

Un campo puede tomar como fuente cualquier otro campo o subcampo de la ficha, excepto a si mismo.

### 4. Se limpian referencias cuando se elimina un campo

Si un campo usado en una formula desaparece, sus ids se eliminan automaticamente de otras configuraciones de calculo para no dejar referencias rotas.

## Estado actual del proyecto

Actualmente el constructor permite:

- crear labels
- crear campos simples
- crear filas compuestas
- mover y redimensionar bloques
- usar tipo `list`
- definir campos calculados
- exportar JSON
- importar JSON
- reconstruir la tablilla desde un JSON valido

## Posibles siguientes pasos

Ideas naturales para evolucionar el proyecto:

- soporte para formulas mas complejas
- editor de condiciones o reglas
- persistencia en backend
- exportacion a Excel
- plantillas predefinidas
- integracion real con nomencladores para campos `list`
- vista previa de una ficha final basada en el JSON

## Notas para desarrollo

- `next-env.d.ts` es generado por Next.js y no debe editarse manualmente.
- Si en algun momento se renombran rutas del App Router y aparecen errores raros de tipos, conviene limpiar `.next`.
- El proyecto no tiene runner de tests configurado todavia.

## Validacion recomendada antes de cerrar cambios

```bash
npm run lint
npm run build
```

## Nombre del proyecto

El repositorio local ya existia cuando se trabajo sobre el proyecto, asi que no fue necesario crear uno nuevo. El nombre de referencia usado para la documentacion es:

- `Cost Token Builder`
