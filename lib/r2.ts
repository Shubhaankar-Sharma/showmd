import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const bucket = process.env.R2_BUCKET_NAME || "showmd";

export async function uploadToR2(
  key: string,
  body: string,
  contentType: string
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(body),
      ContentType: contentType,
    })
  );
}

export async function getFromR2(key: string): Promise<string | null> {
  try {
    const res = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    return (await res.Body?.transformToString()) ?? null;
  } catch {
    return null;
  }
}

export async function deleteFromR2(key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function deletePrefixFromR2(prefix: string): Promise<void> {
  const res = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })
  );
  if (res.Contents) {
    await Promise.all(
      res.Contents.map((obj) =>
        obj.Key ? deleteFromR2(obj.Key) : Promise.resolve()
      )
    );
  }
}
