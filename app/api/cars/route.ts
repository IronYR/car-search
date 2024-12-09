import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 25; // Items per page
  const offset = (page - 1) * limit;

  try {
    let sql = 'SELECT * FROM cars';
    let countSql = 'SELECT COUNT(*) as total FROM cars';
    let params: any[] = [];

    if (query) {
      sql += ' WHERE MATCH(make, model, description) AGAINST(? IN BOOLEAN MODE)';
      countSql += ' WHERE MATCH(make, model, description) AGAINST(? IN BOOLEAN MODE)';
      params.push(query);
    }
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit.toString(), offset.toString());

    const [rows] = await pool.execute(sql, params);
    const [totalRows] = await pool.execute(countSql, query ? params : []);
    // console.log(totalRows)
    const total = (totalRows as any)[0].total;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      cars: rows,
      hasMore,
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