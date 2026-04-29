# Uso de Inteligencia Artificial en el Desarrollo

Este documento detalla el papel que desempeñó la Inteligencia Artificial (IA) como herramienta de aceleración durante el desarrollo del frontend de **TrackRoute**.

## 🚀 La IA como Acelerador Tecnológico

Dada la restricción de tiempo de **24 horas**, se integró el uso de IA exclusivamente como un catalizador para tareas repetitivas y de configuración inicial, permitiendo al desarrollador centrarse en la lógica de negocio y la arquitectura del sistema.

### Áreas de Aplicación de la IA:

1.  **Boilerplate de Configuración:** 
    Generación rápida de la estructura base de **Vite** y configuraciones iniciales de **Vanilla CSS**, estableciendo los tokens de diseño y el sistema de estilos en minutos.

2.  **Capa de Servicios e Interceptores:**
    Estructuración ágil de los interceptores de **Axios**. La IA facilitó la creación de la lógica para la inyección del **JWT** en las cabeceras y el manejo global de errores, asegurando una comunicación robusta con el backend desde el primer momento.

3.  **Visualización de Datos:**
    Configuración de la base visual para los gráficos de monitoreo y progreso, utilizando la librería **Recharts** para transformar los datos del API en indicadores visuales efectivos.

4.  **Lógica de Polling:**
    Implementación de la lógica repetitiva del `setInterval` para el rastreo en tiempo real (polling de 30 segundos), asegurando el manejo correcto de la limpieza de efectos para evitar fugas de memoria (*memory leaks*).

---

## 🏗️ Propiedad de la Arquitectura

Es fundamental aclarar que, si bien la IA funcionó como una herramienta de productividad, las **decisiones arquitectónicas críticas** fueron dirigidas y validadas íntegramente por el arquitecto humano:

*   **Estructura de Componentes:** La jerarquía de componentes, la separación de responsabilidades y la creación del sistema de diseño fueron diseñadas manualmente para garantizar escalabilidad.
*   **Selección de Zustand:** La decisión de utilizar Zustand como una solución reactiva ligera en lugar de Redux o Context API fue una elección estratégica basada en el compromiso entre potencia y tiempo de entrega.
*   **Seguridad y Rutas Protegidas:** La lógica detrás del RBAC (Role-Based Access Control) y la integración de las rutas protegidas (`ProtectedRoute` / `PublicRoute`) fueron implementadas bajo una visión técnica específica para cumplir con los requerimientos de seguridad de LogisColombia.

El resultado es un producto donde la eficiencia de la IA se combina con el criterio técnico y la experiencia de arquitectura de software.
