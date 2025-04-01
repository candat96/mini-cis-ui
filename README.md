# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Docker Compose Deployment

This project includes Docker and Docker Compose configuration for easy deployment. The Docker Compose setup uses environment variables from a `.env` file.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Modify the `.env` file with your specific configuration:
   ```
   PORT=3000
   NODE_ENV=production
   NEXT_PUBLIC_API_BASE_URL=http://103.163.215.106:1551
   ```

3. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

4. Access the application at http://localhost:3000 (or the port you specified in the `.env` file)

### Environment Variables

The following environment variables can be configured in your `.env` file:

- `PORT`: The port on which the application will be accessible (default: 3000)
- `NODE_ENV`: The Node.js environment (development, production, test)
- `NEXT_PUBLIC_API_BASE_URL`: The base URL for API requests
- `SKIP_ENV_VALIDATION`: Set to true to skip environment validation (useful for Docker builds)

### Development with Docker Compose

For development, you can use volume mounts to enable hot reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This will mount your local source code into the container, allowing changes to be reflected immediately.
