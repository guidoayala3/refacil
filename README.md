# refacil
Test Refacil, typescript, serverless, lambda, aws, node, postgresql

## 👋 Bienvenid@!

Esta es la solución de backend implementada

Usamos  - Serverless
        - Node.JS
        - TypeScript
        - PostgreSQL

| ⚠️ Importante ⚠️ |
| :----: |
| Por favor no olvides hacer npm install |


#Para la ejecución

Local: npm run dev
Lambdas desplegadas : 

endpoints:
    # Obtener la data de Consulta Covid Punto 1
  GET - https://9nyqefzmeg.execute-api.us-east-1.amazonaws.com/release/casos
    #Sincronización de Casos Covid Punto 2
  GET -  https://9nyqefzmeg.execute-api.us-east-1.amazonaws.com/release/data 
    # Busqueda de información
  GET - https://9nyqefzmeg.execute-api.us-east-1.amazonaws.com/release/search?genero=M&estado=Fallecido&ciudad=CALI