import express from "express";
import {
  getMarketContractOfChain,
  getProviderOfChain,
} from "@/src/utils/contracts";
import { TypeChain } from "smart-contract";
import { PrismaClient } from "@/prisma/generated/prisma";
import fetch, { HeadersInit } from "node-fetch";

const router = express.Router();
router.get("/check-ownership/:chainId/:address/:tokenId", async (req, res) => {
  const chainId = parseInt(req.params.chainId);
  const { address } = req.params;
  const tokenId = parseInt(req.params.tokenId);
  console.log("checking ownership of nft", { address, tokenId, chainId });
  const provider = getProviderOfChain(chainId);
  const nftContract = TypeChain.IERC721__factory.connect(address, provider);
  const currentOwner = await nftContract.ownerOf(tokenId);
  const prisma = new PrismaClient();
  const nftInDb = await prisma.nFT.findFirst({
    where: {
      contractAddress: {
        equals: address,
        mode: "insensitive",
      },
      tokenId,
      collection: {
        is: {
          chainId,
        },
      },
    },
    include: {
      user: true,
      activeItem: true,
    },
  });
  const marketContract = getMarketContractOfChain(chainId);
  const existsingListing = await marketContract?.getPrice(
    currentOwner,
    address,
    tokenId
  );
  if (
    (await marketContract?.getIsListed(currentOwner, address, tokenId)) &&
    !nftInDb?.activeItem &&
    existsingListing &&
    nftInDb
  ) {
    console.log(
      "there was a existing listing on chain, and there is no active item for it, recreating it in db..."
    );
    await prisma.activeItem.create({
      include: {
        listing: true,
      },
      data: {
        seller: currentOwner,
        nftAddress: address,
        tokenId,
        chainId,
        nft: {
          connect: {
            id: nftInDb.id,
          },
        },
        listing: {
          create: {
            price: existsingListing[0].toString(),
            erc20TokenAddress: existsingListing[1],
            erc20TokenName: existsingListing[2],
          },
        },
      },
    });
  }
  const ownerInDb = nftInDb?.user.address;
  console.log("current owner:", currentOwner);
  console.log("owner in db:", ownerInDb);
  if (currentOwner.toLowerCase() !== ownerInDb?.toLowerCase()) {
    console.log("the owner has changed, updating nft in db...");
    if (nftInDb?.activeItem?.id) {
      await prisma.activeItem.delete({
        where: {
          id: nftInDb.activeItem.id,
        },
      });
      console.log("delete old active item");
    }
    let newOwner = await prisma.userProfile.findFirst({
      where: {
        address: {
          equals: currentOwner,
          mode: "insensitive",
        },
      },
    });
    if (!newOwner) {
      console.log("new owner not exists in db, creating it...");
      newOwner = await prisma.userProfile.create({
        data: {
          address: currentOwner,
        },
      });
    } else {
      console.log("new owner exists in db");
    }
    await prisma.nftMarketplace__ItemTransfered.create({
      data: {
        sender: ownerInDb!,
        receiver: currentOwner,
        nftAddress: address,
        tokenId,
        chainId,
        nftId: nftInDb?.id,
      },
    });
    await prisma.nFT.update({
      where: {
        id: nftInDb?.id,
      },
      data: {
        userId: newOwner.id,
      },
    });
    console.log("update successful,tell browser to refresh");
    res.json({
      refresh: true,
    });
  } else {
    console.log("the owner is consistent,no need to refresh");
    res.json({ refresh: false });
  }
});
router.all("/proxy", async (req, res) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res
        .status(400)
        .json({ error: "Missing or invalid url parameter" });
    }

    // Forward headers (avoid host & connection to prevent conflicts)
    const headers: HeadersInit = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value && !["host", "connection"].includes(key.toLowerCase())) {
        if (key.toLowerCase() === "accept-encoding") {
          headers[key] = "gzip";
        } else {
          headers[key] = Array.isArray(value) ? value.join(",") : value;
        }
      }
    }

    // Make the request
    const response = await fetch(url, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.body ? JSON.stringify(req.body) : undefined,
    });

    // Forward content-type header
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    // Status code
    res.status(response.status);

    if (contentType?.includes("json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error" });
  }
});

export default router;
