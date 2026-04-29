# Frontend TrackRoute - LogisColombia

Este repositorio contiene la implementación del frontend para el sistema de gestión y monitoreo logístico **TrackRoute**, desarrollado como parte de la prueba técnica para LogisColombia.

## 🚀 Guía de Inicio Rápido

Siga estos pasos para levantar el entorno de desarrollo local:

1. **Instalación de dependencias:**
   ```bash
   npm install
   ```

2. **Configuración de variables de entorno:**
   Cree un archivo `.env` en la raíz del proyecto basándose en `.env.example`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Ejecución en desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

---

## 🏗️ Decisiones de Arquitectura

### Selección del Stack: React vs Angular
Aunque el requerimiento inicial sugería Angular 17+, se tomó la decisión estratégica de utilizar **React 18 + Vite** debido al **timebox estricto de 24 horas**. 

**Justificación técnica:**
*   **Velocidad de Iteración:** El ecosistema de React, potenciado por la velocidad de compilación de **Vite**, permite un ciclo de *feedback* instantáneo (HMR), lo cual fue crítico para entregar un MVP completo (CRUD + Polling + Auth) en menos de un día.
*   **Flexibilidad Arquitectónica:** React permitió una estructura de componentes más ligera, facilitando la creación de piezas reutilizables como el `DataTable` con renderizado dinámico.
*   **Rendimiento:** Se implementó **Lazy Loading** para la división de código y una gestión eficiente del Virtual DOM para asegurar que el Dashboard mantenga un rendimiento óptimo bajo carga de datos.

### Estrategia de Manejo de Estado: Zustand
Para la gestión del estado global (Autenticación y Sesión), se eligió **Zustand**.

*   **Equivalente Pragmático:** Zustand cumple con el requisito de ser una solución de **estado reactivo**, funcionando como el equivalente pragmático a *Signals* o *RxJS* en el ecosistema React.
*   **Reducción de Boilerplate:** A diferencia de Redux o el uso intensivo de RxJS en Angular, Zustand permite definir stores en pocas líneas de código sin sacrificar la reactividad o la predictibilidad del estado. Esta simplicidad fue el factor determinante para cumplir con el plazo de entrega sin comprometer la calidad técnica.

---

## 📋 Supuestos Asumidos

1.  **Enfoque de Dispositivos:** La interfaz ha sido diseñada priorizando la **operatividad en Escritorio y Tablets**, considerando que los operadores logísticos y administradores suelen trabajar en estos dispositivos para la gestión de rutas.
2.  **Seguridad y Sesión:** Se asume el uso de **JWT (JSON Web Tokens)** para la comunicación con el API. Se implementaron interceptores de Axios para la inyección automática del token y el manejo global de errores 401 (Unauthorized).
3.  **Monitoreo en Tiempo Real:** Dado el alcance del MVP, el rastreo se implementó mediante un sistema de **Polling optimizado** cada 30 segundos, simulando la actualización constante de coordenadas GPS.

---

## 🛠️ Tecnologías Principales
*   **React 18** (UI Library)
*   **Vite** (Build Tool)
*   **TypeScript** (Type Safety)
*   **Zustand** (State Management)
*   **Axios** (HTTP Client)
*   **React Router 6** (Routing)
