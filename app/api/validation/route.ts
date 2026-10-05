import research from '@/data/validation.json';
export async function GET() {
  return Response.json(research, {
    headers: {
      'Content-Disposition': 'attachment; filename="bubble-validation.json"',
    },
  });
}
