import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config({ quiet: true });

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export const connectDB = async () => {
    try{
        const client = await pool.connect();
        console.log('Connected to the PostgreSQL Database Successfully!');

        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);
        
        client.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

export default pool;