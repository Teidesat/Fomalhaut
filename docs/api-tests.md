## GET /api/health
- Fecha: 2026-11-25
- Token válido → 200 `{"status": "healthy", "buffer_size": 0}`  coincide con `HealthResponse`
- Token inválido → 401 `{"detail": "Unauthorized"}` la autenticación funciona
- Observación: Swagger muestra "string" como ejemplo de respuesta porque el endpoint
  no declara `response=` en config/api.py. Propuesta: añadir un HealthSchema.
  El 401 aparece como "Undocumented" en Swagger (no está declarado).
- Nota: el botón Authorize de Swagger no valida el token, solo se comprueba al ejecutar.

## GET /api/bridge/destinations
- Token válido → 200 `["satellite","radio_station","optical_station","fomalhaut"]` coincide con `Destination`
- Observación 1: la lista VALID_DESTINATIONS está definida dos veces en el servidor
  (apps/bridge/config.py y apps/bridge/schemas.py). Si alguien añade un destino
  solo en una, se desincronizan. Propuesta: definirla en un único sitio.
- Observación 2: los destinos van en minúscula ("satellite"), pero el modelo
  Endpoint de apps/control/models.py usa mayúscula ("SATELLITE"). En la base de
  datos pueden convivir ambas formas.
- Observación 3: incluye "fomalhaut". En el formulario de comandos de Fomalhaut
  hay que quitarlo, porque Fomalhaut no se envía comandos a sí mismo.

## GET /api/audit/
- Sin filtros → 200, lista de LogSchema (16 campos, coincide con Log.model.ts)
- Orden: más reciente primero
- Filtro level=INFO → devuelve logs (URL: /api/audit/?level=INFO) 
- Filtro level=ERROR → [] (no hay errores todavía) el filtro por nivel funciona
- Filtro timestamp_gte=2026-11-25T17:24:00Z → solo logs desde id 8 
- Filtro timestamp_gte=2026-11-25T23:00:00Z → [] el filtro por fecha funciona
- Nota: las fechas van en UTC (sufijo Z). Fomalhaut debe convertir la fecha local a UTC al filtrar.
- Observaciones:
  - request_status_code siempre null (create_log nunca lo recibe).
  - request_user llega como "" (usuario anónimo), no null.
  - request_client_ip = 172.18.0.1 (gateway de Docker), no la IP real del cliente.
  - Cada consulta a /audit/ genera un log nuevo → con refresco automático la tabla crece sin parar.
