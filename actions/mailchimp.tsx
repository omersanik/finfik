"use server";
const { NextApiRequest, NextApiResponse } = require("next");
const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY!,
  server: process.env.MAILCHIMP_SERVER_PREFIX!,
});

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

type ResponseData =
  | { message: string; data: MailchimpListMember }
  | { message: string; error: string };

export default async function addToMailchimp(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed", error: "Method not allowed" });
  }

  const { email, firstName, lastName } = req.body as {
    email?: string;
    firstName?: string;
    lastName?: string;
  };

  if (!email)
    return res
      .status(400)
      .json({ message: "Email is required", error: "Missing email" });

  try {
    const response: MailchimpListMember = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID!,
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName || "",
          LNAME: lastName || "",
        },
      }
    );
    return res.status(200).json({ message: "Subscribed", data: response });
  } catch (error: unknown) {
    console.log(error);
    let errorMessage = "UnkownError";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const maybeError = error as { response?: { body?: { detail?: string } } };
      errorMessage = maybeError.response?.body?.detail || errorMessage;
    }

    return res.status(500).json({
      message: "Subscription Failed",
      error: errorMessage,
    });
  }
}
