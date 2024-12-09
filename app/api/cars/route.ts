import { NextResponse } from 'next/server';
import { createPool } from 'mysql2/promise';

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 25;
  const offset = (page - 1) * limit;

  try {
    const connection = await pool.getConnection();
    
    let sql = 'SELECT * FROM cars';
    let countSql = 'SELECT COUNT(*) as total FROM cars';
    let params: string[] = [];
    let countParams: string[] = [];

    if (query) {
      sql += ' WHERE MATCH(make, model, description) AGAINST(? IN BOOLEAN MODE)';
      countSql += ' WHERE MATCH(make, model, description) AGAINST(? IN BOOLEAN MODE)';
      params.push(query);
      countParams.push(query);
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit.toString(), offset.toString());

    const [rows] = await connection.execute(sql, params);
    const [countResult] = await connection.execute(countSql, countParams);
    connection.release();

    const total = (countResult as any)[0].total;

    return NextResponse.json({
      cars: rows,
      hasMore: offset + limit < total,
      total
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}