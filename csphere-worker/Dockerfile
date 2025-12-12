# Use a Python base image
FROM python:3.10-slim

RUN apt update && apt install -y git
#RUN apk add --no-cache --update openssh-client # in short

# Set the working directory in the container
WORKDIR /app


# Clone the "frontend" directory from your GitHub repositorydd the SSH public keys of the Git server to the known hosts (here, github.com)
RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

RUN apt-get update -y
RUN apt-get install -y python3-dev build-essential
RUN apt-get install -y default-libmysqlclient-dev pkg-config

# bust the cache everytime
COPY timedatenow.txt /etc/

#Clone the repository, notice the "--mount=type=ssh" option, which allow this instruction to use SSH forwarding
RUN --mount=type=ssh git clone 'git@github.com:TipTop-Tech/Csphere-worker.git' /app


# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt
# RUN sed -i -e "s;localhost;127.0.0.1;g" /app/GenZ-backend/server.py


ENV OPENAI_API_KEY=""
ENV OPENROUTER_API_KEY=""

ENV DATABASE_URL=postgresql://uag56q02sraqvf:p6cf033294c0fc829d1de0bd4c07966220b4ee032aad28016c235db4956a5c67b@cd7f19r8oktbkp.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dd3qv54ubqf1hu
ENV ACTIVEMQ_URL='http://feeltiptop.com:8161' 
ENV ACTIVEMQ_QUEUE='CSPHEREQUEUE' 
ENV ACTIVEMQ_USER='admin'
ENV ACTIVEMQ_PASS='tiptop'


# Run the application
CMD python worker.py