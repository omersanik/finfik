import { NextRequest, NextResponse } from "next/server";
import mailchimp from "@mailchimp/mailchimp_marketing";
import { createClient } from "@supabase/supabase-js";

// Initialize Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY!,
  server: process.env.MAILCHIMP_SERVER_PREFIX!,
});

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type MailchimpMergeFields = {
  FNAME: string;
  LNAME: string;
};

type MailchimpListMember = {
  id: string;
  email_address: string;
  status: string;
  merge_fields: MailchimpMergeFields;
};

type MailchimpError = {
  status: number;
  response?: {
    body?: {
      title?: string;
      detail?: string;
    };
  };
  message?: string;
};

type RequestBody = {
  email: string;
  firstName?: string;
  lastName?: string;
};

// Helper function to safely extract merge fields
function extractMergeFields(
  mergeFields: Record<string, unknown>
): MailchimpMergeFields {
  return {
    FNAME: typeof mergeFields.FNAME === "string" ? mergeFields.FNAME : "",
    LNAME: typeof mergeFields.LNAME === "string" ? mergeFields.LNAME : "",
  };
}

// Type guard to check if response is a success response
function isSuccessResponse(
  response: mailchimp.lists.MembersSuccessResponse | mailchimp.ErrorResponse
): response is mailchimp.lists.MembersSuccessResponse {
  return "id" in response && "email_address" in response;
}

// Helper function to convert Mailchimp response to our type
function convertMailchimpResponse(
  response: mailchimp.lists.MembersSuccessResponse
): MailchimpListMember {
  return {
    id: response.id,
    email_address: response.email_address,
    status: response.status,
    merge_fields: extractMergeFields(response.merge_fields),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { email, firstName, lastName } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required", error: "Missing email" },
        { status: 400 }
      );
    }

    // First, try to add to Mailchimp
    let mailchimpResponse: MailchimpListMember | undefined;
    try {
      const response = await mailchimp.lists.addListMember(
        process.env.MAILCHIMP_AUDIENCE_ID!,
        {
          email_address: email,
          status: "subscribed" as const,
          merge_fields: {
            FNAME: firstName || "",
            LNAME: lastName || "",
          },
        }
      );

      // Check if it's a success response before converting
      if (isSuccessResponse(response)) {
        mailchimpResponse = convertMailchimpResponse(response);
      } else {
        // It's an error response
        console.error("Mailchimp returned error response:", response);
        throw new Error("Mailchimp subscription failed");
      }
    } catch (error: unknown) {
      console.error("Mailchimp error:", error);

      // Type guard for Mailchimp error
      const isMailchimpError = (err: unknown): err is MailchimpError => {
        return typeof err === "object" && err !== null && "status" in err;
      };

      if (isMailchimpError(error)) {
        // Check if it's a duplicate email error
        if (
          error.status === 400 &&
          error.response?.body?.title === "Member Exists"
        ) {
          return NextResponse.json(
            {
              message: "Email is already subscribed",
              error: "Duplicate email",
            },
            { status: 400 }
          );
        }
      }

      // For other Mailchimp errors, still try to save to Supabase
      console.warn(
        "Mailchimp subscription failed, but continuing to save to database"
      );
    }

    // Save to Supabase database
    const { data: supabaseData, error: supabaseError } = await supabase
      .from("email_subscriptions")
      .upsert({
        email: email,
        first_name: firstName || null,
        last_name: lastName || null,
        mailchimp_id: mailchimpResponse?.id || null,
        status: mailchimpResponse ? "subscribed" : "pending",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);

      // If Mailchimp succeeded but Supabase failed
      if (mailchimpResponse) {
        return NextResponse.json(
          {
            message: "Subscribed to newsletter but failed to save to database",
            error: supabaseError.message,
            mailchimp_success: true,
          },
          { status: 207 } // 207 Multi-Status
        );
      } else {
        return NextResponse.json(
          {
            message: "Failed to save subscription",
            error: supabaseError.message,
          },
          { status: 500 }
        );
      }
    }

    // Both services succeeded
    if (mailchimpResponse) {
      return NextResponse.json({
        message: "Successfully subscribed!",
        data: {
          mailchimp: mailchimpResponse,
          database: supabaseData,
        },
      });
    } else {
      // Only database save succeeded
      return NextResponse.json({
        message: "Saved to database (Mailchimp may have failed)",
        data: {
          database: supabaseData,
        },
      });
    }
  } catch (error: unknown) {
    console.error("Unexpected error:", error);

    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: "Subscription failed", error: errorMessage },
      { status: 500 }
    );
  }
}
