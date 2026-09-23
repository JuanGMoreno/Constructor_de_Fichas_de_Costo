# Constructor de Fichas de Costo | Cost Token Builder

Editor visual para diseñar la estructura de una ficha de costo sin imponer una plantilla única. Permite colocar bloques en un lienzo, definir tipos de dato y relaciones de cálculo, y exportar el resultado como JSON. Al importar ese JSON, la aplicación reconstruye el diseño para seguir editándolo.

## Vista previa

> Captura pendiente de añadir: una vista del lienzo con varios tipos de bloques y el panel lateral de configuración. No hay aún una imagen de la aplicación versionada en este repositorio.

## Para qué sirve

Distintas empresas organizan sus costos de formas diferentes. Esta herramienta se concentra en **definir la estructura** de una ficha —campos, posiciones, agrupaciones y cálculos declarativos— para que otro sistema pueda interpretarla más adelante.

1. Agrega campos individuales, etiquetas o filas compuestas con subcampos.
2. Mueve y redimensiona bloques sobre una rejilla.
3. Asigna tipos de dato como texto, número, fecha, correo, teléfono o lista.
4. Configura operaciones y selecciona los campos que participan en ellas.
5. Exporta el diseño a JSON o importa un JSON compatible para recuperarlo.

**Alcance actual:** el editor guarda la *definición* de los cálculos, pero no ejecuta las fórmulas ni produce una ficha final con importes calculados. No dispone de backend ni persistencia remota.

## Tecnologías

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 y `react-grid-layout`.

## Cómo está organizado

La interfaz mantiene dos representaciones relacionadas:

- `layout`: posición y tamaño de los bloques en la rejilla.
- `items`: tipo y contenido semántico de cada bloque.

Al exportar, combina ambas representaciones y ordena los bloques según su posición visual. Al importar, valida la estructura recibida y reconstruye `layout`, `items` y los borradores de filas; una entrada inválida muestra un error sin romper la página.

```text
app/page.tsx                             Entrada de la aplicación
components/gridTable/gridTable.tsx      Estado y coordinación del editor
components/gridTable/gridTable.types.ts Tipos de bloques y del JSON
components/gridTable/gridTable.config.ts Configuración de rejilla y opciones
components/gridTable/GridTableCanvas.tsx Lienzo interactivo
components/gridTable/GridTableSidebar.tsx Creación, importación y configuración
components/gridTable/GridTableJsonPreview.tsx Vista del JSON generado
```

### Bloques y cálculos

Los bloques pueden ser campos individuales, etiquetas visuales o filas compuestas. Un campo individual o subcampo puede declarar una operación `sum`, `subtract`, `multiply`, `divide`, `average` o `percent` y referenciar otros campos por ID. Si se elimina una fuente, el editor retira su referencia de las configuraciones dependientes.

Esta separación evita mezclar el editor visual con la futura ejecución de reglas de negocio: aquí se describe *qué calcular*, no se calcula el valor.

## Referencia técnica

### Modelo y flujo de datos

Al crear un bloque, el editor genera un ID y añade su contenido a `items` y su geometría a `layout`. El lienzo combina ambas estructuras para renderizarlo. La exportación ordena las posiciones de arriba hacia abajo y después de izquierda a derecha, y guarda el resultado como `SavedStructure`.

La importación verifica que existan los elementos esperados y valida, entre otros datos, el tipo de bloque, el tipo de campo, las coordenadas y la configuración de cálculos. Si el JSON es compatible, reconstruye el estado del editor; si no, muestra un error sin descartar la interfaz.

Un ejemplo simplificado del formato exportado:

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
    },
    {
      "id": "field_3",
      "label": "Materiales",
      "kind": "single",
      "type": "number",
      "x": 0,
      "y": 4,
      "w": 6,
      "h": 2
    },
    {
      "id": "field_4",
      "label": "Mano de obra",
      "kind": "single",
      "type": "number",
      "x": 6,
      "y": 4,
      "w": 6,
      "h": 2
    }
  ]
}
```

### Decisiones de implementación

- **Estado intermedio, no JSON como vista:** el lienzo utiliza `layout` e `items` durante la edición; el JSON es un formato de intercambio. Así se pueden mover y cambiar bloques sin reconstruir el documento en cada interacción.
- **Cálculos declarativos:** un campo puede referenciar por ID a otros campos o subcampos, pero el editor no ejecuta la operación. Esto deja la interpretación a un sistema posterior.
- **Referencias globales:** un campo puede tomar fuentes de cualquier parte de la ficha, excepto de sí mismo.
- **Limpieza al eliminar:** al quitar un campo, sus referencias se retiran de las configuraciones de cálculo que dependían de él.

## Ejecutar en local

Necesitas Node.js y npm. No se requiere base de datos ni variables de entorno para el editor actual.

```bash
git clone https://github.com/JuanGMoreno/Constructor_de_Fichas_de_Costo.git
cd Constructor_de_Fichas_de_Costo
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para comprobar el proyecto:

```bash
npm run lint
npm run build
```

Todavía no hay un runner de pruebas configurado ni una demo pública asociada a este repositorio.
