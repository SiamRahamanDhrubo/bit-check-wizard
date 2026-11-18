import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const bucket = 'mcedit-apks';
const maxFileSize = 500 * 1024 * 1024;
const apkCorsHeaders = {
  ...corsHeaders,
  'Access-Control-Allow-Headers': `${corsHeaders['Access-Control-Allow-Headers']}, x-upload-password`,
};
const allowedFiles = new Set([
  'minecraft-arm-v8a-with-music.apk',
  'minecraft-arm-v8a-without-music.apk',
  'minecraft-armeabi-with-music.apk',
  'minecraft-armeabi-without-music.apk',
]);

function reply(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...apkCorsHeaders, 'Content-Type': 'application/json' },
  });
}

async function secureEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ]);
  const a = new Uint8Array(leftHash);
  const b = new Uint8Array(rightHash);
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: apkCorsHeaders });
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return reply({ error: 'Storage service is unavailable' }, 500);

  let body: { action?: unknown; filename?: unknown; size?: unknown };
  try {
    body = await request.json();
  } catch {
    return reply({ error: 'Invalid request body' }, 400);
  }

  if (typeof body.filename !== 'string' || !allowedFiles.has(body.filename)) {
    return reply({ error: 'Choose one of the supported APK filenames' }, 400);
  }

  const storage = createClient(supabaseUrl, serviceRoleKey).storage.from(bucket);

  if (body.action === 'download') {
    const { data, error } = await storage.createSignedUrl(body.filename, 60 * 60, {
      download: body.filename,
    });
    if (error) {
      if (error.statusCode === '404') return reply({ available: false });
      console.error('Unable to sign APK download:', error.message);
      return reply({ error: 'Could not prepare this download' }, 500);
    }
    return reply({ available: true, signedUrl: data.signedUrl });
  }

  if (body.action !== 'upload') return reply({ error: 'Unsupported action' }, 400);

  const uploadPassword = Deno.env.get('MCEDIT_APK_UPLOAD_PASSWORD');
  const suppliedPassword = request.headers.get('x-upload-password') ?? '';
  if (!uploadPassword || !(await secureEqual(suppliedPassword, uploadPassword))) {
    return reply({ error: 'Upload password was not accepted' }, 401);
  }

  if (typeof body.size !== 'number' || !Number.isSafeInteger(body.size) || body.size < 1 || body.size > maxFileSize) {
    return reply({ error: 'APK must be between 1 byte and 500 MB' }, 400);
  }

  const { data, error } = await storage.createSignedUploadUrl(body.filename, { upsert: true });
  if (error) {
    console.error('Unable to sign APK upload:', error.message);
    return reply({ error: 'Could not prepare this upload' }, 500);
  }

  return reply({ signedUrl: data.signedUrl, filename: data.path });
});