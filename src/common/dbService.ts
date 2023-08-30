import { Client, Pool, PoolClient } from 'pg';

class DatabaseService {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: process.env.UserDB,
            host: process.env.Host,
            database: process.env.DB,
            password: process.env.PASS,
            port: 5432,
        });
    }

    async getClient(): Promise<PoolClient> {
        const client = await this.pool.connect();
        console.log('Connected to the database');
        return client;
    }

    async releaseClient(client: PoolClient): Promise<void> {
        client.release();
        console.log('Client released');
    }

    async query(text: string, values?: any[]): Promise<any> {
        const client = await this.getClient();
        try {
            const result = await client.query(text, values);
            return result.rows;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        } finally {
            this.releaseClient(client);
        }
    }
}

export default new DatabaseService();
