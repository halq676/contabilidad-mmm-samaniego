# Contabilidad MMM - Samaniego 📈

Sistema de gestión contable automatizado diseñado para el registro y control de actividades financieras. Esta aplicación permite llevar un seguimiento detallado de flujos de caja mediante el registro sistemático de entradas y salidas, calculando el saldo en tiempo real.

## 🔗 Enlace de la Aplicación
Puedes acceder y utilizar el software directamente desde aquí:  
👉 **[https://halq676.github.io/contabilidad-mmm-samaniego/](https://halq676.github.io/contabilidad-mmm-samaniego/)**

---

## 🚀 Características Principales

* **Registro de Actividades:** Formulario intuitivo para capturar ingresos (entradas) y egresos (salidas).
* **Balance Automático:** Cálculo dinámico del saldo actual basado en los movimientos registrados.
* **Capacidad Offline (PWA):** Gracias a la implementación de **Service Workers**, la aplicación funciona perfectamente sin conexión a internet, ideal para entornos con conectividad inestable.
* **Instalable:** Puede añadirse a la pantalla de inicio en dispositivos móviles o como aplicación de escritorio.
* **Interfaz Responsiva:** Diseño adaptado para su uso en computadores, tablets y celulares.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3 y JavaScript moderno (ES6+).
* **PWA Core:** Service Worker para gestión de caché y persistencia offline.
* **Almacenamiento:** Uso de LocalStorage / IndexedDB para guardar los datos localmente en el dispositivo.
* **Despliegue:** GitHub Pages.

## 📦 Instalación para Desarrolladores

Si deseas clonar este repositorio para realizar mejoras o estudiar el código:

1.  **Clonar el proyecto:**
    ```bash
    git clone [https://github.com/halq676/contabilidad-mmm-samaniego.git](https://github.com/halq676/contabilidad-mmm-samaniego.git)
    ```
2.  **Ejecución:**
    Abre el archivo `index.html` en tu navegador. 
    *Nota: Para que el Service Worker se registre correctamente, se recomienda abrir el proyecto usando un servidor local (como la extensión "Live Server" de VS Code).*

## 📋 Guía de Uso

1.  **Registrar Entrada:** Ingrese el concepto y el monto en el campo de ingresos.
2.  **Registrar Salida:** Ingrese el gasto o pago realizado.
3.  **Consultar Saldo:** El sistema actualizará el total disponible de forma inmediata en la parte superior del tablero.
4.  **Uso sin conexión:** Una vez abierta la app por primera vez, podrás acceder a ella incluso si apagas el Wi-Fi o los datos.

---
Desarrollado por **Henry Lombana** - 2026
