import { NextResponse, type NextRequest } from 'next/server'
import { createServiceRoleClient, requireAal2Admin } from '@/lib/supabaseServer'

const documentTypes = ['registration', 'insurance'] as const
const actions = ['approved', 'rejected', 'needs_update'] as const
const reasonCodes = ['missing_document', 'expired_document', 'unreadable_document', 'unsupported_document', 'information_mismatch', 'manual_review_required'] as const

type DocumentType = typeof documentTypes[number]
type ReviewAction = typeof actions[number]
type ReasonCode = typeof reasonCodes[number]

type ReviewRequest = {
  subjectUserId?: unknown
  documentType?: unknown
  action?: unknown
  reasonCode?: unknown
}

function isDocumentType(value: unknown): value is DocumentType {
  return typeof value === 'string' && documentTypes.includes(value as DocumentType)
}

function isReviewAction(value: unknown): value is ReviewAction {
  return typeof value === 'string' && actions.includes(value as ReviewAction)
}

function isReasonCode(value: unknown): value is ReasonCode {
  return typeof value === 'string' && reasonCodes.includes(value as ReasonCode)
}

export async function GET(request: NextRequest) {
  try {
    if (!await requireAal2Admin(request)) {
      return NextResponse.json({ error: 'Administrator MFA verification is required.' }, { status: 403 })
    }

    const client = createServiceRoleClient()
    const { data, error } = await client
      .from('driver_eligibility')
      .select('user_id, registration_status, registration_expires_on, registration_document_path, registration_rejection_code, insurance_status, insurance_expires_on, insurance_document_path, insurance_rejection_code, overall_status, updated_at')
      .in('overall_status', ['pending', 'rejected', 'expired'])
      .order('updated_at', { ascending: true })
    if (error) throw error

    const submissions = (data || []).map(item => ({
      user_id: item.user_id,
      registration_status: item.registration_status,
      registration_expires_on: item.registration_expires_on,
      registration_rejection_code: item.registration_rejection_code,
      has_registration_document: Boolean(item.registration_document_path),
      insurance_status: item.insurance_status,
      insurance_expires_on: item.insurance_expires_on,
      insurance_rejection_code: item.insurance_rejection_code,
      has_insurance_document: Boolean(item.insurance_document_path),
      overall_status: item.overall_status,
      updated_at: item.updated_at,
    }))
    return NextResponse.json({ submissions })

  } catch (error) {
    console.error('Admin Driver Eligibility queue failed', { message: error instanceof Error ? error.message : 'Unknown server error' })
    return NextResponse.json({ error: 'Driver eligibility review is temporarily unavailable. Please try again later.' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAal2Admin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Administrator MFA verification is required.' }, { status: 403 })
    }

    const body = await request.json() as ReviewRequest
    if (typeof body.subjectUserId !== 'string' || !isDocumentType(body.documentType) || !isReviewAction(body.action)) {
      return NextResponse.json({ error: 'A subject, document type, and valid review action are required.' }, { status: 400 })
    }
    if (body.action !== 'approved' && !isReasonCode(body.reasonCode)) {
      return NextResponse.json({ error: 'A valid reason is required for this review action.' }, { status: 400 })
    }

    const client = createServiceRoleClient()
    const { data: current, error: lookupError } = await client
      .from('driver_eligibility')
      .select('registration_status, insurance_status')
      .eq('user_id', body.subjectUserId)
      .maybeSingle()
    if (lookupError) throw lookupError
    if (!current) return NextResponse.json({ error: 'Eligibility submission was not found.' }, { status: 404 })

    const status = body.action === 'approved' ? 'approved' : 'rejected'
    const otherStatus = body.documentType === 'registration' ? current.insurance_status : current.registration_status
    const overallStatus = status === 'approved' && otherStatus === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'
    const update = body.documentType === 'registration'
      ? { registration_status: status, registration_rejection_code: body.action === 'approved' ? null : body.reasonCode, overall_status: overallStatus }
      : { insurance_status: status, insurance_rejection_code: body.action === 'approved' ? null : body.reasonCode, overall_status: overallStatus }
    const { error: updateError } = await client.from('driver_eligibility').update(update).eq('user_id', body.subjectUserId)
    if (updateError) throw updateError

    const { error: auditError } = await client.from('driver_eligibility_review_audit').insert({
      subject_user_id: body.subjectUserId,
      reviewer_user_id: admin.user.id,
      action: body.action,
      reason_code: body.action === 'approved' ? null : body.reasonCode,
    })
    if (auditError) throw auditError

    return NextResponse.json({ saved: true, overallStatus })
  } catch (error) {
    console.error('Admin Driver Eligibility review failed', { message: error instanceof Error ? error.message : 'Unknown server error' })
    return NextResponse.json({ error: 'Driver eligibility review is temporarily unavailable. Please try again later.' }, { status: 503 })
  }
}
