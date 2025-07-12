import {
  PrismaClient,
  USER_ROLE,
  FileType,
  NotificationType,
  RequestStatus,
  RequestType,
} from "../src/generated/prisma";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Create Branch
  const branch = await prisma.branch.create({
    data: {
      name: "Computer Science",
      duration: 4,
    },
  });

  // Create Semester
  const semester = await prisma.semester.create({
    data: {
      name: "Semester 1",
      branchId: branch.id,
    },
  });

  // Create Subject
  const subject = await prisma.subject.create({
    data: {
      name: "Data Structures",
      semesterId: semester.id,
    },
  });

  // Create Unit
  const unit = await prisma.unit.create({
    data: {
      name: "Arrays and Strings",
      subjectId: subject.id,
    },
  });

  // Create Users
  const users = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: "user1@example.com",
        password: "password123",
        fullName: "Alice Johnson",
        role: USER_ROLE.USER,
        branchId: branch.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "mod1@example.com",
        password: "password123",
        fullName: "Bob Moderator",
        role: USER_ROLE.MOD,
        branchId: branch.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "admin1@example.com",
        password: "password123",
        fullName: "Carol Admin",
        role: USER_ROLE.ADMIN,
        branchId: branch.id,
      },
    }),
  ]);
  const [user1] = users;

  // Create 30 Contents
  const contents = await Promise.all(
    Array.from({ length: 30 }).map(async (_, i) => {
      const content = await prisma.content.create({
        data: {
          title: faker.lorem.words(5),
          description: faker.lorem.paragraph(),
          imageUrl: faker.image.url(),
          uploadedBy: user1.id,
          branchId: branch.id,
          semesterId: semester.id,
          subjectId: subject.id,
          unitId: unit.id,
          status: faker.datatype.boolean(),
          relatedVideos: {
            create: [
              {
                videoTitle: faker.lorem.sentence(),
                videoDescription: faker.lorem.sentences(2),
                videoUrl: faker.internet.url(),
              },
            ],
          },
          File: {
            create: {
              name: `File-${i + 1}`,
              url: faker.internet.url(),
              size: faker.number.int({ min: 100, max: 5000 }),
              type: faker.helpers.arrayElement([
                FileType.pdf,
                FileType.docs,
                FileType.txt,
              ]),
            },
          },
        },
      });

      return content;
    })
  );

  console.log(`✅ Seeded ${contents.length} contents`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
