 import "dotenv/config";
import fs from "fs";
import { parse } from "csv-parse/sync";

const csvPath = "./clerk_users_cleaned.csv";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is missing from .env");
}

const csv = fs.readFileSync(csvPath, "utf8");

const users = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

console.log(`Found ${users.length} users in CSV`);

const results = [];

for (const user of users) {
  try {
    const body = {
      email_address: user.primary_email_address
        ? [user.primary_email_address]
        : undefined,

      first_name: user.first_name || undefined,
      last_name: user.last_name || undefined,
      username: user.username || undefined,

      // Keep the old Clerk ID so we can map it later.
      external_id: user.id,
        skip_password_requirement: true,
    };

    // Remove undefined fields
    Object.keys(body).forEach((key) => {
      if (body[key] === undefined) {
        delete body[key];
      }
    });

    const response = await fetch(
      "https://api.clerk.com/v1/users",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        `❌ Failed: ${user.primary_email_address}`,
        data
      );

      results.push({
        oldClerkId: user.id,
        email: user.primary_email_address,
        success: false,
        error: data,
      });

      continue;
    }

    console.log(
      `✅ ${user.primary_email_address} → ${data.id}`
    );

    results.push({
      oldClerkId: user.id,
      newClerkId: data.id,
      email: user.primary_email_address,
      success: true,
    });
  } catch (error) {
    console.error(
      `❌ Error migrating ${user.primary_email_address}:`,
      error.message
    );
  }
}

fs.writeFileSync(
  "./clerk-migration-results.json",
  JSON.stringify(results, null, 2)
);

console.log("\nMigration finished.");
console.log("Results saved to clerk-migration-results.json");