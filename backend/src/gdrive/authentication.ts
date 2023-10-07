import { envs } from "../env.js";

export const getGoogleCloudCredentials = () => ({
  projectId: envs.gcloudProjectId,
  credentials: {
    client_email: envs.gcloudEmail,
    private_key: envs.gcloudPrivateKey
      ? envs.gcloudPrivateKey.replace(/\\n/gm, "\n")
      : envs.gcloudPrivateKey,
  },
});
