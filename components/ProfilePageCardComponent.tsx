import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import MultiavatarPicker from "./MultiavatarPicker";
import { useUser } from "@clerk/nextjs";

const ProfilePageCardComponent = async () => {
  const { userId, getToken } = await auth();
  if (!userId) return <div>You have to sign-in to visit this page!</div>;

  const user = await currentUser();
  const clerkUser = await clerkClient();
  const clerkUserId = await clerkUser.users.getUser(userId);

  const imageUrl = clerkUserId.imageUrl;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const token = await getToken();

  let isPremiumUser = false;

  try {
    const res = await fetch(`${baseUrl}/api/users/premium-users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to fetch user premium status");

    const data = await res.json();
    isPremiumUser = data.is_premium;
  } catch (error) {
    console.error("Error fetching the premium status", error);
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl mb-8">Profile</CardTitle>
          <CardTitle>{user?.firstName}</CardTitle>
          <CardDescription>
            {user?.emailAddresses[0]?.emailAddress}
          </CardDescription>
          <CardAction>
            {/* Single avatar display - from Clerk */}
            <div className="flex flex-col items-start">
              <img
                src={imageUrl}
                alt="User Avatar"
                className="w-20 h-20 rounded-full border mb-2"
              />
              {/* Avatar picker button */}
              <MultiavatarPicker />
            </div>
          </CardAction>
          {isPremiumUser && (
            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm mt-2">
              ⭐ Premium User
            </div>
          )}
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-2 text-xl">
            {isPremiumUser ? (
              ""
            ) : (
              <>
                Status: Regular User{" "}
                <Button className="rounded-xl px-6 text-base hidden sm:block">
                  <Link href="/subscription">Go Premium</Link>
                </Button>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePageCardComponent;
