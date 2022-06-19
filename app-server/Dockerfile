FROM node:18.2.0
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
EXPOSE 8003
CMD ["npm", "start"]
