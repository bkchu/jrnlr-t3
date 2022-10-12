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

const clearDb = async () => {
  await prisma.commentLike.deleteMany({});
  await prisma.postLike.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
};

const add100Posts = async () => {
  const user = await prisma.user.findFirst();
  const latestPost = await prisma.post.findFirst({
    orderBy: {
      id: "desc",
    },
  });
  const latestPostId = latestPost?.id ?? 0;
  const posts = await prisma.post.createMany({
    data: new Array(100).fill({}).map((el, index) => ({
      authorUsername: user?.username as string,
      content: `Post content ${latestPostId + index + 1}`,
      title: `Post Title ${latestPostId + index + 1}`,
      slug: `post-title-${latestPostId + index + 1}`,
      isPublished: true,
      isPrivate: false,
    })),
  });

  return posts;
};

const convertPostsToAutoIncrement = async () => {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const promises = posts.map((post: { id: any }, i: number) => {
    const newId = `${i + 1}`;
    // go through each comment with the post id, and update the comment's post id
    const arr = [
      prisma.comment.updateMany({
        where: {
          postId: post.id,
        },
        data: {
          postId: newId as any,
        },
      }),
      prisma.postLike.updateMany({
        where: {
          postId: post.id,
        },
        data: {
          postId: newId as any,
        },
      }),
      prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          id: newId as any,
        },
      }),
    ];
    // go through each postLike with the postId, and update the postLike's post id
    return Promise.all(arr);
  });

  await Promise.all(promises);
};

async function main() {
  console.log("~~~SEEDING~~~");
  // await convertPostsToAutoIncrement();
  await add100Posts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => {
    console.log("~~~SEEDING END~~~");
  });
