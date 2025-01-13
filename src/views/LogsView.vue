<template>
    <div class="container">
      <!-- Título principal -->
      <h1>📊 Datos del Sensor</h1>
  
      <!-- Botón para obtener datos -->
      <button @click="fetchData" :disabled="loading">
        <span v-if="loading">Cargando...</span>
        <span v-else>🔄 Obtener Datos</span>
      </button>
  
      <!-- Indicador de carga -->
      <div v-if="loading" class="spinner"></div>
  
      <!-- Tarjetas con los datos -->
      <div v-if="data" class="cards">
        <!-- Tarjeta de temperatura -->
        <div class="card">
          <i class="fas fa-thermometer-half icon"></i>
          <p>Temperatura</p>
          <h2>{{ data.Temperature }}°C</h2>
        </div>
        <!-- Tarjeta de humedad -->
        <div class="card">
          <i class="fas fa-tint icon"></i>
          <p>Humedad</p>
          <h2>{{ data.Humidity }}%</h2>
        </div>
      </div>
  
      <!-- Última actualización -->
      <div v-if="lastUpdated" class="last-updated">
        Última actualización: {{ lastUpdated }}
      </div>
    </div>
  </template>
  
  <script>
  
  export default {
    name: "SensorData",
    data() {
      return {
        data: null, // Datos del sensor
        loading: false, // Estado de carga
        lastUpdated: null, // Hora de la última actualización
      };
    },
    methods: {
      fetchData() {
    this.loading = true;
    setInterval(async () => {
      try {
        const response = await fetch("http://localhost:3000/data", { method: "GET" });
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status}`);
        }
        const text = await response.text(); // Obtiene el contenido en texto
        this.data = this.parseCsv(text); // Parsea el contenido CSV
        this.lastUpdated = new Date().toLocaleTimeString();
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      } finally {
        this.loading = false;
      }
    }, 1000);
  },
      parseCsv(csvContent) {
        const rows = csvContent.split("\n");
        const headers = rows[0].split(",");
        const values = rows[1].split(",");
        const result = {};
        headers.forEach((header, index) => {
          result[header.trim()] = values[index].trim();
        });
        return result;
      },
    },
  };
  </script>
  
  <style scoped>
  /* Contenedor principal con borde y sombra */
  .container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    text-align: center;
    font-family: Arial, sans-serif;
    background-color: #f4f4f4; /* Gris claro */
    border: 2px solid #000; /* Borde negro elegante */
    border-radius: 15px; /* Bordes redondeados */
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Sombra sutil */
  }
  
  /* Título */
  h1 {
    font-size: 28px;
    margin-bottom: 20px;
    color: #333;
    font-weight: bold;
  }
  
  /* Botón */
  button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #28a745;
    color: white;
    border: 2px solid #000; /* Borde negro */
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  button:hover {
    background-color: #218838;
    transform: scale(1.05);
  }
  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  /* Spinner de carga */
  .spinner {
    margin: 20px auto;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #000;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Tarjetas */
  .cards {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
  .card {
    background: #ffffff;
    border: 2px solid #000; /* Borde negro */
    border-radius: 10px;
    padding: 20px;
    width: 150px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra suave */
    transition: transform 0.3s;
  }
  .card:hover {
    transform: translateY(-5px);
  }
  .card p {
    margin: 0;
    font-size: 14px;
    color: #6c757d;
  }
  .card h2 {
    margin: 10px 0 0;
    font-size: 24px;
    color: #333;
  }
  .icon {
    font-size: 30px;
    color: #007bff;
    margin-bottom: 10px;
  }
  
  /* Última actualización */
  .last-updated {
    margin-top: 20px;
    font-size: 14px;
    color: #555;
    font-style: italic;
    border-top: 1px solid #000;
    padding-top: 10px;
  }
  </style>
  