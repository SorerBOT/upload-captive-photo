export const envs = {
  get gserviceEmail() {
    return process.env.GSERVICE_EMAIL;
  },
  get gserviceKey() {
    return process.env.GSERVICE_KEY;
  },
  get jwtKey() {
    return process.env.JWT_KEY;
  },
  get googleClientId() {
    return process.env.GOOGLE_CLIENT_ID;
  },
  get googleClientSecret() {
    return process.env.GOOGLE_CLIENT_SECRET;
  },
  get jwtServiceURL() {
    return process.env.JWT_SERVICE_URL;
  },
  get jwtServiceToken() {
    return process.env.JWT_SERVICE_TOKEN;
  },
  // One audience or comma separated list of audiences
  get cfAudience() {
    return process.env.CF_AUDIENCE;
  },
  get cfPublicCertsUrl() {
    return process.env.CF_PUBLIC_CERTS_URL;
  },
  get gcloudProjectId() {
    return process.env.GOOGLE_CLOUD_PROJECT_ID;
  },
  get gcloudEmail() {
    return process.env.GOOGLE_CLOUD_EMAIL;
  },
  get gcloudPrivateKey() {
    return process.env.GOOGLE_CLOUD_PRIVATE_KEY;
  },
};
