const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const defaults = {
  users: [],
  plans: [
    {
      id: 'minecraft-starter',
      name: 'Minecraft Starter',
      type: 'game-server',
      gameType: 'minecraft',
      description: 'Good for a small SMP or friends server.',
      ramGb: 4,
      cpuCores: 2,
      storageGb: 20,
      backupSlots: 2,
      subdomainSlots: 1,
      extraPorts: 1,
      priceMonthly: 8,
      active: true
    },
    {
      id: 'minecraft-pro',
      name: 'Minecraft Pro',
      type: 'game-server',
      gameType: 'minecraft',
      description: 'Better for plugins, modpacks, and more players.',
      ramGb: 8,
      cpuCores: 4,
      storageGb: 50,
      backupSlots: 5,
      subdomainSlots: 2,
      extraPorts: 3,
      priceMonthly: 18,
      active: true
    },
    {
      id: 'discord-bot-hosting',
      name: 'Discord Bot Hosting',
      type: 'bot-hosting',
      gameType: 'discord-bot',
      description: 'Node.js Discord bot hosting with console access.',
      ramGb: 1,
      cpuCores: 1,
      storageGb: 5,
      backupSlots: 1,
      subdomainSlots: 0,
      extraPorts: 1,
      priceMonthly: 4,
      active: true
    }
    ,{
      id: 'vps-starter',
      name: 'VPS Starter',
      type: 'vps',
      gameType: 'vps',
      description: 'Entry VPS for small websites, bots, and light services.',
      ramGb: 2,
      cpuCores: 1,
      storageGb: 30,
      backupSlots: 1,
      subdomainSlots: 0,
      extraPorts: 3,
      priceMonthly: 10,
      active: true
    },
    {
      id: 'vps-pro',
      name: 'VPS Pro',
      type: 'vps',
      gameType: 'vps',
      description: 'More power for panels, websites, bots, and game tools.',
      ramGb: 8,
      cpuCores: 4,
      storageGb: 100,
      backupSlots: 3,
      subdomainSlots: 0,
      extraPorts: 10,
      priceMonthly: 35,
      active: true
    }
  ],
  upgrades: [
    { id: 'ram-2gb', name: '+2GB RAM', kind: 'ramGb', amount: 2, priceMonthly: 4, active: true },
    { id: 'storage-20gb', name: '+20GB Storage', kind: 'storageGb', amount: 20, priceMonthly: 3, active: true },
    { id: 'backup-3-slots', name: '+3 Backup Slots', kind: 'backupSlots', amount: 3, priceMonthly: 2, active: true },
    { id: 'subdomain-2-slots', name: '+2 Subdomain Slots', kind: 'subdomainSlots', amount: 2, priceMonthly: 2, active: true },
    { id: 'ports-2', name: '+2 Extra Ports', kind: 'extraPorts', amount: 2, priceMonthly: 2, active: true }
  ],
  serverTypes: [
    {
      id: 'minecraft',
      name: 'Minecraft',
      variants: [
        { id: 'paper', name: 'Paper', description: 'High performance Minecraft server' },
        { id: 'forge', name: 'Forge', description: 'Modded Minecraft server' },
        { id: 'fabric', name: 'Fabric', description: 'Lightweight modded Minecraft' },
        { id: 'neoforge', name: 'NeoForge', description: 'Modern modded Minecraft' },
        { id: 'bedrock', name: 'Bedrock', description: 'Minecraft Bedrock Edition' }
      ]
    },
    {
      id: 'discord-bot',
      name: 'Discord Bot',
      variants: [
        { id: 'nodejs', name: 'Node.js', description: 'JavaScript/TypeScript bot' },
        { id: 'python', name: 'Python', description: 'Python bot with discord.py' }
      ]
    },
    {
      id: 'vps',
      name: 'VPS',
      variants: [
        { id: 'ubuntu', name: 'Ubuntu', description: 'Ubuntu Linux' },
        { id: 'debian', name: 'Debian', description: 'Debian Linux' },
        { id: 'centos', name: 'CentOS', description: 'CentOS Linux' }
      ]
    },
    {
      id: 'website-hosting',
      name: 'Website Hosting',
      variants: [
        { id: 'nginx', name: 'Nginx', description: 'Nginx web server' },
        { id: 'apache', name: 'Apache', description: 'Apache web server' }
      ]
    }
  ],
  locations: [
    { id: 'us-east', name: 'US East', description: 'Virginia, USA', priceMonthly: 0, active: true },
    { id: 'us-west', name: 'US West', description: 'California, USA', priceMonthly: 2, active: true },
    { id: 'eu-central', name: 'EU Central', description: 'Frankfurt, Germany', priceMonthly: 3, active: true },
    { id: 'asia-east', name: 'Asia East', description: 'Singapore', priceMonthly: 4, active: true },
    { id: 'australia', name: 'Australia', description: 'Sydney, Australia', priceMonthly: 5, active: true }
  ],
  orders: [],
  tickets: [],
  reviews: []
};

function filePath(name) {
  return path.join(dataDir, `${name}.json`);
}

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  for (const [name, value] of Object.entries(defaults)) {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) {
      fs.writeFileSync(fp, JSON.stringify(value, null, 2));
    }
  }
}

function getStore(name) {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(filePath(name), 'utf8'));
}

function saveStore(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

module.exports = { ensureDataFiles, getStore, saveStore };
