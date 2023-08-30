import axios from 'axios';
import dbService from '../common/dbService';
import { PoolClient } from 'pg';
import CasosType from '@src/structures/casos.type';

interface CasoCovid {
    fecha_reporte_web: string;
    edad: string;
    sexo: string;
}

interface Response {
    data: any;
}

interface InsertionResult {
    insertedCount: number;
    duplicateCount: number;
    errors: string[];
}

class CovidService {
    async obtenerDatosCovid(): Promise<any> {
        try {
            const response = await axios.get(process.env.URLConsulta);
            return response.data;
        } catch (error) {
            throw new Error('No se pudo obtener los datos COVID');
        }
    }

    async procesarDatosCovid(data: CasoCovid[]): Promise<Response> {
        const genderCounts: Record<string, number> = {};
        const ageRangeCounts: Record<string, number> = {
            '0-20': 0,
            '20-40': 0,
            '40+': 0,
        };

        data.forEach((caso: CasoCovid) => {
            const gender = caso.sexo;
            const age = parseInt(caso.edad);

            if (gender) {
                genderCounts[gender] = (genderCounts[gender] || 0) + 1;
            }

            if (!isNaN(age)) {
                if (age <= 20) {
                    ageRangeCounts['0-20']++;
                } else if (age <= 40) {
                    ageRangeCounts['20-40']++;
                } else {
                    ageRangeCounts['40+']++;
                }
            }
        });

        const result = {
            genderCounts,
            ageRangeCounts,
        };

        return {
            data: result,
        };
    }

    async insertCovidCaseProcedure(client: PoolClient, caso: CasosType): Promise<void> {
        try {
            await client.query('SELECT insertar_caso_covid($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)', [
                caso.fecha_reporte_web,
                caso.id_de_caso,
                caso.fecha_de_notificaci_n,
                caso.departamento,
                caso.departamento_nom,
                caso.ciudad_municipio,
                caso.ciudad_municipio_nom,
                caso.edad,
                caso.unidad_medida,
                caso.sexo,
                caso.fuente_tipo_contagio,
                caso.ubicacion,
                caso.estado,
                caso.recuperado,
                caso.fecha_inicio_sintomas,
                caso.fecha_diagnostico,
                caso.fecha_recuperado,
                caso.tipo_recuperacion,
                caso.per_etn_
            ]);
        } catch (error) {
          throw new Error(`Error al insertar registro ${caso.id_de_caso}: ${error.message}`);
        }
      }

      async checkAndInsertCovidCases(): Promise<InsertionResult> {
        const result: InsertionResult = {
          insertedCount: 0,
          duplicateCount: 0,
          errors: [],
        };
    
        const batchSize = 100; 
    
        const client = await dbService.getClient();
    
        try {
          await client.query('BEGIN');
          const covidData = await this.obtenerDatosCovid();
    
          
          for (let i = 0; i < covidData.length; i += batchSize) {
            const batch = covidData.slice(i, i + batchSize);
    
            for (const caso of batch) {
              const existingCaseQuery = `
                SELECT id_de_caso FROM casos_covid
                WHERE id_de_caso = $1
              `;
              const existingCase = await client.query(existingCaseQuery, [caso.id_de_caso]);
    
              if (existingCase.rows.length === 0) {
                await this.insertCovidCaseProcedure(client, caso);
                result.insertedCount++;
              } else {
                result.duplicateCount++;
              }
            }
          }
    
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          console.error('Error:', error);
          result.errors.push(`Error general: ${error.message}`);
        } finally {
          await dbService.releaseClient(client);
        }
    
        return result;
      }


}

export default new CovidService();