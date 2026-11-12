import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import { seedDatabase } from "@/lib/seedData";

import { UserRole } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await seedDatabase();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") || undefined;
    const email = searchParams.get("email") || undefined;

    let user;
    if (email) {
      user = await UserModel.findOne({ email }).lean();
    } else if (role) {
      user = await UserModel.findOne({ role: role.toUpperCase() as UserRole }).lean();
    } else {
      user = await UserModel.findOne({ role: "DOCTOR" }).lean();
    }

    const allUsers = await UserModel.find({}).lean();

    return NextResponse.json({
      success: true,
      currentUser: user,
      availableUsers: allUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
