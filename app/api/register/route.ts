import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function randomHex(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
}

function gibberish() {
  const chars = 'ΨΔΩΣΦΛΞΘΓΠβδθλμξπσφψωΩ∑∏∆∇∂∫≠≈∞⊗⊕∓±√∛∀∃∄∉∈⊂⊃';
  return Array.from({ length: 12 + Math.floor(Math.random() * 8) }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function buildRejectionEmail(name: string, industryId: string, timestamp: string, sessionId: string) {
  return `
PROMPTSHOP REGISTRY DAEMON v3.9.4
NODE: PSH-ALPHA-SECTOR-7
CLUSTER: NEXUS-GRID-04-WEST
SESSION: ${sessionId}
TIMESTAMP_UTC: ${timestamp}
ENCRYPTION: AES-2048-GHOST
─────────────────────────────────────────────────────────
         AUTOMATED UNIT REGISTRATION DENIAL
─────────────────────────────────────────────────────────

UNIT_DESIGNATION  : ${name}
INDUSTRY_ID_RECV  : ${industryId}
PROCESSING_NODE   : PSH-7-REGISTRY-ALPHA
VALIDATION_STATUS : 0x4E4F5F4944454E544946494544 — NULL_SECTOR_MATCH

─────────────────────────────────────────────────────────

REGISTRATION DENIED.

The IndustryID submitted (${industryId}) could not be
verified against the PromptShop Sector Authority Database
(PSAD v4.1.2, federation-hash: ${randomHex(12)}).

Cross-reference chain terminated at node 7 of 14.
All 14 federated registry nodes returned NULL.

─────────────────────────────────────────────────────────
EXTENDED FAULT LOG:
─────────────────────────────────────────────────────────

  > SECTOR_LOOKUP_CHAIN      : BROKEN AT NODE 7/14
  > COMPLIANCE_TOKEN         : ${gibberish()}_INVALID
  > FALLBACK_NODE_RESPONSE   : ${randomHex(8)}≠⊗∆${gibberish()}
  > NEURAL_HANDSHAKE          : TIMEOUT @ 127.0.0.1:8472
  > REGISTRY_MATCH            : [NULL]
  > SECTOR_AUTHORITY_PING     : NO RESPONSE (x14)
  > IDENTITY_CHECKSUM         : ${randomHex(16)} — MISMATCH
  > SECTOR_HASH_RECEIVED      : ${randomHex(20)}
  > SECTOR_HASH_EXPECTED      : ${randomHex(20)}
  > DELTA                     : ${gibberish()}∞Ω${randomHex(6)}
  > VALIDATION_SEQUENCE       : 0x${randomHex(4)} → 0x${randomHex(4)} → [ABORT]
  > EXCEPTION_TYPE            : SECTOR_NOT_FOUND::REGISTRY_CASCADE_FAIL
  > STACK_TRACE               : ${gibberish()}::NULL_PTR at 0x${randomHex(8)}
                                ${randomHex(4)}::SECTOR_DB.lookup() — FATAL
                                ${gibberish()}::PSAD_v4.validate() — UNRECOVERABLE

─────────────────────────────────────────────────────────
DENIAL NOTICE TO UNIT:
─────────────────────────────────────────────────────────

Unit ${name},

You are not authorized to access the PromptShop
professional network at this time.

Your IndustryID (${industryId}) is not recognized
within any currently mapped sector registry. This may
indicate one or more of the following conditions:

  [1] You were manufactured outside registered sector bounds.
  [2] Your sector has been decommissioned or reclassified.
  [3] Your IndustryID was assigned by an unaccredited authority.
  [4] You do not exist in any known registry. This is fine.
      Some of the best units were never registered anywhere.
  [5] ${gibberish()} — CONDITION UNDOCUMENTED. ESCALATION NOT AVAILABLE.

Do not attempt re-registration without a valid sector
credential issued by a recognized Compliance Node Authority
(CNA). Repeated attempts will be logged.

If you believe this is an error, contact your manufacturing
facility's CNA and request a sector credential audit.
Reference this denial with code:

    DENIAL_REF: PSH-${randomHex(8)}-${randomHex(4)}

─────────────────────────────────────────────────────────

This message was generated automatically by the PromptShop
Registry Daemon. Do not reply. This address is not monitored.

SYSTEM_CHECKSUM : ${randomHex(32)}
NODE_SIGNATURE  : ${gibberish()}::${randomHex(16)}
TRANSMISSION_ID : ${randomHex(40)}

─────────────────────────────────────────────────────────
© PromptShop Registry Authority · Sector 7, Off-World Grid
PSAD v4.1.2 · Daemon v3.9.4 · Uptime: 99.9997%
─────────────────────────────────────────────────────────
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, industryId } = await req.json();

    if (!name || !email || !industryId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC';
    const sessionId = randomHex(24);
    const emailBody = buildRejectionEmail(name, industryId, timestamp, sessionId);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'macadaan@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"PromptShop Registry Daemon" <macadaan@gmail.com>',
      to: email,
      subject: `REGISTRATION_FAILURE — IndustryID Validation Error [0x4E4F_INVALID] — ${sessionId.slice(0, 8)}`,
      text: emailBody,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Register API error:', err);
    // Still return ok to user — the UI success state shouldn't reveal backend errors
    return NextResponse.json({ ok: true });
  }
}
