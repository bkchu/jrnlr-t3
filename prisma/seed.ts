import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
const prisma = new PrismaClient();

const updatePostsToUseAuthorUsernameForeignKey = async () => {
  const posts = await prisma.post.findMany();
  const promises = posts.map((post) => {
    return prisma.user
      .findUnique({
        where: {
          username: post.authorUsername,
        },
      })
      .then((user) => {
        return prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            author: {
              connect: {
                id_username: {
                  id: user?.id as string,
                  username: user?.username as string,
                },
              },
            },
          },
        });
      });
  });

  return Promise.all(promises);
};

const addSlugsToAllPosts = async () => {
  const posts = await prisma.post.findMany();
  const promises = posts.map((post) => {
    return prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        slug: slugify(post.title, {
          lower: true, // convert to lower case, defaults to `false`
          strict: true, // strip special characters except replacement, defaults to `false`
          trim: true, // trim leading and trailing replacement chars, defaults to `true`
        }),
      },
    });
  });

  return Promise.all(promises);
};

async function main() {
  // return updatePostsToUseAuthorUsernameForeignKey();
  return addSlugsToAllPosts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
