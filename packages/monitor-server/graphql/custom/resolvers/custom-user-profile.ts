import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";
import { UserProfile } from "@generated/type-graphql";
import { Context } from "@/graphql";
import SaveImage from "@/src/utils/files/save-image";

@InputType({ description: "UserProfile Data" })
class UserProfileInputData {
  @Field()
  address?: string;
  @Field({ nullable: true })
  username?: string;
  @Field({ nullable: true })
  bio?: string;
  @Field({ nullable: true })
  url?: string;
  @Field(() => GraphQLUpload, { nullable: true })
  avatar?: FileUpload;
  @Field(() => GraphQLUpload, { nullable: true })
  banner?: FileUpload;
}

@Resolver()
export class CustomUserProfileResolver {
  @Mutation((returns) => UserProfile)
  async updateUserAvatar(
    @Arg("NewUserProfileData")
    { address, username, bio, url, avatar, banner }: UserProfileInputData,
    @Ctx() { prisma }: Context
  ) {
    const user = await prisma.userProfile.findFirst({
      where: {
        address: {
          equals: address,
          mode: "insensitive",
        },
      },
    });
    const newAvatar = avatar ? await SaveImage(avatar) : undefined;
    const newBanner = banner ? await SaveImage(banner) : undefined;
    if (user) {
      const newUser = {
        banner: newBanner,
        avatar: newAvatar,
        username,
        bio,
        url,
      };
      console.log("user exists, updating...", newUser);
      const ret = await prisma.userProfile.update({
        where: {
          id: user.id,
        },
        data: newUser,
      });
      return ret;
    } else {
      console.log("user not exist, creating...");
      const newUser = {
        address:address!,
        username,
        bio,
        url,
        avatar: newAvatar,
        banner: newBanner,
      };
      const ret = await prisma.userProfile.create({
        data: newUser,
      });
      return ret;
    }
  }
}
