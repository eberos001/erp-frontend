import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : ""

    const companyName =
      typeof body.companyName === "string"
        ? body.companyName.trim()
        : ""

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : ""

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : ""

    const teamSize =
      typeof body.teamSize === "string"
        ? body.teamSize.trim()
        : ""

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : ""

    if (!fullName) {
      return NextResponse.json(
        { error: "Your name is required." },
        { status: 400 }
      )
    }

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      )
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      )
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Demo request: Supabase server configuration is missing."
      )

      return NextResponse.json(
        { error: "Unable to submit your request." },
        { status: 500 }
      )
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    /*
     * SAVE FIRST.
     * Email delivery must never be the source of truth
     * for a Sephomic sales lead.
     */
    const { data: demoRequest, error: insertError } =
      await supabase
        .from("demo_requests")
        .insert({
          full_name: fullName,
          company_name: companyName,
          email,
          phone: phone || null,
          team_size: teamSize || null,
          message: message || null,
          status: "new",
        })
        .select()
        .single()

    if (insertError || !demoRequest) {
      console.error(
        "DEMO REQUEST INSERT ERROR:",
        insertError
      )

      return NextResponse.json(
        { error: "Unable to submit your demo request." },
        { status: 500 }
      )
    }

    /*
     * EMAIL SECOND.
     * A Resend problem must not delete or reject
     * a successfully stored lead.
     */
    const resendApiKey =
      process.env.RESEND_API_KEY

    const fromEmail =
      process.env.RESEND_FROM_EMAIL

    const businessEmail =
      process.env.SEPHOMIC_BUSINESS_EMAIL

    if (
      resendApiKey &&
      fromEmail &&
      businessEmail
    ) {
      try {
        const resend = new Resend(resendApiKey)

        const internalEmail =
          resend.emails.send({
            from: `Sephomic <${fromEmail}>`,
            to: [businessEmail],
            replyTo: email,
            subject: `New Sephomic Demo Request — ${companyName}`,
            text: [
              "New Sephomic Demo Request",
              "",
              `Name: ${fullName}`,
              `Company: ${companyName}`,
              `Email: ${email}`,
              `Phone: ${phone || "Not provided"}`,
              `Team Size: ${teamSize || "Not provided"}`,
              "",
              "What they would like to improve:",
              message || "Not provided",
              "",
              `Demo Request ID: ${demoRequest.id}`,
            ].join("\n"),
          })

        const customerEmail =
          resend.emails.send({
            from: `Sephomic <${fromEmail}>`,
            to: [email],
            replyTo: businessEmail,
            subject:
              "We received your Sephomic demo request",
            text: [
              `Hello ${fullName},`,
              "",
              "Thank you for requesting a demonstration of Sephomic.",
              "",
              "We have received your request and a member of our team will review the information you provided.",
              "",
              "Our team will contact you directly regarding the next steps.",
              "",
              "Sephomic",
              "Business Intelligence. Built Around Your Business.",
            ].join("\n"),
          })

        const [internalResult, customerResult] =
  await Promise.all([
    internalEmail,
    customerEmail,
  ])

if (internalResult.error) {
  console.error(
    "DEMO INTERNAL EMAIL ERROR:",
    internalResult.error
  )
}

if (customerResult.error) {
  console.error(
    "DEMO CUSTOMER EMAIL ERROR:",
    customerResult.error
  )
}
      } catch (emailError) {
        console.error(
          "DEMO REQUEST EMAIL ERROR:",
          emailError
        )
      }
    } else {
      console.error(
        "Demo request saved, but Resend configuration is incomplete."
      )
    }

    return NextResponse.json({
      success: true,
      message:
        "Your demo request was submitted successfully. We will contact you soon.",
    })
  } catch (error) {
    console.error(
      "DEMO REQUEST ROUTE ERROR:",
      error
    )

    return NextResponse.json(
      { error: "Unable to submit your demo request." },
      { status: 500 }
    )
  }
}
