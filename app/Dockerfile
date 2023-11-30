FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies using pnpm
COPY package.json .
# RUN npm install -g pnpm && pnpm install --only=prod
RUN npm install --only=prod

# Copy only necessary files and directories, excluding node_modules and other unwanted files
COPY upload/ upload/
COPY src/ src/
COPY upload/ upload/

COPY .env .
COPY tsconfig.json .


# Install dependencies, including Prisma, and generate Prisma client during build
RUN npm install

EXPOSE 3000

# Specify the command to run your application
CMD ["npm", "start"]
