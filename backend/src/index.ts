import { PrismaClient } from "../prisma/generated/prisma";
import express from "express";
import cors from "cors";
const prisma = new PrismaClient();

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Function to generate unique vkey
function generateVkey(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to check if vkey is unique
async function generateUniqueVkey(): Promise<string> {
  let vkey: string;
  let isUnique = false;

  do {
    vkey = generateVkey();
    const existingOrg = await prisma.org.findFirst({
      where: { vkey: vkey },
    });
    isUnique = !existingOrg;
  } while (!isUnique);

  return vkey;
}

app.post("/org", async (req, res) => {
  try {
    const { id, name } = req.body;

    // Validate required fields
    if (!id || !name) {
      return res.status(400).json("User ID and organization name are required");
    }
    const user = await prisma.user.findFirst({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const { orgCount, premium } = user;

    // Check organization limits
    if (!premium && orgCount >= 1) {
      return res
        .status(400)
        .json("You have already added org. Subscribe to premium to add more");
    }

    if (premium && orgCount >= 5) {
      return res
        .status(400)
        .json("You have reached the maximum limit of 5 organizations");
    }
    const existingOrg = await prisma.org.findFirst({
      where: { name: name },
    });

    if (existingOrg) {
      return res
        .status(400)
        .json("Organization name already exists. Please use a different name");
    }

    // Generate unique vkey
    const vkey = await generateUniqueVkey();

    const result = await prisma.$transaction(async (tx) => {
      const newOrg = await tx.org.create({
        data: {
          name: name,
          userId: id,
          vkey: vkey, // Add the generated vkey
        },
      });

      await tx.user.update({
        where: { id: id },
        data: {
          orgCount: orgCount + 1,
        },
      });

      return newOrg;
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error creating organization:", error);
    return res.status(500).json("Internal server error");
  }
});

app.get("/user/organizations", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json("User ID is required");
    }

    const organizations = await prisma.org.findMany({
      where: { userId: userId as string },
      select: {
        id: true,
        name: true,
        vkey: true, // Include vkey in the response
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return res.status(500).json("Internal server error");
  }
});

app.post("/notifications", async (req, res) => {
  try {
    const { id, orgId, content } = req.body;
    const user = await prisma.user.findFirst({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const org = await prisma.org.findFirst({
      where: { id: orgId, userId: id },
    });

    if (!org) {
      return res
        .status(404)
        .json("Organization not found or you don't have access");
    }

    let currentUserCount = user.dailyNotificationCount;
    const dailyLimit = user.premium ? 50 : 10;

    if (currentUserCount >= dailyLimit) {
      return res
        .status(400)
        .json(
          `Daily notification limit reached. ${
            user.premium ? "Premium" : "Free"
          } users can send ${dailyLimit} notifications per day across all organizations`
        );
    }

    const notification = await prisma.notification.create({
      data: {
        content: content,
        orgId: orgId,
        orgName: org.name,
        senderName: user.name,
        senderId: user.id,
      },
    });

    await prisma.user.update({
      where: { id: id },
      data: {
        dailyNotificationCount: currentUserCount + 1,
      },
    });

    return res.status(201).json(notification);
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json("Internal server error");
  }
});

// Endpoint to verify organization credentials for frontend package
app.post("/verify-org", async (req, res) => {
  try {
    const { orgName, vkey } = req.body;

    // Validate required fields
    if (!orgName || !vkey) {
      return res.status(400).json({
        success: false,
        error: "Organization name and vkey are required"
      });
    }

    // Check if organization exists with matching credentials
    const org = await prisma.org.findFirst({
      where: {
        name: orgName,
        vkey: vkey,
      },
      select: {
        id: true,
        name: true,
        vkey: true,
        createdAt: true,
      }
    });

    if (!org) {
      return res.status(401).json({
        success: false,
        error: "Invalid organization credentials"
      });
    }

    // Return success with organization details
    return res.status(200).json({
      success: true,
      organization: org
    });
  } catch (error) {
    console.error("Error verifying organization:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port 5000");
});
