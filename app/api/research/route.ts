import dotcom from '@/data/dotcom.json';
import ecosystem from '@/data/ecosystem.json';
export async function GET() {
  return Response.json(
    { dotcom, ecosystem },
    {
      headers: {
        'Content-Disposition': 'attachment; filename="ai-bubble-research.json"',
      },
    },
  );
}
