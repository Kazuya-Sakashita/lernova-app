import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ロールの作成
  const userRole = await prisma.role.create({
    data: {
      role_name: "USER",
    },
  });

  // ユーザーの作成
  const user = await prisma.user.create({
    data: {
      supabaseUserId: "123456",
      roleId: userRole.id,
      nickname: "user1",
      profile: {
        create: {
          first_name: "John",
          last_name: "Doe",
          date_of_birth: new Date("1990-01-01"),
          gender: "male",
          profile_picture: "https://example.com/profile.jpg",
          bio: "This is a bio.",
          phoneNumber: "1234567890",
          socialLinks: "https://twitter.com/user1",
        },
      },
    },
  });

  // カテゴリの作成
  const category = await prisma.category.create({
    data: {
      category_name: "Technology",
    },
  });

  // 学習記録の作成
  await prisma.learningRecord.create({
    data: {
      userId: user.id,
      categoryId: category.id,
      title: "Prisma Basics",
      content: "Learning how to use Prisma ORM",
      start_time: new Date(),
      end_time: new Date(),
      duration: 1.5, // 時間
      learning_date: new Date(),
    },
  });

  console.log("Initial data has been seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
