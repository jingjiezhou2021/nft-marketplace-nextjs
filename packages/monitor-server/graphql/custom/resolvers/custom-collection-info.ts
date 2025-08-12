import { GraphQLUpload, FileUpload } from "graphql-upload-ts";
import { Category, Collection } from "@generated/type-graphql";
import { Context } from "@/graphql";
import SaveImage from "@/src/utils/files/save-image";
import { Field, InputType, Resolver, Mutation, Arg, Ctx } from "type-graphql";

@InputType({ description: "Custom Collection Info Update Input Where" })
class CustomUpdateCollectionInfoWhere {
  @Field()
  address?: string;
  @Field()
  chainId?: number;
}

@InputType({ description: "Custom Collection Info Update Input Data" })
class CustomUpdateCollectionInfoData {
  @Field({ nullable: true })
  nickname?: string;
  @Field({ nullable: true })
  description?: string;
  @Field({ nullable: true })
  url?: string;
  @Field({ nullable: true })
  category?: Category;

  @Field(() => GraphQLUpload, { nullable: true })
  avatar?: FileUpload;
  @Field(() => GraphQLUpload, { nullable: true })
  banner?: FileUpload;
}

@InputType({ description: "Custom Collection Info Update Input" })
class CustomUpdateCollectionInfo {
  @Field()
  where?: CustomUpdateCollectionInfoWhere;
  @Field()
  data?: CustomUpdateCollectionInfoData;
}

@Resolver()
export class CustomCollectionResolver {
  @Mutation((returns) => Collection)
  async customUpdateCollectionInfo(
    @Arg("NewCollectionInfoData")
    { where, data }: CustomUpdateCollectionInfo,
    @Ctx() { prisma }: Context
  ) {
    const collection = await prisma.collection.findFirst({
      where: {
        address: {
          equals: where?.address,
          mode: "insensitive",
        },
        chainId: where?.chainId,
      },
    });
    const newAvatar = data?.avatar ? await SaveImage(data.avatar) : undefined;
    const newBanner = data?.banner ? await SaveImage(data.banner) : undefined;
    if (collection) {
      const newCollection = {
        banner: newBanner,
        avatar: newAvatar,
        nickname: data?.nickname,
        description: data?.description,
        url: data?.url,
        category: data?.category,
      };
      console.log("collection exists, updating...", newCollection);
      const ret = await prisma.collection.update({
        where: {
          id: collection.id,
        },
        data: newCollection,
      });
      return ret;
    } else {
      console.log("collection not exist, throwing error...");
      throw new Error("collection not exist");
    }
  }
}
