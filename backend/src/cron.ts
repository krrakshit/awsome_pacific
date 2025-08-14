import { PrismaClient } from "../prisma/generated/prisma";
import cron from "node-cron";
const prisma = new PrismaClient();

async function resetDailyNotificationCounts(): Promise<void> {
  try {
    const currentTime = new Date();
    const result = await prisma.user.updateMany({
      data: {
        dailyNotificationCount: 0,
        lastNotificationReset: currentTime,
      },
    });

    console.log(
      `Daily notification counts reset for ${
        result.count
      } users at ${currentTime.toISOString()}`
    );
  } catch (error) {
    console.error("Error resetting daily notification counts:", error);
  }
}

// Schedule the reset function to run daily at midnight (00:00)
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Running daily notification count reset...");
    await resetDailyNotificationCounts();
  },
  {
    timezone: "IST", 
  }
);
