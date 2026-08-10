"use server"

import { Resend } from "resend"

import { createClient } from "@/lib/supabase/server"

type SubmitSupportResult = {
  success: boolean
  message: string
}

const allowedPriorities = [
  "low",
  "normal",
  "high",
  "urgent",
]

export async function submitSupportRequestAction(
  formData: FormData
): Promise<SubmitSupportResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        message: "You must be signed in to contact support.",
      }
    }

    const subject = String(
      formData.get("subject") || ""
    ).trim()

    const message = String(
      formData.get("message") || ""
    ).trim()

    const priority = String(
      formData.get("priority") || "normal"
    )

    if (!subject) {
      return {
        success: false,
        message: "Subject is required.",
      }
    }

    if (!message) {
      return {
        success: false,
        message: "Support message is required.",
      }
    }

    if (!allowedPriorities.includes(priority)) {
      return {
        success: false,
        message: "Invalid support priority.",
      }
    }

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("team_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

    if (membershipError || !membership) {
      return {
        success: false,
        message: "Unable to identify your organization.",
      }
    }

    const {
      data: organization,
      error: organizationError,
    } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("id", membership.organization_id)
      .single()

    if (organizationError || !organization) {
      return {
        success: false,
        message: "Unable to load your organization.",
      }
    }

    const {
      data: supportRequest,
      error: insertError,
    } = await supabase
      .from("support_requests")
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        user_email: user.email || null,
        subject,
        message,
        priority,
        status: "open",
      })
      .select("id")
      .single()

    if (insertError || !supportRequest) {
      return {
        success: false,
        message:
          insertError?.message ||
          "Unable to create the support request.",
      }
    }

    const resendApiKey =
  process.env.RESEND_API_KEY

const supportToEmail =
  process.env.SUPPORT_TO_EMAIL

if (resendApiKey && supportToEmail) {
  try {
    const resend =
      new Resend(resendApiKey)

    await resend.emails.send({
      from: "Sephomic Support <onboarding@resend.dev>",
      to: supportToEmail,
      replyTo: user.email || undefined,
      subject: `[${priority.toUpperCase()}] ${subject}`,
      text: [
        "New Sephomic Support Request",
        "",
        `Organization: ${organization.name}`,
        `Organization ID: ${organization.id}`,
        `Request ID: ${supportRequest.id}`,
        `Customer Email: ${user.email || "Not available"}`,
        `Priority: ${priority}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    })
  } catch (emailError) {
    console.error(
      "SUPPORT EMAIL ERROR:",
      emailError
    )

    return {
      success: true,
      message:
        "Your support request was submitted successfully. The support center received it, but the email notification could not be sent.",
    }
  }
}

    return {
      success: true,
      message:
        "Your support request was submitted successfully.",
    }
  } catch (error) {
    console.error(
      "SUPPORT SUBMISSION ERROR:",
      error
    )

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to submit your support request.",
    }
  }
}
