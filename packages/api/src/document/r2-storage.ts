import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@afterhive/shared";

export type DocumentStoragePutInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type DocumentStorageGetSignedUrlInput = {
  key: string;
  expiresInSeconds: number;
};

export type DocumentStorage = {
  putObject(input: DocumentStoragePutInput): Promise<void>;
  getSignedUrl(input: DocumentStorageGetSignedUrlInput): Promise<string>;
};

let storageOverride: DocumentStorage | null = null;

export function setDocumentStorageForTests(storage: DocumentStorage | null) {
  storageOverride = storage;
}

function createR2Storage(): DocumentStorage {
  const env = getEnv();

  if (!env.R2_ENDPOINT || !env.R2_BUCKET_NAME || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("r2_not_configured");
  }

  const client = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  return {
    async putObject(input) {
      await client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType,
        }),
      );
    },
    async getSignedUrl(input) {
      return getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: input.key,
        }),
        { expiresIn: input.expiresInSeconds },
      );
    },
  };
}

export function getDocumentStorage(): DocumentStorage {
  if (storageOverride) {
    return storageOverride;
  }

  return createR2Storage();
}
