FROM node:20-bookworm

# Install Python
RUN apt-get update \
    && apt-get install -y python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Install Python dependencies
COPY requirements.txt ./
RUN python3 -m venv /app/backend/.venv \
    && /app/backend/.venv/bin/pip install --upgrade pip \
    && /app/backend/.venv/bin/pip install -r requirements.txt

# Copy the project
COPY backend ./backend
COPY data ./data

# Start Express
WORKDIR /app/backend

EXPOSE 4000

CMD ["npm", "start"]
